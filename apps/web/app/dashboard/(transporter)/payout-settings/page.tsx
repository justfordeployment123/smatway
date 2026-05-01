"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import {
  listBanks, resolveBankAccount, setPayoutAccount, getPayoutAccount,
  removePayoutAccount, Bank, PayoutProvider,
} from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ProviderLogo } from "@/components/ProviderLogo";
import { PAYOUT_COUNTRIES, payoutCountryEntry } from "@/lib/payoutCountries";

/**
 * Transporter payout settings — bank account where SmatWay sends earnings.
 *
 * Flow:
 *  1. Pick currency (NGN / GHS / KES / ZAR) → loads bank list
 *  2. Pick bank from dropdown
 *  3. Enter account number → debounced resolve call shows the legal
 *     account name as soon as it's typed correctly (catches typos)
 *  4. Save → server creates Paystack transfer recipient + stores recipient_code
 */
export default function PayoutSettingsPage() {
  const [provider, setProvider] = useState<PayoutProvider>("PAYSTACK");
  // Country is fixed from the user's profile — they don't pick it here.
  // The transporter's profile country is the single source of truth for
  // what currency they receive in (set on /dashboard/profile, restricted
  // there to payout-supported countries). This page only needs to read
  // it, derive the currency, and filter to the providers that support
  // it.
  const [country, setCountry] = useState<string>("NG");
  const countryEntry = payoutCountryEntry(country);
  const currency = countryEntry?.currency ?? "NGN";
  // Providers that can actually settle in this country. Drives BOTH which
  // status cards we render at the top AND whether the modal can open
  // for a given provider — picking a provider that doesn't support your
  // country would create a payout we'd never be able to release.
  const eligibleProviders: PayoutProvider[] = countryEntry
    ? (countryEntry.providers as readonly PayoutProvider[]).slice() as PayoutProvider[]
    : ["PAYSTACK", "FLUTTERWAVE"];
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  // null = modal closed. When non-null, the modal renders the form for
  // that specific provider — replaces the old always-visible inline form
  // because two configured cards + a tabbed form below was visually
  // redundant ("which provider am I editing?").
  const [modalProvider, setModalProvider] = useState<PayoutProvider | null>(null);
  const [removing, setRemoving] = useState<PayoutProvider | null>(null);

  async function handleRemove(p: PayoutProvider) {
    const label = p === "PAYSTACK" ? "Paystack" : "Flutterwave";
    const confirmed = window.confirm(
      `Disconnect ${label}? Future trips paid via ${label} won't be able to release a payout to you until you set it up again. Your other provider stays connected.`,
    );
    if (!confirmed) return;
    setRemoving(p);
    setSaveError(null);
    setSaveOk(null);
    try {
      const updated = await removePayoutAccount(p);
      setExisting(updated);
      setSaveOk(`${label} disconnected.`);
      setTimeout(() => setSaveOk(null), 4000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not disconnect");
    } finally {
      setRemoving(null);
    }
  }

  function openModal(p: PayoutProvider) {
    // Pre-fill country (we already know the right one for this user); leave
    // bank + account blank so the transporter explicitly enters replacement
    // details — no accidental no-op saves.
    setProvider(p);
    setBankCode("");
    setAccountNumber("");
    setResolvedName(null);
    setSaveError(null);
    setSaveOk(null);
    setModalProvider(p);
  }

  function closeModal() {
    setModalProvider(null);
  }

  const [existing, setExisting] = useState<{
    bankCode: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    paystackRecipientCode: string | null;
    flwBankCode: string | null;
    flwBankAccountNumber: string | null;
    flwBankAccountName: string | null;
    payoutProvider: PayoutProvider | null;
    configuredProviders: PayoutProvider[];
  } | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Initial: load existing account on file + the user's preferred currency
  // from their profile. Existing-account currency wins (we can't change the
  // currency of a stored Paystack recipient); otherwise prefer the profile
  // setting so transporters who price routes in GHS don't see NGN selected
  // here by default.
  useEffect(() => {
    Promise.all([getPayoutAccount().catch(() => null), getCurrentUser().catch(() => null)])
      .then(([acc, user]) => {
        setExisting(acc);
        if (acc?.payoutProvider) setProvider(acc.payoutProvider);
        // Pre-fill country from the user's profile if it's a payout-
        // supported one. Saves them re-entering it every time. Falls back
        // to NG (Nigerian Naira is the largest market on the platform).
        const profileCountry = user?.country?.toUpperCase();
        const fromProfile = profileCountry && payoutCountryEntry(profileCountry);
        if (fromProfile) {
          setCountry(fromProfile.country);
          return;
        }
        // Otherwise: try to infer from the user's preferredCurrency.
        const pref = user?.preferredCurrency?.toUpperCase();
        if (pref) {
          const match = PAYOUT_COUNTRIES.find((c) => c.currency === pref);
          if (match) setCountry(match.country);
        }
      })
      .finally(() => setLoadingExisting(false));
  }, []);

  // No provider/country auto-bump anymore — the country is fixed from
  // the user's profile and the eligible-providers filter prevents the
  // user from picking a provider that doesn't support their country.

  // Load bank list whenever country or provider changes. Country drives
  // currency which drives the bank list lookup (Paystack queries by
  // currency; Flutterwave by country, but the API translates).
  useEffect(() => {
    setBanksLoading(true);
    setBanksError(false);
    listBanks(currency, provider)
      .then((r) => setBanks(r.banks))
      .catch(() => { setBanks([]); setBanksError(true); })
      .finally(() => setBanksLoading(false));
    setBankCode("");
    setResolvedName(null);
  }, [currency, provider]);

  // Debounced account name resolution
  useEffect(() => {
    setResolvedName(null);
    setResolveError(null);
    if (!bankCode || accountNumber.replace(/\D/g, "").length < 10) return;

    const handle = setTimeout(() => {
      setResolving(true);
      resolveBankAccount(bankCode, accountNumber.replace(/\D/g, ""), provider)
        .then((r) => setResolvedName(r.accountName))
        .catch((e) => setResolveError(e instanceof Error ? e.message : "Couldn't verify account"))
        .finally(() => setResolving(false));
    }, 700);
    return () => clearTimeout(handle);
  }, [bankCode, accountNumber, provider]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveOk(null);
    setSaving(true);
    try {
      const updated = await setPayoutAccount({
        bankCode,
        accountNumber: accountNumber.replace(/\D/g, ""),
        currency,
        provider,
      });
      setExisting(updated);
      const updatedName =
        provider === "FLUTTERWAVE" ? updated.flwBankAccountName : updated.bankAccountName;
      setSaveOk(`Saved. Future payouts will go to ${updatedName} via ${provider === "PAYSTACK" ? "Paystack" : "Flutterwave"}.`);
      // Close the modal — the success message stays visible above the
      // top-of-page cards, which now reflect the new account.
      setModalProvider(null);
      setTimeout(() => setSaveOk(null), 5000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader
        kicker="Earnings"
        title="Payout settings"
        subtitle="Where SmatWay sends your earnings after each completed trip. Verified against your bank in real time so a typo can't send your money to the wrong account."
      />

      {/* Per-provider status cards. Both providers can be configured
          independently — connecting one doesn't replace the other.
          Connecting both means we can collect + release on either rail. */}
      {loadingExisting ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 mb-6 animate-pulse h-24" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {eligibleProviders.map((p) => {
            const configured = !!existing?.configuredProviders?.includes(p);
            const accName = p === "PAYSTACK" ? existing?.bankAccountName : existing?.flwBankAccountName;
            const accNum = p === "PAYSTACK" ? existing?.bankAccountNumber : existing?.flwBankAccountNumber;
            const bCode = p === "PAYSTACK" ? existing?.bankCode : existing?.flwBankCode;
            return (
              <div
                key={p}
                className={`rounded-2xl border p-5 ${
                  configured
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ProviderLogo provider={p} size={20} decorative />
                    <div className="text-sm font-semibold text-zinc-950">
                      {p === "PAYSTACK" ? "Paystack" : "Flutterwave"}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      configured
                        ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60"
                    }`}
                  >
                    {configured ? "Configured" : "Not set up"}
                  </span>
                </div>
                {configured ? (
                  <>
                    <div className="mt-2 text-sm font-semibold text-zinc-950">{accName}</div>
                    <div className="text-xs text-emerald-900 font-mono mt-0.5">
                      {bCode} · {accNum}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                    {p === "PAYSTACK"
                      ? "Best for Nigeria, Ghana, Kenya, South Africa."
                      : "Wider African coverage incl. Uganda, Tanzania, Zambia, Francophone Africa."}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openModal(p)}
                    className={`text-[11px] font-semibold ${
                      configured ? "text-emerald-800 hover:text-emerald-900" : "text-zinc-700 hover:text-zinc-950"
                    } underline-offset-2 hover:underline`}
                  >
                    {configured ? "Change" : "Set up"} →
                  </button>
                  {configured && (
                    <button
                      type="button"
                      onClick={() => handleRemove(p)}
                      disabled={removing === p}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {removing === p ? "Removing…" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loadingExisting && existing?.configuredProviders?.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            Add at least one payout account below. Until you do, payouts on your completed trips wait in PENDING and our finance team has to release them manually.
          </p>
        </div>
      )}

      {/* Persistent success banner — survives modal close so the
          transporter sees confirmation after submitting. */}
      {saveOk && !modalProvider && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 mb-4">
          {saveOk}
        </div>
      )}

      {/* Form modal — opens when the user hits Set up / Change on a card.
          We don't render an always-visible inline form because two
          configured cards + a tabbed form below was visually redundant
          ("which provider am I editing?"). One clear path: pick a card,
          modal opens, edit, save. */}
      {modalProvider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
              <ProviderLogo provider={modalProvider} size={22} decorative />
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {existing?.configuredProviders?.includes(modalProvider) ? "Change" : "Set up"}
                </div>
                <h3 className="text-base font-semibold text-zinc-950">
                  {modalProvider === "PAYSTACK" ? "Paystack payouts" : "Flutterwave payouts"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-slate-400 hover:text-zinc-900 text-2xl leading-none -mt-1"
              >
                ×
              </button>
            </div>

            {/* Show the current account at the top of "Change" so the
                transporter sees what they're replacing. */}
            {existing?.configuredProviders?.includes(modalProvider) && (
              <div className="mx-6 mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Currently routed to</div>
                <div className="text-sm font-semibold text-zinc-950">
                  {modalProvider === "PAYSTACK" ? existing.bankAccountName : existing.flwBankAccountName}
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {modalProvider === "PAYSTACK" ? existing.bankCode : existing.flwBankCode} · {modalProvider === "PAYSTACK" ? existing.bankAccountNumber : existing.flwBankAccountNumber}
                </div>
              </div>
            )}

            <form onSubmit={save} className="px-6 py-5 space-y-4">
              {/* Country / currency are fixed from the user's profile —
                  shown read-only here so they know what they're entering
                  bank info for. To change country, the user updates it
                  on the Profile page. */}
              <div>
                <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Country</label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm">
                  <span className="font-semibold">
                    {countryEntry?.countryName ?? country}
                    <span className="ml-2 font-mono text-[11px] text-slate-500">{currency}</span>
                  </span>
                  <a href="/dashboard/profile" className="text-[11px] font-semibold text-emerald-700 hover:underline">
                    Change in profile
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We pay you in <span className="font-mono">{currency}</span> because your profile country is set to {countryEntry?.countryName ?? country}.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  disabled={banksLoading || banks.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white disabled:opacity-60"
                >
                  <option value="">Select your bank…</option>
                  {banks.map((b, i) => (
                    <option key={`${b.code}-${b.longcode || i}`} value={b.code}>{b.name}</option>
                  ))}
                </select>
                {banksLoading && (
                  <p className="text-[11px] text-slate-400 mt-1">Loading bank list…</p>
                )}
                {!banksLoading && banksError && (
                  <p className="text-[11px] text-red-600 mt-1">Failed to load banks. Check your connection or try again.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Account number</label>
                <input
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-mono tabular-nums focus:outline-none focus:border-emerald-400 focus:bg-white"
                />
                <div className="mt-2 min-h-[20px] text-xs">
                  {resolving ? (
                    <span className="text-slate-500">Verifying with bank…</span>
                  ) : resolveError ? (
                    <span className="text-red-700">{resolveError}</span>
                  ) : resolvedName ? (
                    <span className="text-emerald-700 font-semibold">✓ {resolvedName}</span>
                  ) : null}
                </div>
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 -mx-6 px-6 pb-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !resolvedName}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}
