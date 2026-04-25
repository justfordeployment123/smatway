"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, StatusPill, SecondaryButton } from "@/app/_Components/ui";
import { ArrowLeftIcon, MapPinIcon, CarIcon } from "@/app/_Components/Icons";
import {
  getAdminRoute, deactivateAdminRoute, activateAdminRoute, AdminRouteDetail,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/format";

export default function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [route, setRoute] = useState<AdminRouteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canEdit = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.ROUTES_EDIT);

  function load() {
    setLoading(true);
    setError(null);
    getAdminRoute(id)
      .then((r) => setRoute(r.route))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load route"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function toggle() {
    if (!route) return;
    setBusy(true);
    try {
      if (route.status === "ACTIVE") await deactivateAdminRoute(route.id);
      else await activateAdminRoute(route.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page className="space-y-6">
      <Link href="/dashboard/routes" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to routes
      </Link>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : route ? (
        <>
          <PageHeader
            kicker="Route"
            title={`${route.departureCity} → ${route.destinationCity}`}
            subtitle={`${route.departureCountry} → ${route.destinationCountry}`}
            action={
              canEdit ? (
                <SecondaryButton onClick={toggle} disabled={busy}>
                  {busy ? "…" : route.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </SecondaryButton>
              ) : (
                <StatusPill tone={route.status === "ACTIVE" ? "emerald" : route.status === "FULL" ? "yellow" : "slate"}>
                  {route.status}
                </StatusPill>
              )
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Status</div>
              <div className="mt-2"><StatusPill tone={route.status === "ACTIVE" ? "emerald" : route.status === "FULL" ? "yellow" : "slate"}>{route.status}</StatusPill></div>
            </Card>
            <Card>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Price</div>
              <div className="mt-1 text-xl font-mono font-semibold tabular-nums text-zinc-950">
                {formatMoney(route.price, route.currency)}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{route.currency}</div>
            </Card>
            <Card>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Seats available</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">{route.availableSeats}</div>
            </Card>
            <Card>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Bookings</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">{route._count.bookings}</div>
            </Card>
          </div>

          {/* Vehicle hero — image + plate/model */}
          {route.vehicle && (
            <Card className="!p-0 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr]">
                <div className="aspect-[16/10] sm:aspect-auto sm:h-full bg-gradient-to-br from-slate-100 to-slate-50 relative">
                  {route.vehicle.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={route.vehicle.imageUrl} alt={route.vehicle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <CarIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700 font-semibold mb-2">Vehicle</div>
                  <Link
                    href={`/dashboard/vehicles/${route.vehicle.id}`}
                    className="text-xl font-semibold text-zinc-950 hover:text-emerald-700 transition-colors"
                  >
                    {route.vehicle.name}
                  </Link>
                  <div className="text-sm text-slate-500 mt-0.5">{route.vehicle.model}</div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Plate</div>
                      <div className="font-mono text-[13px] tracking-wider text-zinc-900">{route.vehicle.plateNumber}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">Type</div>
                      <StatusPill tone="slate">{route.vehicle.transportType}</StatusPill>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Schedule</h2>
              <dl className="space-y-3 text-sm">
                <Row label="Vehicle type">{route.transportType}</Row>
                <Row label="Currency">{route.currency}</Row>
                <Row label="Departure">
                  {new Date(route.departureDateTime).toLocaleString(undefined, {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </Row>
                <Row label="Listed">
                  {new Date(route.createdAt).toLocaleString(undefined, {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </Row>
                <Row label="Route ID" mono>{route.id}</Row>
              </dl>
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Transporter</h2>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                {route.transporter.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={route.transporter.avatarUrl}
                    alt={route.transporter.name || route.transporter.email}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm">
                    {(route.transporter.name?.charAt(0) || route.transporter.email.charAt(0)).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/users/${route.transporter.id}`}
                    className="font-semibold text-zinc-950 hover:text-emerald-700 transition-colors truncate block"
                  >
                    {route.transporter.name || route.transporter.email}
                  </Link>
                  <div className="text-[11px] text-slate-500 truncate">View profile →</div>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <Row label="Email">
                  <a href={`mailto:${route.transporter.email}`} className="text-emerald-700 hover:text-emerald-900 break-all">
                    {route.transporter.email}
                  </a>
                </Row>
                <Row label="Phone">
                  {route.transporter.phoneNumber ? (
                    <a href={`tel:${route.transporter.phoneNumber}`} className="text-emerald-700 hover:text-emerald-900">
                      {route.transporter.phoneNumber}
                    </a>
                  ) : "—"}
                </Row>
                <Row label="Country">{route.transporter.country || "—"}</Row>
              </dl>
            </Card>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-base font-semibold text-zinc-900">Recent bookings</h2>
              <p className="text-xs text-slate-500">Most recent 20 bookings on this route.</p>
            </div>
            {route.bookings.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold">Traveler</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                      <th className="text-left px-5 py-3 font-semibold">Payment</th>
                      <th className="text-right px-5 py-3 font-semibold">Seats</th>
                      <th className="text-right px-5 py-3 font-semibold">Total</th>
                      <th className="text-right px-5 py-3 font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {route.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3">
                          {b.traveler ? (
                            <Link
                              href={`/dashboard/users/${b.traveler.id}`}
                              className="group inline-flex flex-col gap-0.5 min-w-0"
                            >
                              <span className="font-semibold text-zinc-950 group-hover:text-emerald-700 truncate">
                                {b.traveler.name || b.traveler.email}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide text-slate-400 group-hover:text-emerald-700">
                                View profile →
                              </span>
                            </Link>
                          ) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-5 py-3"><StatusPill tone={b.status === "COMPLETED" ? "emerald" : b.status === "CONFIRMED" ? "blue" : b.status === "CANCELLED" ? "red" : "yellow"}>{b.status}</StatusPill></td>
                        <td className="px-5 py-3"><StatusPill tone={b.paymentStatus === "PAID" ? "emerald" : b.paymentStatus === "FAILED" ? "red" : "yellow"}>{b.paymentStatus}</StatusPill></td>
                        <td className="px-5 py-3 text-right tabular-nums">{b.seatsBooked}</td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(b.totalPrice, route.currency)}</td>
                        <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}

      {!loading && !route && !error && (
        <Card><div className="flex items-center gap-3 text-slate-500"><MapPinIcon /> Route not found.</div></Card>
      )}
    </Page>
  );
}

function Row({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[11px] uppercase tracking-wide text-slate-500 shrink-0 mt-0.5">{label}</dt>
      <dd className={`text-sm text-zinc-900 text-right ${mono ? "font-mono text-[12px] break-all" : ""}`}>{children}</dd>
    </div>
  );
}
