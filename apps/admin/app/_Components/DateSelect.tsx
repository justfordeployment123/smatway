"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Polished number-select used by the CUSTOM date pickers across the admin
 * (bookings / audit / routes). Replaces the native `<select>` whose option
 * list is OS-styled and looks out of place.
 *
 * Responsive behavior:
 *   - Desktop (≥ sm): popover anchored to the trigger button.
 *   - Mobile (< sm): centered modal sheet via portal — easier to thumb-pick
 *     on a phone than a tiny dropdown jammed against the trigger.
 *
 * Both modes share the same hover states, active checkmark, keyboard nav
 * (ArrowUp/Down, Enter, Escape), and a "Clear selection" entry that appears
 * when a value is set.
 */
export function DateSelect({
  ariaLabel,
  placeholder,
  value,
  onChange,
  options,
  disabled,
}: {
  ariaLabel: string;
  placeholder: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  options: Array<{ value: number; label: string }>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Track the keyboard-highlighted index separately from the picked value
  // so ArrowUp/Down can move a focus ring without committing.
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedLabel = value != null
    ? options.find((o) => o.value === value)?.label ?? placeholder
    : placeholder;

  // Detect mobile viewport once the component mounts so SSR doesn't pick the
  // wrong rendering path. matchMedia listeners pick up rotation / resize.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639.98px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Click outside / Escape closes. For the modal mode we also lock body scroll.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (isMobile) return; // modal handles its own backdrop click
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile]);

  // When the popover opens, seed the keyboard cursor on the current value
  // (or first option) and scroll it into view so big lists like Year don't
  // start at row 1 every time.
  useEffect(() => {
    if (!open) return;
    const currentIdx = value != null ? options.findIndex((o) => o.value === value) : -1;
    setActiveIdx(currentIdx >= 0 ? currentIdx : 0);
    requestAnimationFrame(() => {
      const target = currentIdx >= 0 ? currentIdx : 0;
      const el = listRef.current?.children[target] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    });
  }, [open, options, value]);

  function commit(v: number | undefined) {
    onChange(v);
    setOpen(false);
  }

  function onTriggerKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt) commit(opt.value);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  // Shared list body, rendered into either the popover or the modal sheet.
  const list = (
    <ul
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={onListKey}
      className={
        isMobile
          ? "max-h-[60vh] overflow-y-auto py-1 text-sm"
          : "max-h-56 overflow-y-auto py-1 text-xs"
      }
    >
      {value != null && (
        <li>
          <button
            type="button"
            onClick={() => commit(undefined)}
            onMouseEnter={() => setActiveIdx(-2)}
            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide ${
              activeIdx === -2 ? "bg-slate-50 text-slate-700" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Clear selection
          </button>
          <li role="separator" className="my-1 border-t border-slate-100" aria-hidden />
        </li>
      )}
      {options.map((o, i) => {
        const selected = o.value === value;
        const active = i === activeIdx;
        return (
          <li key={o.value}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => commit(o.value)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 sm:py-1.5 text-left tabular-nums transition-colors ${
                isMobile ? "text-[15px]" : "text-[13px]"
              } ${
                selected
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : active
                  ? "bg-slate-50 text-zinc-900"
                  : "text-zinc-700"
              }`}
            >
              <span>{o.label}</span>
              {selected && (
                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className={`inline-flex items-center gap-1.5 rounded-lg border bg-white pl-3 pr-2 py-1.5 text-xs font-semibold transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed border-slate-200 text-slate-400"
            : open
            ? "border-emerald-400 ring-2 ring-emerald-200 text-zinc-900 cursor-pointer"
            : value != null
            ? "border-slate-200 text-zinc-900 hover:border-slate-300 cursor-pointer shadow-sm"
            : "border-slate-200 text-slate-400 hover:border-slate-300 cursor-pointer shadow-sm"
        }`}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180 text-emerald-600" : "text-slate-400"}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Desktop: popover anchored to the trigger. */}
      {open && !disabled && !isMobile && (
        <div className="absolute z-30 mt-1.5 w-max min-w-full rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          {list}
        </div>
      )}

      {/* Mobile: centered modal via portal — escapes any ancestor `transform`
          / `overflow` / `z-index` containers and gets full-screen real estate
          for thumb-picking from a long list. */}
      {open && !disabled && isMobile && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/40 backdrop-blur-sm sm:items-center"
          >
            {/* Bottom-sheet style on phones (slides up from the bottom edge),
                centered card on slightly larger touch viewports. */}
            <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{ariaLabel}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-zinc-900 hover:bg-slate-100 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {list}
            </div>
          </div>,
          document.body,
        )
      }
    </div>
  );
}
