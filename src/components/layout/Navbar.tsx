import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

const linkClass = "rounded-lg px-1 py-2 text-[15px] font-semibold text-ink-900 hover:text-brand-700";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <Logo />

        <nav
          aria-label="Main"
          className="order-3 flex w-full flex-wrap items-center gap-x-6 md:order-none md:w-auto"
        >
          <Link href="/items" className={linkClass}>
            Browse items
          </Link>
          <Link href="/#how" className={linkClass}>
            How it works
          </Link>
          <Link href="/report" className={linkClass}>
            Report an item
          </Link>
        </nav>

        {/* Reads the login cookie, so it streams in after the page shell. */}
        <Suspense fallback={<div className="h-11 w-44" aria-hidden="true" />}>
          <AuthLinks />
        </Suspense>
      </div>
    </header>
  );
}

async function AuthLinks() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2.5">
        <Link href="/login" className={buttonClass("secondary")}>
          Log in
        </Link>
        <Link href="/signup" className={buttonClass("primary")}>
          Sign up
        </Link>
      </div>
    );
  }

  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link href="/my-reports" className={linkClass}>
        My reports
      </Link>
      {profile?.role === "admin" ? (
        <Link href="/admin" className={linkClass}>
          Admin
        </Link>
      ) : null}
      <form action={signOut}>
        <button type="submit" className={buttonClass("secondary")}>
          Sign out
        </button>
      </form>
    </div>
  );
}
