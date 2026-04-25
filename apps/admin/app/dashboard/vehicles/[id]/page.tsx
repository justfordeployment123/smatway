"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, StatusPill } from "@/app/_Components/ui";
import { ArrowLeftIcon, CarIcon } from "@/app/_Components/Icons";
import { getAdminVehicle, AdminVehicleDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<AdminVehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getAdminVehicle(id)
      .then((r) => setVehicle(r.vehicle))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load vehicle"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  return (
    <Page className="space-y-6">
      <Link href="/dashboard/vehicles" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to vehicles
      </Link>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : vehicle ? (
        <>
          <PageHeader
            kicker="Vehicle"
            title={vehicle.name}
            subtitle={vehicle.model}
            action={<StatusPill tone="slate">{vehicle.transportType}</StatusPill>}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
            <Card className="!p-0 overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 relative">
                {vehicle.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <CarIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Details</h2>
              <dl className="space-y-3 text-sm">
                <Row label="Vehicle ID" mono>{vehicle.id}</Row>
                <Row label="Plate" mono>{vehicle.plateNumber}</Row>
                <Row label="Model">{vehicle.model}</Row>
                <Row label="Type">{vehicle.transportType}</Row>
                <Row label="Routes posted">{vehicle._count.transports}</Row>
                <Row label="Registered">
                  {new Date(vehicle.createdAt).toLocaleString(undefined, {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </Row>
              </dl>
            </Card>
          </div>

          <Card>
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Transporter</h2>
            {vehicle.transporter ? (
              <dl className="space-y-3 text-sm">
                <Row label="Name">
                  <Link href={`/dashboard/users/${vehicle.transporter.id}`} className="text-emerald-700 hover:text-emerald-900 font-medium">
                    {vehicle.transporter.name || vehicle.transporter.email}
                  </Link>
                </Row>
                <Row label="Email">{vehicle.transporter.email}</Row>
                <Row label="Phone">{vehicle.transporter.phoneNumber || "—"}</Row>
                <Row label="Country">{vehicle.transporter.country || "—"}</Row>
              </dl>
            ) : <p className="text-sm text-slate-500">Transporter unknown.</p>}
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-base font-semibold text-zinc-900">Routes using this vehicle</h2>
              <p className="text-xs text-slate-500">Most recent 20 transport listings.</p>
            </div>
            {vehicle.transports.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-slate-500">No routes posted with this vehicle yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold">Route</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                      <th className="text-right px-5 py-3 font-semibold">Price</th>
                      <th className="text-right px-5 py-3 font-semibold">Seats</th>
                      <th className="text-right px-5 py-3 font-semibold">Departs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicle.transports.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/routes/${t.id}`} className="font-semibold text-emerald-700 hover:text-emerald-900">
                            {t.departureCity} → {t.destinationCity}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill tone={t.status === "ACTIVE" ? "emerald" : t.status === "FULL" ? "yellow" : "slate"}>{t.status}</StatusPill>
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(t.price, t.currency)}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{t.availableSeats}</td>
                        <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                          {new Date(t.departureDateTime).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
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
