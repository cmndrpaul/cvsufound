import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

const linkClass = "rounded-lg px-1 py-2 text-[15px] font-semibold text-ink-900 hover:text-brand-700";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-x-6 px-5 py-3 sm:px-8">
        <Logo />

        <MobileNav>
          <Suspense fallback={<div className="h-11 w-44" aria-hidden="true" />}>
            <AuthLinks />
          </Suspense>
        </MobileNav>
      </div>
    </header>
  );
}

async function AuthLinks() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-2.5 md:flex-row">
        <Link href="/login" className={buttonClass("secondary", "md", "w-full md:w-auto")}>
          Log in
        </Link>
        <Link href="/signup" className={buttonClass("primary", "md", "w-full md:w-auto")}>
          Sign up
        </Link>
      </div>
    );
  }

  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center">
      <Link href="/my-reports" className={`${linkClass} min-h-12 border-b border-brand-100 md:min-h-0 md:border-0`}>
        My reports
      </Link>
      {profile?.role === "admin" ? (
        <Link href="/admin" className={`${linkClass} min-h-12 border-b border-brand-100 md:min-h-0 md:border-0`}>
          Admin
        </Link>
      ) : null}
      <form action={signOut}>
        <button type="submit" className={buttonClass("secondary", "md", "w-full md:w-auto")}>
          Sign out
        </button>
      </form>
    </div>
  );
}
