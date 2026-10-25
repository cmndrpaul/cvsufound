import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const desk = siteConfig.claimDesk;

  return (
    <footer className="bg-brand-900 text-[#cfe5d3]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-12 px-5 py-14 sm:px-8">
        <div className="flex max-w-sm flex-1 basis-72 flex-col gap-3">
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">
            CvSU<span className="text-gold-400">Found</span>
          </span>
          <p className="text-[15px] leading-relaxed">
            {siteConfig.tagline}. Report it, find it, claim it.
          </p>
        </div>

        <div className="flex flex-wrap gap-14 text-[15px]">
          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-bold text-white">Explore</span>
            <Link href="/items" className="hover:text-white">
              Browse items
            </Link>
            <Link href="/#how" className="hover:text-white">
              How it works
            </Link>
            <Link href="/report" className="hover:text-white">
              Report an item
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="mb-1 font-bold text-white">Claim desk</span>
            <span>{desk.office}</span>
            <span>{desk.location}</span>
            <span>{desk.hours}</span>
            <span>{desk.contact}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-700">
        <p className="mx-auto w-full max-w-6xl px-5 py-4 text-sm text-[#a9c9b0] sm:px-8">
          &copy; {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
