import Link from "next/link";
import { SearchIcon } from "@/components/ui/icons";

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label="CvSUFound home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-gold-400">
        <SearchIcon width={22} height={22} strokeWidth={2.4} />
      </span>
      <span
        className={`font-display text-2xl font-extrabold tracking-tight ${
          tone === "light" ? "text-brand-800" : "text-white"
        }`}
      >
        CvSU<span className={tone === "light" ? "text-brand-600" : "text-gold-400"}>Found</span>
      </span>
    </Link>
  );
}
