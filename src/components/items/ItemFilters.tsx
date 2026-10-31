import Form from "next/form";
import Link from "next/link";
import { buttonClass, buttonPressClass } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Category, ItemType, Location } from "@/types/database";

export interface ActiveFilters {
  q?: string;
  type?: ItemType;
  category?: string; // category slug
  location?: string; // location slug
}

/** Build a /items URL from a set of filters. */
export function itemsHref(filters: ActiveFilters, extra: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  const all = { ...filters, ...extra };
  for (const [key, value] of Object.entries(all)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/items?${qs}` : "/items";
}

export function ItemFilters({
  categories,
  locations,
  active,
}: {
  categories: Category[];
  locations: Location[];
  active: ActiveFilters;
}) {
  const tabs: { label: string; type?: ItemType }[] = [
    { label: "All" },
    { label: "Lost", type: "lost" },
    { label: "Found", type: "found" },
  ];
  const hasFilters = Boolean(active.q || active.type || active.category || active.location);

  return (
    <div className="flex flex-col gap-5">
      {/* Lost / Found tabs */}
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-[#e4ede0] p-1" role="group" aria-label="Item type">
        {tabs.map((tab) => {
          const selected = (active.type ?? undefined) === tab.type;
          return (
            <Link
              key={tab.label}
              href={itemsHref({ ...active, type: tab.type })}
              aria-current={selected ? "page" : undefined}
              className={cn(
                buttonPressClass,
                "active:bg-brand-100 active:text-brand-900",
                "flex min-h-11 shrink-0 items-center rounded-full px-6 text-[15px] font-bold no-underline",
                selected ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-brand-100",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Category chips */}
      <div className="flex max-w-full flex-nowrap gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Category">
        {[{ name: "All", slug: undefined as string | undefined }, ...categories].map((c) => {
          const selected = (active.category ?? undefined) === c.slug;
          return (
            <Link
              key={c.name}
              href={itemsHref({ ...active, category: c.slug })}
              aria-current={selected ? "page" : undefined}
              className={cn(
                buttonPressClass,
                "active:bg-brand-100 active:text-brand-900",
                "flex min-h-11 shrink-0 items-center rounded-full border-[1.5px] px-[18px] text-[14.5px] font-semibold no-underline",
                selected
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-brand-200 bg-white text-ink-700 hover:border-brand-700",
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Search + location */}
      <Form action="/items" className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {active.type ? <input type="hidden" name="type" value={active.type} /> : null}
        {active.category ? <input type="hidden" name="category" value={active.category} /> : null}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="f-q" className="text-sm font-bold text-ink-900">
            Search
          </label>
          <Input id="f-q" name="q" defaultValue={active.q ?? ""} placeholder="Title, description or place" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="f-loc" className="text-sm font-bold text-ink-900">
            Location
          </label>
          <Select id="f-loc" name="location" defaultValue={active.location ?? ""}>
            <option value="">Anywhere on campus</option>
            {locations.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
        <button type="submit" className={buttonClass("primary", "md", "w-full sm:w-auto")}>
          Apply
        </button>
        {hasFilters ? (
          <Link href="/items" className={buttonClass("ghost", "md", "w-full sm:w-auto")}>
            Clear filters
          </Link>
        ) : null}
      </Form>
    </div>
  );
}
