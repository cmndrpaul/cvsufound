import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EmptyState, SetupNotice } from "@/components/items/EmptyState";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Item, MyClaim } from "@/types/database";
import { deleteMyItem, markMyItemReturned } from "./actions";

export const metadata: Metadata = { title: "My reports – CvSUFound" };

export default function MyReportsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:py-16">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">My reports</h1>
          <p className="text-base text-ink-700">Items you posted and requests you sent.</p>
        </div>
        <ButtonLink href="/report">New report</ButtonLink>
      </header>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-brand-100" aria-busy="true" />}>
        <MyReportsContent />
      </Suspense>
    </div>
  );
}

async function MyReportsContent() {
  if (!isSupabaseConfigured) return <SetupNotice reason="keys" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-reports");

  const supabase = await createClient();
  const [itemsRes, claimsRes] = await Promise.all([
    supabase.from("items").select("*").eq("reporter_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("claims")
      .select("*, items(id,title,type,status)")
      .eq("claimant_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (itemsRes.error) return <SetupNotice reason="database" />;
  const items = (itemsRes.data ?? []) as Item[];
  const claims = (claimsRes.data ?? []) as MyClaim[];

  return (
    <>
      <section aria-labelledby="my-items" className="flex flex-col gap-4">
        <h2 id="my-items" className="text-2xl font-bold text-ink-900">
          Items I posted
        </h2>
        {items.length === 0 ? (
          <EmptyState title="You haven't posted anything" showReportButtons>
            When you report a lost or found item, it will show up here.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 flex-col items-stretch gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={item.type} />
                    <StatusBadge status={item.status} />
                  </div>
                  <Link href={`/items/${item.id}`} className="break-words text-lg font-bold">
                    {item.title}
                  </Link>
                  <span className="text-sm text-ink-500">{formatDate(item.event_date)}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {item.status !== "returned" ? (
                    <form action={markMyItemReturned}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className={buttonClass("secondary")}>
                        {item.type === "lost" ? "I got it back" : "Handed back"}
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteMyItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className={buttonClass("danger")}>
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="my-claims" className="flex flex-col gap-4">
        <h2 id="my-claims" className="text-2xl font-bold text-ink-900">
          Requests I sent
        </h2>
        {claims.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-[15.5px] text-ink-700">
            You haven&apos;t sent any requests. Open an item and use &ldquo;This is mine&rdquo; or
            &ldquo;I found this&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="flex min-w-0 flex-col items-start gap-3 rounded-2xl border border-brand-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  {claim.items ? (
                    <Link href={`/items/${claim.items.id}`} className="break-words text-lg font-bold">
                      {claim.items.title}
                    </Link>
                  ) : (
                    <span className="text-lg font-bold">Item removed</span>
                  )}
                  <span className="text-sm text-ink-500">Sent {formatDate(claim.created_at)}</span>
                </div>
                <StatusBadge status={claim.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
