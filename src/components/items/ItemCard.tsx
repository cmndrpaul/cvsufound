import Link from "next/link";
import { CalendarIcon, ImageIcon, PinIcon } from "@/components/ui/icons";
import { TypeBadge } from "@/components/ui/Badge";
import { formatDate, photoUrl } from "@/lib/utils";
import type { ItemWithRefs } from "@/types/database";

export function ItemCard({ item }: { item: ItemWithRefs }) {
  const photo = photoUrl(item.photo_path);
  const place = [item.locations?.name, item.location_detail].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white no-underline transition-shadow hover:shadow-lg"
    >
      <div className="relative flex h-40 items-center justify-center bg-brand-100 text-[#5c8466]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <ImageIcon width={38} height={38} />
            <span className="text-[13px] font-semibold text-[#3f6b4b]">No photo</span>
          </div>
        )}
        <TypeBadge type={item.type} className="absolute left-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
        <span className="text-[12.5px] font-bold tracking-wide text-brand-600">
          {item.categories?.name ?? "Uncategorized"}
        </span>
        <h3 className="break-words text-lg font-bold leading-snug text-ink-900">{item.title}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-ink-700">
          <span className="flex min-w-0 items-start gap-2 break-words">
            <PinIcon width={16} height={16} />
            {place || "Location not specified"}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <CalendarIcon width={16} height={16} />
            {formatDate(item.event_date)}
          </span>
        </div>
        <span className="mt-auto pt-2 text-[15px] font-bold text-brand-700 group-hover:underline">
          View details
        </span>
      </div>
    </Link>
  );
}

/** Placeholder shown while the list streams in. */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5"
      aria-busy="true"
      aria-label="Loading items"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-100" />
      ))}
    </div>
  );
}
