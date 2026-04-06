import DashboardTable from "@/app/dashboard/_Components/DashboardTable";

const columns = ["Vehicle", "Route", "Stops", "Departure", "Arrival", "Price", "Seats Available", "Status", "Actions"];

export default function TransporterRoutesPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Routes</h1>
          <p className="text-sm md:text-base text-slate-600">Manage your transportation routes</p>
        </div>
        <button
          type="button"
          disabled
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Add Route
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm md:text-base text-blue-900">
          <strong>Note:</strong> You need to add at least one vehicle before creating routes. Please add a vehicle first.
        </p>
      </div>

      <DashboardTable columns={columns} />
    </div>
  );
}
