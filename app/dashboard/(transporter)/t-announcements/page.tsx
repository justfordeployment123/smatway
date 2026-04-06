import DashboardTable from "@/app/dashboard/_Components/DashboardTable";
import { PlusIcon, InfoCircleIcon } from "@/app/dashboard/_Components/Icons";

const columns = ["Title", "Message", "Target", "Priority", "Status", "Expires", "Actions"];

export default function TransporterAnnouncementsPage() {
  return (
    <div className="p-4 md:p-0 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">My Announcements</h1>
          <p className="text-sm md:text-base text-slate-600">Create and manage announcements for your travelers</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Info Alert */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <InfoCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Share Important Updates</p>
          <p className="text-sm text-blue-800 mt-0.5">
            Create announcements to inform travelers about delays, route changes, or important information. You can target all travelers or specific routes.
          </p>
        </div>
      </div>

      <DashboardTable columns={columns} />
    </div>
  );
}
