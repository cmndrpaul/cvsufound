import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClaimForm } from "@/components/items/ClaimForm";
import { SetupNotice } from "@/components/items/EmptyState";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CalendarIcon, ImageIcon, PinIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth";
import { getItem } from "@/lib/queries";
import { siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate, isUuid, photoUrl } from "@/lib/utils";
import type { ClaimStatus } from "@/types/database";

export default function ItemPage(props: PageProps<"/items/[id]">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12 lg:py-16">
      <Link href="/items" className="mb-6 inline-block text-[15px] font-bold">
        &larr; Back to all items
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-brand-100" aria-busy="true" />}>
        <ItemDetail params={props.params} />
      </Suspense>
    </div>
  );
}

async function ItemDetail({ params }: { params: PageProps<"/items/[id]">["params"] }) {
  if (!isSupabaseConfigured) return <SetupNotice reason="keys" />;

  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { item, error } = await getItem(supabase, id);
  if (error) return <SetupNotice reason="database" />;
  if (!item) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === item.reporter_id;

  // Has this user already sent a request for the item?
  let myClaimStatus: ClaimStatus | null = null;
  if (user && !isOwner) {
    const { data } = await supabase
      .from("claims")
      .select("status")
      .eq("item_id", item.id)
      .eq("claimant_id", user.id)
      .maybeSingle();
    myClaimStatus = (data?.status as ClaimStatus | undefined) ?? null;
  }

  const photo = photoUrl(item.photo_path);
  const place = [item.locations?.name, item.location_detail].filter(Boolean).join(" · ");
  const desk = siteConfig.claimDesk;
  const isFoundItem = item.type === "found";

  return (
    <article className="grid min-w-0 gap-6 md:grid-cols-[1.1fr_1fr] md:gap-8">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-brand-100 text-[#5c8466] md:aspect-auto md:min-h-96">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon width={56} height={56} />
            <span className="font-semibold text-[#3f6b4b]">No photo added</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
          {item.categories ? (
            <span className="text-sm font-bold text-brand-600">{item.categories.name}</span>
          ) : null}
        </div>

        <h1 className="break-words font-display text-3xl font-extrabold leading-tight tracking-tight text-brand-800 sm:text-4xl">
          {item.title}
        </h1>

        <ul className="flex flex-col gap-2.5 text-base text-ink-700">
          <li className="flex min-w-0 items-start gap-2.5 break-words">
            <PinIcon /> {place || "Location not specified"}
          </li>
          <li className="flex items-center gap-2.5">
            <CalendarIcon /> {isFoundItem ? "Found on" : "Lost on"} {formatDate(item.event_date)}
          </li>
        </ul>

        {item.description ? (
          <p className="whitespace-pre-line text-[16.5px] leading-relaxed text-ink-900">{item.description}</p>
        ) : null}

        {/* Claim area */}
        <section aria-label="Claim" className="mt-2 rounded-2xl border border-brand-200 bg-white p-6">
          {item.status !== "open" ? (
            <p className="text-[15.5px] leading-relaxed text-ink-700">
              This item is no longer open. It has been marked <strong>{item.status}</strong>.
            </p>
          ) : isOwner ? (
            <p className="text-[15.5px] leading-relaxed text-ink-700">
              This is your report. Manage it from{" "}
              <Link href="/my-reports" className="font-bold">
                My reports
              </Link>
              .
            </p>
          ) : !user ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-[15.5px] leading-relaxed text-ink-700">
                {isFoundItem ? "Is this yours?" : "Did you find this?"} Log in to send a request to the
                claim desk.
              </p>
              <ButtonLink href={`/login?next=/items/${item.id}`}>Log in to continue</ButtonLink>
            </div>
          ) : myClaimStatus ? (
            <div className="flex flex-col gap-2 text-[15.5px] leading-relaxed text-ink-700">
              <p>
                <strong>Your request: </strong>
                <StatusBadge status={myClaimStatus} />
              </p>
              <p>
                {myClaimStatus === "approved"
                  ? `Approved. Please visit ${desk.office} (${desk.location}), ${desk.hours}, and bring a valid ID.`
                  : myClaimStatus === "rejected"
                    ? "The claim desk could not verify this request."
                    : "The claim desk will review it. Check My reports for updates."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink-900">
                {isFoundItem ? "Is this your item?" : "Did you find this item?"}
              </h2>
              <ClaimForm itemId={item.id} userId={user.id} itemType={item.type} />
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
