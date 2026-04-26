"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, StatusPill } from "@/app/_Components/ui";
import { ArrowLeftIcon, UsersIcon, CarIcon, MapPinIcon, BookOpenIcon } from "@/app/_Components/Icons";
import { getAdminUser, AdminUserDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { formatBookingStatus } from "@/lib/bookingStatus";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getAdminUser(id)
      .then((r) => setUser(r.user))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load user"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  // Either field may carry the user's profile photo (transporters tend to use
  // profileImageUrl, travelers use avatarUrl). Both are presigned by the API.
  const photoUrl = user ? (user.profileImageUrl || user.avatarUrl) : null;
  const initial = user
    ? (user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()
    : "?";

  return (
    <Page className="space-y-6">
      <Link href="/dashboard/users" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to users
      </Link>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : user ? (
        <>
          {/* Hero card with avatar */}
          <Card className="!p-0 overflow-hidden">
            <div className="h-24 bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.4), transparent 60%)",
              }} />
            </div>
            <div className="px-6 sm:px-8 pb-6 pt-16 sm:pt-6 sm:pl-36 relative">
              <div className="absolute -top-12 left-6 sm:left-8">
                {photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photoUrl}
                    alt={user.name || user.email}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.2)] bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.2)]">
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 truncate">{user.name || user.email}</h1>
                  {user.accountType && (
                    <StatusPill tone={user.accountType === "TRANSPORTER" ? "blue" : "emerald"}>
                      {user.accountType}
                    </StatusPill>
                  )}
                  {user.role === "ADMIN" && <StatusPill tone="blue">ADMIN</StatusPill>}
                </div>
                <div className="text-sm text-slate-500 truncate">
                  {user.email}
                  {user.country ? ` · ${user.country}` : ""}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill tone={user.emailVerified ? "emerald" : "yellow"}>
                    {user.emailVerified ? "Email verified" : "Email unverified"}
                  </StatusPill>
                  {user.preferredCurrency && (
                    <StatusPill tone="slate">{user.preferredCurrency}</StatusPill>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <CountTile label="Bookings" value={user._count.bookings} />
            <CountTile label="Routes posted" value={user._count.transports} />
            <CountTile label="Vehicles" value={user._count.vehicles} />
            <CountTile label="Reviews left" value={user._count.reviewsGiven} />
            <CountTile label="Reviews received" value={user._count.reviewsReceived} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Contact & account</h2>
              <dl className="space-y-3 text-sm">
                <Row label="User ID" mono>{user.id}</Row>
                <Row label="Email">
                  <a href={`mailto:${user.email}`} className="text-emerald-700 hover:text-emerald-900 break-all">
                    {user.email}
                  </a>
                </Row>
                <Row label="Phone">
                  {user.phoneNumber ? (
                    <a href={`tel:${user.phoneNumber}`} className="text-emerald-700 hover:text-emerald-900">
                      {user.phoneNumber}
                    </a>
                  ) : "—"}
                </Row>
                <Row label="Country">{user.country || "—"}</Row>
                <Row label="Preferred currency">{user.preferredCurrency || "—"}</Row>
                <Row label="Account type">{user.accountType || "—"}</Row>
                <Row label="Email verified">
                  <StatusPill tone={user.emailVerified ? "emerald" : "yellow"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </StatusPill>
                  {user.emailVerifiedAt && (
                    <span className="ml-2 text-[11px] text-slate-400">
                      {new Date(user.emailVerifiedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  )}
                </Row>
                <Row label="Role">
                  <StatusPill tone={user.role === "ADMIN" ? "blue" : "slate"}>{user.role}</StatusPill>
                </Row>
                <Row label="Joined">
                  {new Date(user.createdAt).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Row>
                <Row label="Last update">
                  {new Date(user.updatedAt).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Row>
              </dl>
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                {user.accountType === "TRANSPORTER" ? "Transporter profile" : "Traveler profile"}
              </h2>
              {user.profile ? (
                <dl className="space-y-3 text-sm">
                  {user.accountType === "TRAVELER" ? (
                    <Row label="Bio">{user.profile.travelerBio || user.profile.bio || "—"}</Row>
                  ) : (
                    <>
                      <Row label="Company">{user.profile.companyName || "—"}</Row>
                      <Row label="License #" mono>{user.profile.licenseNumber || "—"}</Row>
                      <Row label="License expiry">
                        {user.profile.licenseExpiry
                          ? new Date(user.profile.licenseExpiry).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </Row>
                      <Row label="Vehicle type">{user.profile.vehicleType || "—"}</Row>
                      <Row label="Bio">{user.profile.bio || "—"}</Row>
                    </>
                  )}
                  <Row label="Emergency contact">
                    {user.profile.emergencyContactName || "—"}
                    {user.profile.emergencyContactPhone ? (
                      <a
                        href={`tel:${user.profile.emergencyContactPhone}`}
                        className="ml-2 text-emerald-700 hover:text-emerald-900"
                      >
                        {user.profile.emergencyContactPhone}
                      </a>
                    ) : null}
                  </Row>
                </dl>
              ) : (
                <p className="text-sm text-slate-500">No profile set up.</p>
              )}
            </Card>
          </div>

          {/* Vehicles — only relevant for transporters */}
          {user.accountType === "TRANSPORTER" && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-6 pb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">Vehicles</h2>
                  <p className="text-xs text-slate-500">
                    {user.vehicles.length === 0
                      ? "No vehicles registered."
                      : `${user.vehicles.length} vehicle${user.vehicles.length === 1 ? "" : "s"} registered.`}
                  </p>
                </div>
              </div>
              {user.vehicles.length === 0 ? (
                <div className="px-6 pb-6 text-sm text-slate-500 flex items-center gap-2">
                  <CarIcon className="w-4 h-4" /> This transporter has not registered any vehicles yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold">Vehicle</th>
                        <th className="text-left px-5 py-3 font-semibold">Plate</th>
                        <th className="text-left px-5 py-3 font-semibold">Type</th>
                        <th className="text-right px-5 py-3 font-semibold">Routes</th>
                        <th className="text-right px-5 py-3 font-semibold">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {user.vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3">
                            <Link href={`/dashboard/vehicles/${v.id}`} className="flex items-center gap-3 group">
                              <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center shrink-0">
                                {v.imageUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                                ) : (
                                  <CarIcon className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-950 group-hover:text-emerald-700 transition-colors truncate">
                                  {v.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">{v.model}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-5 py-3">
                            <span className="font-mono text-[12px] tracking-wider text-zinc-700">{v.plateNumber}</span>
                          </td>
                          <td className="px-5 py-3"><StatusPill tone="slate">{v.transportType}</StatusPill></td>
                          <td className="px-5 py-3 text-right tabular-nums">{v._count.transports}</td>
                          <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                            {new Date(v.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Routes posted — for transporters */}
          {user.accountType === "TRANSPORTER" && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-6 pb-3">
                <h2 className="text-base font-semibold text-zinc-900">Routes posted</h2>
                <p className="text-xs text-slate-500">Most recent 20 transports.</p>
              </div>
              {user.transports.length === 0 ? (
                <div className="px-6 pb-6 text-sm text-slate-500 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" /> No routes posted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold">Route</th>
                        <th className="text-left px-5 py-3 font-semibold">Vehicle</th>
                        <th className="text-left px-5 py-3 font-semibold">Status</th>
                        <th className="text-right px-5 py-3 font-semibold">Price</th>
                        <th className="text-right px-5 py-3 font-semibold">Seats</th>
                        <th className="text-right px-5 py-3 font-semibold">Bookings</th>
                        <th className="text-right px-5 py-3 font-semibold">Departs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {user.transports.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3">
                            <Link href={`/dashboard/routes/${t.id}`} className="font-semibold text-zinc-950 hover:text-emerald-700">
                              {t.departureCity} → {t.destinationCity}
                            </Link>
                            <div className="text-[11px] text-slate-500">{t.departureCountry} → {t.destinationCountry}</div>
                          </td>
                          <td className="px-5 py-3">
                            {t.vehicle ? (
                              <Link href={`/dashboard/vehicles/${t.vehicle.id}`} className="text-slate-700 hover:text-emerald-700">
                                {t.vehicle.name}
                              </Link>
                            ) : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <StatusPill tone={t.status === "ACTIVE" ? "emerald" : t.status === "FULL" ? "yellow" : "slate"}>{t.status}</StatusPill>
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(t.price, t.currency)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{t.availableSeats}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{t._count.bookings}</td>
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
          )}

          {/* Bookings — relevant for travelers (and shown for transporters who also book) */}
          {user.bookings.length > 0 && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-6 pb-3">
                <h2 className="text-base font-semibold text-zinc-900">
                  {user.accountType === "TRANSPORTER" ? "Bookings made" : "Bookings"}
                </h2>
                <p className="text-xs text-slate-500">Most recent 20 bookings made by this user.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold">Route</th>
                      <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                      <th className="text-left px-5 py-3 font-semibold">Payment</th>
                      <th className="text-right px-5 py-3 font-semibold">Seats</th>
                      <th className="text-right px-5 py-3 font-semibold">Total</th>
                      <th className="text-right px-5 py-3 font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {user.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/routes/${b.transport.id}`} className="font-semibold text-zinc-950 hover:text-emerald-700">
                            {b.transport.departureCity} → {b.transport.destinationCity}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          {b.transport.transporter ? (
                            <Link href={`/dashboard/users/${b.transport.transporter.id}`} className="text-slate-700 hover:text-emerald-700">
                              {b.transport.transporter.name || b.transport.transporter.email}
                            </Link>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill tone={b.status === "COMPLETED" ? "emerald" : b.status === "CONFIRMED" ? "blue" : b.status === "IN_PROGRESS" ? "orange" : b.status === "CANCELLED" ? "red" : "yellow"}>
                            {formatBookingStatus(b.status)}
                          </StatusPill>
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill tone={b.paymentStatus === "PAID" ? "emerald" : b.paymentStatus === "FAILED" ? "red" : "yellow"}>
                            {b.paymentStatus}
                          </StatusPill>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">{b.seatsBooked}</td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums">
                          {formatMoney(b.totalPrice, b.transport.currency)}
                        </td>
                        <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {user.accountType === "TRAVELER" && user.bookings.length === 0 && (
            <Card>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpenIcon className="w-4 h-4" /> This traveler has no bookings yet.
              </div>
            </Card>
          )}
        </>
      ) : (
        !loading && !error && (
          <Card>
            <div className="flex items-center gap-3 text-slate-500">
              <UsersIcon /> User not found.
            </div>
          </Card>
        )
      )}
    </Page>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950">{value.toLocaleString()}</div>
    </Card>
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
