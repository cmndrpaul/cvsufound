import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SetupNotice } from "@/components/items/EmptyState";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { ClaimWithRefs, Item } from "@/types/database";
import { deleteItem, markReturned, reviewClaim } from "./actions";

export const metadata: Metadata = { title: "Claim desk – CvSUFound" };

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">Claim desk</h1>
        <p className="text-base text-ink-700">Review requests and keep the listings tidy.</p>
      </header>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-brand-100" aria-busy="true" />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

async function AdminContent() {
  if (!isSupabaseConfigured) return <SetupNotice reason="keys" />;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");

  if (profile.role !== "admin") {
    return (
      <div role="alert" className="rounded-2xl border border-brand-200 bg-white p-8">
        <h2 className="mb-2 text-xl font-bold text-ink-900">Admins only</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-700">
          Your account doesn&apos;t have access to the claim desk. If you work at the claim desk, ask the
          site owner to give your account the admin role.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [pendingRes, itemsRes] = await Promise.all([
    supabase
      .from("claims")
      .select("*, items(id,title,type,status), profiles(full_name,student_number,email)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("items").select("*").neq("status", "returned").order("created_at", { ascending: false }).limit(50),
  ]);

  if (pendingRes.error || itemsRes.error) return <SetupNotice reason="database" />;
  const pending = (pendingRes.data ?? []) as ClaimWithRefs[];
  const items = (itemsRes.data ?? []) as Item[];

  return (
    <>
      <section aria-labelledby="pending" className="flex flex-col gap-4">
        <h2 id="pending" className="text-2xl font-bold text-ink-900">
          Pending requests ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-[15.5px] text-ink-700">
            No requests waiting for review.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {pending.map((claim) => (
              <li key={claim.id} className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-white p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {claim.items ? <TypeBadge type={claim.items.type} /> : null}
                  {claim.items ? (
                    <Link href={`/items/${claim.items.id}`} className="text-lg font-bold">
                      {claim.items.title}
                    </Link>
                  ) : (
                    <span className="text-lg font-bold">Item removed</span>
                  )}
                  <span className="text-sm text-ink-500">· sent {formatDate(claim.created_at)}</span>
                </div>

                <dl className="grid gap-x-8 gap-y-1 text-[15px] sm:grid-cols-3">
                  <div>
                    <dt className="font-bold text-ink-900">Name</dt>
                    <dd className="text-ink-700">{claim.profiles?.full_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink-900">Student number</dt>
                    <dd className="text-ink-700">{claim.profiles?.student_number || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink-900">Email</dt>
                    <dd className="break-all text-ink-700">{claim.profiles?.email || "—"}</dd>
                  </div>
                </dl>

                <p className="whitespace-pre-line rounded-xl bg-brand-50 p-4 text-[15.5px] leading-relaxed text-ink-900">
                  {claim.message}
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <form action={reviewClaim}>
                    <input type="hidden" name="claim_id" value={claim.id} />
                    <input type="hidden" name="item_id" value={claim.item_id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button type="submit" className={buttonClass("primary")}>
                      Approve
                    </button>
                  </form>
                  <form action={reviewClaim}>
                    <input type="hidden" name="claim_id" value={claim.id} />
                    <input type="hidden" name="item_id" value={claim.item_id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button type="submit" className={buttonClass("danger")}>
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="listings" className="flex flex-col gap-4">
        <h2 id="listings" className="text-2xl font-bold text-ink-900">
          Active listings
        </h2>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-[15.5px] text-ink-700">
            There are no active listings.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-white p-5"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={item.type} />
                    <StatusBadge status={item.status} />
                  </div>
                  <Link href={`/items/${item.id}`} className="text-lg font-bold">
                    {item.title}
                  </Link>
                  <span className="text-sm text-ink-500">{formatDate(item.event_date)}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <form action={markReturned}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className={buttonClass("secondary")}>
                      Mark returned
                    </button>
                  </form>
                  <form action={deleteItem}>
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
    </>
  );
}
