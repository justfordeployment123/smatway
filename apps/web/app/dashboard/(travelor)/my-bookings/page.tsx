import DashboardTable from "@/app/dashboard/_Components/DashboardTable";

const columns = [
  "Booking Reference",
  "Vehicle",
  "Route",
  "Departure",
  "Seats",
  "Amount",
  "Payment",
  "Status",
  "QR Code",
  "Review",
];

export default function MyBookingsPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-sm md:text-base text-slate-600">View your travel bookings and history</p>
      </div>

      <DashboardTable columns={columns} />
    </div>
  );
}
