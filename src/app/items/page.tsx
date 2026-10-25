import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState, SetupNotice } from "@/components/items/EmptyState";
import { GridSkeleton, ItemCard } from "@/components/items/ItemCard";
import { ItemFilters, itemsHref, type ActiveFilters } from "@/components/items/ItemFilters";
import { ButtonLink } from "@/components/ui/Button";
import { ITEMS_PER_PAGE, getCategories, getItems, getLocations } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/utils";
import type { ItemType } from "@/types/database";

export const metadata: Metadata = { title: "Browse items – CvSUFound" };

export default function ItemsPage(props: PageProps<"/items">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">Browse items</h1>
        <p className="text-base text-ink-700">Search everything that has been reported lost or found.</p>
      </header>
      <Suspense fallback={<GridSkeleton />}>
        <ItemsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function ItemsContent({ searchParams }: { searchParams: PageProps<"/items">["searchParams"] }) {
  if (!isSupabaseConfigured) return <SetupNotice reason="keys" />;

  const params = await searchParams;
  const typeParam = firstParam(params.type);
  const active: ActiveFilters = {
    q: firstParam(params.q),
    type: typeParam === "lost" || typeParam === "found" ? (typeParam as ItemType) : undefined,
    category: firstParam(params.category),
    location: firstParam(params.location),
  };
  const page = Math.max(1, Number.parseInt(firstParam(params.page) ?? "1", 10) || 1);

  const supabase = await createClient();
  const [{ data: categories, error: catError }, { data: locations }] = await Promise.all([
    getCategories(supabase),
    getLocations(supabase),
  ]);
  if (catError) return <SetupNotice reason="database" />;

  const { items, total, error } = await getItems(supabase, {
    q: active.q,
    type: active.type,
    categoryId: categories.find((c) => c.slug === active.category)?.id,
    locationId: locations.find((l) => l.slug === active.location)?.id,
    page,
  });
  if (error) return <SetupNotice reason="database" />;

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasFilters = Boolean(active.q || active.type || active.category || active.location);

  return (
    <div className="flex flex-col gap-8">
      <ItemFilters categories={categories} locations={locations} active={active} />

      <p className="text-base text-ink-700" aria-live="polite">
        {total === 1 ? "1 item" : `${total} items`}
      </p>

      {items.length === 0 ? (
        hasFilters ? (
          <EmptyState title="No matching items" showReportButtons={false}>
            Try a different word, remove a filter, or post your own report so others can help.
          </EmptyState>
        ) : (
          <EmptyState title="No reports yet">
            Nothing has been posted so far. Be the first to report a lost or found item.
          </EmptyState>
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
          {page > 1 ? (
            <ButtonLink href={itemsHref(active, { page: String(page - 1) })} variant="secondary">
              Previous
            </ButtonLink>
          ) : null}
          <span className="text-[15px] text-ink-700">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <ButtonLink href={itemsHref(active, { page: String(page + 1) })} variant="secondary">
              Next
            </ButtonLink>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
