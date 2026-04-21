import { Suspense } from 'react';
import ResetPasswordForm from './form';

function LoadingFallback() {
  return (
    <div className="w-full animate-fade-in-up">
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
          <div className="w-10 h-10 text-emerald-600">Loading...</div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Reset your password</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
