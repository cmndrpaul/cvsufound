"use client";

import { Suspense, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import { buttonPressClass } from "@/components/ui/Button";
import { usePathname } from "next/navigation";

const menuLinks = [
  { href: "/items", label: "Browse items" },
  { href: "/#how", label: "How it works" },
  { href: "/report", label: "Report an item" },
];

export function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => {
      setIsMobile(!mediaQuery.matches);
      if (mediaQuery.matches) setOpen(false);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`${buttonPressClass} flex min-h-11 min-w-11 items-center justify-center rounded-xl text-brand-800 hover:bg-brand-50 enabled:active:bg-brand-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold-400 md:hidden`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        id="mobile-navigation"
        aria-hidden={!open && isMobile}
        inert={!open && isMobile}
        className="absolute inset-x-0 top-full z-50 w-full border-y border-brand-200 bg-white md:static md:z-auto md:w-auto md:border-0 md:bg-transparent md:contents"
      >
        <div
          className={`grid transition-[grid-template-rows,opacity,visibility] duration-200 motion-reduce:transition-none md:contents md:grid-rows-[1fr] md:opacity-100 md:visible ${
            open ? "grid-rows-[1fr] opacity-100 visible" : "grid-rows-[0fr] opacity-0 invisible"
          }`}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
          }}
          onSubmit={() => setOpen(false)}
        >
          <div className="min-h-0 overflow-hidden px-5 sm:px-8 md:contents md:overflow-visible">
            <nav aria-label="Main" className="flex flex-col md:flex-row md:items-center md:gap-x-6">
              {menuLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-12 items-center border-b border-brand-100 py-2 text-[15px] font-semibold text-ink-900 hover:text-brand-700 md:min-h-11 md:border-0 md:py-2"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="py-3 md:py-0">{children}</div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <PathnameChangeCloser setOpen={setOpen} />
      </Suspense>
    </>
  );
}

function PathnameChangeCloser({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) {
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return null;
}
