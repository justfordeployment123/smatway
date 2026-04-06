import DashboardTable from "@/app/dashboard/_Components/DashboardTable";

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
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Info Alert */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <svg viewBox="64 64 896 896" width="16" height="16" fill="currentColor" className="text-blue-500 mt-0.5 flex-shrink-0" style={{ minWidth: 16 }}>
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" />
        </svg>
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
