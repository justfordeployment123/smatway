"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton, TabFilter } from "@/app/_Components/ui";
import { SearchIcon, UsersIcon } from "@/app/_Components/Icons";
import { listAdminUsers, AdminUserRow } from "@/lib/api";

const ACCOUNT_TABS = ["", "TRAVELER", "TRANSPORTER"] as const;
type AccountTab = (typeof ACCOUNT_TABS)[number];
const ACCOUNT_LABELS: Record<AccountTab, string> = {
  "": "ALL",
  TRAVELER: "TRAVELERS",
  TRANSPORTER: "TRANSPORTERS",
};

export default function UsersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState<AccountTab>("");

  function load(reset = true) {
    if (reset) {
      setLoading(true);
      setRows([]);
      setNextCursor(null);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    listAdminUsers({
      search: search || undefined,
      accountType: accountType || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.users : [...prev, ...res.users]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  return (
    <Page className="space-y-6">
      <PageHeader kicker="People" title="Users" subtitle="All travelers and transporters on the platform." />

      <Card className="space-y-3">
        <TabFilter<AccountTab> tabs={ACCOUNT_TABS} value={accountType} onChange={setAccountType} formatLabel={(t) => ACCOUNT_LABELS[t]} />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(true); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <SecondaryButton onClick={() => load(true)}>Search</SecondaryButton>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title="No users yet"
            description="Once people sign up, they'll show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Account</th>
                  <th className="text-left px-5 py-3 font-semibold">Country</th>
                  <th className="text-right px-5 py-3 font-semibold">Bookings</th>
                  <th className="text-right px-5 py-3 font-semibold">Routes</th>
                  <th className="text-right px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/dashboard/users/${u.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-zinc-950">{u.name || "—"}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      {u.accountType ? (
                        <StatusPill tone={u.accountType === "TRANSPORTER" ? "blue" : "emerald"}>
                          {u.accountType}
                        </StatusPill>
                      ) : "—"}
                      {u.emailVerified ? null : <span className="ml-2 text-[10px] text-amber-700">unverified</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.country || "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{u._count.bookings}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{u._count.transports}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {nextCursor && (
        <div className="text-center">
          <SecondaryButton onClick={() => load(false)} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </SecondaryButton>
        </div>
      )}
    </Page>
  );
}
