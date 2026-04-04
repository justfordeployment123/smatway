function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="relative w-full max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
            alt="Smatway Vehicle"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
          <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-3">
            <div className="bg-emerald-500 rounded-full p-2">
              <CheckIcon />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Verified</div>
              <div className="text-sm text-slate-600">Safe &amp; Trusted</div>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white" />
              </div>
            </div>
            <div className="font-semibold text-slate-900">50K+</div>
            <div className="text-sm text-slate-600">Happy Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <LeftPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
