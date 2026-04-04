function AntEmptyInbox() {
  return (
    <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
      <title>No data</title>
      <g transform="translate(0 1)" fill="none" fillRule="evenodd">
        <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7" />
        <g fillRule="nonzero" stroke="#d9d9d9">
          <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
          <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa" />
        </g>
      </g>
    </svg>
  );
}

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
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors w-full sm:w-auto justify-center"
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <AntEmptyInbox />
                    <p className="text-sm mt-2">No data</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
