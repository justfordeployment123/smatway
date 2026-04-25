"use client";

import { useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill,
  PrimaryButton, SecondaryButton,
} from "@/app/_Components/ui";
import { ShieldUserIcon, PlusIcon } from "@/app/_Components/Icons";
import {
  listAdmins, createAdmin, updateAdmin, deleteAdmin, AdminManagementRow,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSION_GROUPS, ADMIN_PERMISSIONS, AdminPermission } from "@/lib/permissions";

type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR";

export default function AdminsPage() {
  const me = getAdminProfile();
  const canCreate = adminCan(me, ADMIN_PERMISSIONS.ADMINS_CREATE);
  const canDelete = adminCan(me, ADMIN_PERMISSIONS.ADMINS_DELETE);

  const [rows, setRows] = useState<AdminManagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("ADMIN");
  const [perms, setPerms] = useState<AdminPermission[]>([]);
  const [cloneFromMe, setCloneFromMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    listAdmins()
      .then((r) => setRows(r.admins))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load admins"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function togglePerm(p: AdminPermission) {
    setPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await createAdmin({
        email,
        username,
        password,
        role: cloneFromMe ? undefined : role,
        permissions: cloneFromMe ? undefined : perms,
        cloneFromMe,
      });
      setRows((prev) => [result.admin, ...prev]);
      setEmail(""); setUsername(""); setPassword(""); setRole("ADMIN");
      setPerms([]); setCloneFromMe(false); setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(a: AdminManagementRow) {
    setBusyId(a.id);
    try {
      const updated = await updateAdmin(a.id, { isActive: !a.isActive });
      setRows((prev) => prev.map((x) => (x.id === a.id ? updated.admin : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(a: AdminManagementRow) {
    if (!confirm(`Permanently delete admin "${a.username}"?`)) return;
    setBusyId(a.id);
    try {
      await deleteAdmin(a.id);
      setRows((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Access control"
        title="Admins"
        subtitle="Other people who can sign in to this console. Grant only the permissions they need."
        action={
          canCreate ? (
            <PrimaryButton onClick={() => setShowForm((v) => !v)}>
              <PlusIcon className="w-4 h-4" />
              {showForm ? "Cancel" : "New admin"}
            </PrimaryButton>
          ) : undefined
        }
      />

      {showForm && canCreate && (
        <Card>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The new admin signs in with this. Email-invite flow is reserved for when OTP_SEND_EMAIL=true and a verified domain is configured.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cloneFromMe}
                onChange={(e) => setCloneFromMe(e.target.checked)}
                className="rounded"
              />
              <span>Give this admin <span className="font-semibold">the same role and permissions as me</span></span>
            </label>

            {!cloneFromMe && (
              <>
                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Role</label>
                  <div className="flex flex-wrap gap-2">
                    {(["ADMIN", "MODERATOR", "SUPER_ADMIN"] as AdminRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        disabled={r === "SUPER_ADMIN" && me?.role !== "SUPER_ADMIN"}
                        className={`text-sm px-3 py-2 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          role === r
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {r === "SUPER_ADMIN" ? "Super admin" : r === "MODERATOR" ? "Moderator" : "Admin"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Super-admin bypasses all permission checks. Only an existing super-admin can mint another.
                  </p>
                </div>

                {role !== "SUPER_ADMIN" && (
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 block mb-2">Permissions</label>
                    <div className="space-y-4">
                      {ADMIN_PERMISSION_GROUPS.map((g) => (
                        <div key={g.label} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{g.label}</div>
                            <button
                              type="button"
                              onClick={() => {
                                const all = g.permissions.map((p) => p.value);
                                const everySelected = all.every((p) => perms.includes(p));
                                setPerms((prev) =>
                                  everySelected
                                    ? prev.filter((p) => !all.includes(p))
                                    : Array.from(new Set([...prev, ...all])),
                                );
                              }}
                              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                            >
                              Toggle all
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {g.permissions.map((p) => {
                              const cannotGrant =
                                me?.role !== "SUPER_ADMIN" && !me?.permissions.includes(p.value);
                              return (
                                <label
                                  key={p.value}
                                  className={`flex items-start gap-2 rounded-lg p-2 hover:bg-slate-50 ${cannotGrant ? "opacity-50" : ""}`}
                                  title={cannotGrant ? "You can't grant a permission you don't hold" : ""}
                                >
                                  <input
                                    type="checkbox"
                                    checked={perms.includes(p.value)}
                                    onChange={() => togglePerm(p.value)}
                                    disabled={cannotGrant}
                                    className="mt-1"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-zinc-900">{p.label}</div>
                                    <div className="text-[11px] text-slate-500">{p.description}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create admin"}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<ShieldUserIcon />} title="No admins yet" description="The env-bootstrap super-admin is always available even when this list is empty." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Admin</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Last login</th>
                  <th className="text-right px-5 py-3 font-semibold">Permissions</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-zinc-950">{a.username}</div>
                      <div className="text-[11px] text-slate-500">{a.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={a.role === "SUPER_ADMIN" ? "blue" : a.role === "MODERATOR" ? "slate" : "emerald"}>
                        {a.role === "SUPER_ADMIN" ? "Super" : a.role === "MODERATOR" ? "Mod" : "Admin"}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={a.isActive ? "emerald" : "slate"}>{a.isActive ? "Active" : "Disabled"}</StatusPill>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-500">
                      {a.lastLoginAt
                        ? new Date(a.lastLoginAt).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{a.role === "SUPER_ADMIN" ? "ALL" : a.permissions.length}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => toggleActive(a)}
                          disabled={busyId === a.id || a.id === me?.id}
                          className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 disabled:opacity-40"
                        >
                          {a.isActive ? "Disable" : "Enable"}
                        </button>
                        {canDelete && a.id !== me?.id && (
                          <button
                            onClick={() => remove(a)}
                            disabled={busyId === a.id}
                            className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  );
}
