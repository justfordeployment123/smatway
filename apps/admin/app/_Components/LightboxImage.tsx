"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Click-to-zoom image. Renders a thumbnail that, when clicked, opens the
 * full image centered on a dimmed backdrop. Use this everywhere we render
 * a Garage / S3 image the admin might want to inspect (bug-report
 * screenshots, announcement attachments, vehicle photos) instead of the
 * old `<a target="_blank">` pattern — keeps the admin inside the console.
 *
 * Closes on: Escape key, clicking the backdrop, or the close button.
 * Locks body scroll while open. Uses a portal so the overlay isn't trapped
 * by ancestor `transform` / `overflow` containers.
 */
export function LightboxImage({
  src,
  alt = "",
  className = "",
  imgProps,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "className" | "onClick">;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
        src={src}
        alt={alt}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`cursor-zoom-in ${className}`}
      />

      {mounted && open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Image preview"}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in-up"
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl cursor-default"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
