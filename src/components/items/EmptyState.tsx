import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";

/** Friendly message shown when there are no items yet. */
export function EmptyState({
  title,
  children,
  showReportButtons = true,
}: {
  title: string;
  children?: ReactNode;
  showReportButtons?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <SearchIcon width={26} height={26} />
      </span>
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-brand-800">{title}</h3>
      {children ? <p className="max-w-md text-[15.5px] leading-relaxed text-ink-700">{children}</p> : null}
      {showReportButtons ? (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/report?type=lost" variant="primary">
            Report a lost item
          </ButtonLink>
          <ButtonLink href="/report?type=found" variant="secondary">
            Post a found item
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

/** Shown when the Supabase keys or tables are not set up yet. */
export function SetupNotice({ reason }: { reason: "keys" | "database" }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-gold-400 bg-gold-200/50 px-5 py-4 text-[15px] leading-relaxed text-brand-900"
    >
      {reason === "keys" ? (
        <>
          <strong>Supabase isn&apos;t connected yet.</strong> Add your project URL and key to{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">.env.local</code>, then restart{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">npm run dev</code>.
        </>
      ) : (
        <>
          <strong>The database isn&apos;t set up yet.</strong> Run the SQL files in{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">supabase/migrations</code> in the
          Supabase SQL Editor, in order.
        </>
      )}
    </div>
  );
}
