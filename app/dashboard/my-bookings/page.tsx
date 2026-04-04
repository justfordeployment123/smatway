export default function MyBookingsPage() {
  const columns = ["Booking Reference", "Vehicle", "Route", "Departure", "Seats", "Amount", "Payment", "Status", "QR Code", "Review"];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-600">View your travel bookings and history</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                  {/* Empty state */}
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="w-12 h-12 mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <p className="text-sm">No data</p>
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
