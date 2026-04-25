"use client";

import { ReactNode } from "react";

// Visual primitives mirroring apps/web/app/dashboard/_Components/ui.tsx but
// without the motion/react dependency — admin app stays lean. Plain Tailwind
// transitions cover the same feel.

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in-up ${className}`}>{children}</div>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  kicker?: string;
}

export function PageHeader({ title, subtitle, action, kicker }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="min-w-0">
        {kicker && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 mb-2">
            {kicker}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1.5 max-w-xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type StatusTone = "emerald" | "yellow" | "red" | "blue" | "slate" | "orange";

const toneMap: Record<StatusTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
};

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 text-zinc-900 font-medium px-4 py-2.5 rounded-xl text-sm transition-all ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-slate-100 animate-pulse ${className}`} />;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16">
      {icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900"
        >
          Retry
        </button>
      )}
    </div>
  );
}
