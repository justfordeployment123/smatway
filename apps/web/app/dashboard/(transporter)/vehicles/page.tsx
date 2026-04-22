"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVehicles, deleteVehicle, disableRoutesByVehicle } from "@/lib/api";

const transportTypeColors: Record<string, string> = {
  CAR: "bg-blue-50 text-blue-700",
  BUS: "bg-green-50 text-green-700",
  VAN: "bg-purple-50 text-purple-700",
  MINIBUS: "bg-orange-50 text-orange-700",
  TRUCK: "bg-red-50 text-red-700",
};

export default function TransporterVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ vehicleId: string; vehicleName: string } | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getMyVehicles().then(setVehicles).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteVehicle(id);
      setVehicles(v => v.filter(t => t.id !== id));
    } catch (e: any) {
      const errorMsg = e?.message || "Failed to delete vehicle";
      if (errorMsg.includes("active routes")) {
        const vehicle = vehicles.find(v => v.id === id);
        setDeleteModal({ vehicleId: id, vehicleName: vehicle?.name || "Vehicle" });
        setDeleteError("");
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteAllRoutes() {
    if (!deleteModal) return;

    try {
      await disableRoutesByVehicle(deleteModal.vehicleId);
      await deleteVehicle(deleteModal.vehicleId);
      setVehicles(v => v.filter(t => t.id !== deleteModal.vehicleId));
      setDeleteModal(null);
      setDeleteError("");
    } catch (e: any) {
      setDeleteError(e?.message || "Failed to delete routes");
    }
  }

  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-sm md:text-base text-slate-600">Manage your transport vehicles</p>
        </div>
        <Link
          href="/dashboard/vehicles/add"
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Vehicle
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">No vehicles yet</p>
          <p className="text-sm text-slate-400 mb-4">Add your first vehicle to start creating routes.</p>
          <Link href="/dashboard/vehicles/add" className="inline-flex text-sm font-semibold text-emerald-600 underline">Add Vehicle →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex gap-4 p-4">
                {vehicle.imageUrl && (
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">{vehicle.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{vehicle.model} · {vehicle.plateNumber}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${transportTypeColors[vehicle.transportType]}`}>
                      {vehicle.transportType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 mb-3">{vehicle._count?.transports ?? 0} route{(vehicle._count?.transports ?? 0) !== 1 ? "s" : ""}</p>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/vehicles/edit/${vehicle.id}`} className="flex-1 text-xs border border-slate-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all font-medium text-center">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={deleting === vehicle.id}
                      className="flex-1 text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 font-medium"
                    >
                      {deleting === vehicle.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Delete "{deleteModal.vehicleName}"?</h2>
              <p className="text-sm text-slate-500 mt-1">This will disable all active routes and delete the vehicle.</p>
            </div>

            {deleteError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{deleteError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteError("");
                }}
                className="flex-1 border border-slate-200 text-zinc-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllRoutes}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                Delete All Routes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
