"use client";

import { useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, PrimaryButton, SecondaryButton,
} from "@/app/_Components/ui";
import {
  getPlatformSettings, updatePlatformSettings, PlatformSettings,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";

/**
 * Platform-wide settings editable at runtime by anyone with SETTINGS_EDIT.
 *
 *   - commissionRate    → percentage SmatWay deducts from each completed trip
 *   - autoPayoutEnabled → if true, the platform calls Paystack /transfer
 *                         immediately when a traveler confirms arrival; if
 *                         false, the payout sits PENDING until an admin
 *                         clicks Release on /dashboard/payouts.
 *
 * Confirm prompt before save — commission changes affect every transporter
 * and (when changed) auto-publish a heads-up announcement to them.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state — separate from `settings` so we know what's dirty.
  const [commissionPct, setCommissionPct] = useState<string>(""); // user-friendly % string
  const [autoPayout, setAutoPayout] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const profile = getAdminProfile();
  const canEdit = adminCan(profile, ADMIN_PERMISSIONS.SETTINGS_EDIT);

  function load() {
    setLoading(true);
    setError(null);
    getPlatformSettings()
      .then((s) => {
        setSettings(s);
        setCommissionPct((s.commissionRate * 100).toFixed(2));
        setAutoPayout(s.autoPayoutEnabled);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  // Are we changing anything? `dirty` drives Save button enable + confirm copy.
  const parsedRate = parseFloat(commissionPct) / 100;
  const rateValid = Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 0.5;
  const rateDirty = settings != null && Math.abs(parsedRate - settings.commissionRate) > 1e-6;
  const autoDirty = settings != null && autoPayout !== settings.autoPayoutEnabled;
  const dirty = (rateValid && rateDirty) || autoDirty;

  async function save() {
    if (!settings) return;
    if (!rateValid) {
      setError("Commission must be between 0% and 50%.");
      return;
    }

    // Build a list of human-readable changes for the confirm dialog.
    const changes: string[] = [];
    if (rateDirty) {
      changes.push(
        `Commission: ${(settings.commissionRate * 100).toFixed(2)}% → ${(parsedRate * 100).toFixed(2)}%`,
      );
    }
    if (autoDirty) {
      changes.push(
        `Auto-payout: ${settings.autoPayoutEnabled ? "ON" : "OFF"} → ${autoPayout ? "ON" : "OFF"}`,
      );
    }
    const announceLine = rateDirty
      ? "\n\nA platform announcement will be sent to all transporters about the new commission."
      : "";
    if (!confirm(`Apply these changes?\n\n${changes.join("\n")}${announceLine}`)) return;

    setSaving(true);
    setError(null);
    try {
      const res = await updatePlatformSettings({
        commissionRate: rateDirty ? parsedRate : undefined,
        autoPayoutEnabled: autoDirty ? autoPayout : undefined,
      });
      setSettings(res.settings);
      setCommissionPct((res.settings.commissionRate * 100).toFixed(2));
      setAutoPayout(res.settings.autoPayoutEnabled);
      setSavedFlash("Settings saved.");
      setTimeout(() => setSavedFlash(null), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!settings) return;
    setCommissionPct((settings.commissionRate * 100).toFixed(2));
    setAutoPayout(settings.autoPayoutEnabled);
    setError(null);
  }

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="System"
        title="Platform settings"
        subtitle="Commission rate and auto-payout behaviour. Changes apply to new trips only — historical payouts keep the rate they were created with."
      />

      {!canEdit && (
        <Card>
          <div className="text-sm text-amber-700">
            You don't have permission to edit platform settings. Contact a super admin.
          </div>
        </Card>
      )}

      {loading ? (
        <Card><Skeleton className="h-40 w-full" /></Card>
      ) : error && !settings ? (
        <ErrorState message={error} onRetry={load} />
      ) : settings ? (
        <Card className="space-y-7">
          {/* Commission rate */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 items-start">
            <div className="sm:col-span-1">
              <h3 className="text-[14px] font-semibold text-zinc-950">Platform commission</h3>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                Percentage SmatWay keeps from each completed trip. Transporters receive the rest. Range: 0% – 50%.
              </p>
            </div>
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-stretch gap-2 max-w-xs">
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={0}
                  max={50}
                  disabled={!canEdit || saving}
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  className={`flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 ${
                    rateValid ? "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                              : "border-red-300 focus:border-red-400 focus:ring-red-100"
                  } disabled:opacity-60`}
                />
                <span className="inline-flex items-center px-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Currently active for new trips: <span className="font-semibold text-zinc-950">{(settings.commissionRate * 100).toFixed(2)}%</span>
              </p>
              {!rateValid && commissionPct !== "" && (
                <p className="text-[11px] text-red-700 font-semibold">Enter a number between 0 and 50.</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Auto-payout toggle */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 items-start">
            <div className="sm:col-span-1">
              <h3 className="text-[14px] font-semibold text-zinc-950">Auto-release payouts</h3>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                If on, SmatWay calls Paystack /transfer immediately when a traveler confirms arrival. If off, payouts sit in PENDING until you click <strong>Release</strong> on the Payouts page.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Requires <em>Transfers OTP</em> to be disabled in your Paystack dashboard.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoPayout}
                  disabled={!canEdit || saving}
                  onChange={(e) => setAutoPayout(e.target.checked)}
                />
                <span className="relative w-11 h-6 rounded-full bg-slate-200 peer-checked:bg-emerald-500 peer-disabled:opacity-50 transition-colors">
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoPayout ? "translate-x-5" : ""}`} />
                </span>
                <span className="text-sm font-semibold text-zinc-950">
                  {autoPayout ? "Enabled" : "Disabled"}
                </span>
              </label>
              <p className="text-[11px] text-slate-500 mt-2">
                Currently: <span className="font-semibold">{settings.autoPayoutEnabled ? "ON" : "OFF"}</span>
              </p>
            </div>
          </div>

          {/* Inline messages */}
          {error && settings && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {savedFlash && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {savedFlash}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <SecondaryButton onClick={reset} disabled={!dirty || saving}>
              Reset
            </SecondaryButton>
            <PrimaryButton onClick={save} disabled={!canEdit || !dirty || !rateValid || saving}>
              {saving ? "Saving…" : "Save changes"}
            </PrimaryButton>
          </div>

          {settings.updatedAt && (
            <p className="text-[11px] text-slate-400">
              Last updated {new Date(settings.updatedAt).toLocaleString()} {settings.updatedByAdminId ? `· admin ${settings.updatedByAdminId.slice(0, 8)}` : ""}
            </p>
          )}
        </Card>
      ) : null}
    </Page>
  );
}
