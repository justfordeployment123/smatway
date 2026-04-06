import DashboardTable from "@/app/dashboard/_Components/DashboardTable";
import { PlusIcon } from "@/app/dashboard/_Components/Icons";

const columns = ["Image", "Transport Name", "Type", "License Plate", "Capacity", "Amenities", "Status", "Actions"];

export default function TransporterVehiclesPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Transport</h1>
          <p className="text-sm md:text-base text-slate-600">Manage Your Fleet</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-4 h-4" />
          Add Transport
        </button>
      </div>

      <DashboardTable columns={columns} />
    </div>
  );
}
