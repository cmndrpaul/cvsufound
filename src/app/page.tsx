import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, SetupNotice } from "@/components/items/EmptyState";
import { GridSkeleton, ItemCard } from "@/components/items/ItemCard";
import { SearchForm } from "@/components/items/SearchForm";
import { TypeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CameraIcon, ImageIcon, SearchIcon, ShieldIcon } from "@/components/ui/icons";
import { getCategories, getItems, getLocations } from "@/lib/queries";
import { siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatDate, photoUrl } from "@/lib/utils";
import type { ItemWithRefs } from "@/types/database";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="browse" className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 pb-6 pt-10 sm:px-8 sm:pt-16 lg:pt-20">
        {!isSupabaseConfigured ? <SetupNotice reason="keys" /> : null}
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">
            Recent reports
          </h2>
          <p className="text-base text-ink-700">The newest lost and found items on campus.</p>
        </div>
        <Suspense fallback={<GridSkeleton count={4} />}>
          <RecentItems />
        </Suspense>
      </section>
      <HowItWorks />
      <ReportCtas />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-brand-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-10 px-5 py-10 sm:px-8 sm:py-14 md:flex-row md:items-center md:gap-10 lg:gap-14 lg:py-20">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <span className="w-fit rounded-full bg-[#1b6a3a] px-3.5 py-1.5 text-sm font-semibold text-gold-200">
            {siteConfig.tagline}
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Lost something on campus? <span className="text-gold-400">Let&apos;s find it.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#cfe5d3]">
            Search items turned in by fellow students and staff, or post what you lost so the person
            who found it can reach the claim desk.
          </p>

          <div className="mt-2">
            <Suspense fallback={<SearchForm locations={[]} />}>
              <HeroSearch />
            </Suspense>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 text-[15px] text-[#cfe5d3]">
            <span>Or</span>
            <Link href="/report?type=lost" className="font-bold !text-gold-400">
              Report a lost item
            </Link>
            <span aria-hidden="true" className="opacity-50">
              |
            </span>
            <Link href="/report?type=found" className="font-bold !text-gold-400">
              Post a found item
            </Link>
          </div>
        </div>

        {/* Right side: the newest real reports, or tips while there are none. */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-4">
          <Suspense fallback={<TipCards />}>
            <HeroSide />
          </Suspense>
          <VerifyNote />
        </div>
      </div>
    </section>
  );
}

async function HeroSearch() {
  if (!isSupabaseConfigured) return <SearchForm locations={[]} />;
  const supabase = await createClient();
  const { data: locations } = await getLocations(supabase);
  return <SearchForm locations={locations} />;
}

/** Shows the 2 newest open reports. Falls back to tips when there are none. */
async function HeroSide() {
  if (!isSupabaseConfigured) return <TipCards />;

  const supabase = await createClient();
  const { items, error } = await getItems(supabase, { pageSize: 2 });
  if (error || items.length === 0) return <TipCards />;

  return (
    <>
      {items.map((item, i) => (
        <HeroItemCard key={item.id} item={item} shifted={i === 1} />
      ))}
    </>
  );
}

function HeroItemCard({ item, shifted }: { item: ItemWithRefs; shifted: boolean }) {
  const photo = photoUrl(item.photo_path);
  const isLost = item.type === "lost";
  const place = [item.locations?.name, item.location_detail].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/items/${item.id}`}
      className={`flex w-full max-w-md items-center gap-4 rounded-[22px] bg-white p-[18px] no-underline shadow-[0_14px_30px_rgba(0,0,0,0.2)] ${
        shifted ? "md:w-[calc(100%-3rem)] md:self-end" : ""
      }`}
    >
      <span
        className={`flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-[14px] ${
          isLost ? "bg-[#fbebd2] text-[#9a5a12]" : "bg-brand-100 text-[#4c7a58]"
        }`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon width={32} height={32} />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <TypeBadge type={item.type} className="w-fit" />
        <span className="truncate text-[17px] font-bold text-ink-900">{item.title}</span>
        <span className="truncate text-sm text-ink-700">
          {place || "Location not specified"} &middot; {formatDate(item.event_date)}
        </span>
      </span>
    </Link>
  );
}

function TipCards() {
  const tips = [
    {
      icon: <SearchIcon width={28} height={28} />,
      title: "Search first",
      text: "Someone may have already turned your item in.",
    },
    {
      icon: <CameraIcon width={28} height={28} />,
      title: "Add a clear photo",
      text: "Photos help owners recognise their things quickly.",
    },
  ];

  return (
    <>
      {tips.map((tip, i) => (
        <div
          key={tip.title}
          className={`flex w-full max-w-md items-center gap-4 rounded-[22px] bg-white p-[18px] shadow-[0_14px_30px_rgba(0,0,0,0.2)] ${
            i === 1 ? "md:w-[calc(100%-3rem)] md:self-end" : ""
          }`}
        >
          <span className="flex h-20 w-20 flex-none items-center justify-center rounded-[14px] bg-brand-100 text-brand-700">
            {tip.icon}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[17px] font-bold text-ink-900">{tip.title}</span>
            <span className="text-sm leading-snug text-ink-700">{tip.text}</span>
          </span>
        </div>
      ))}
    </>
  );
}

function VerifyNote() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-[22px] bg-gold-400 px-[22px] py-[18px] text-brand-900">
      <ShieldIcon width={28} height={28} className="flex-none" />
      <span className="text-[15px] font-semibold leading-snug">
        Ownership is verified before any item is handed back.
      </span>
    </div>
  );
}

async function RecentItems() {
  if (!isSupabaseConfigured) {
    return (
      <EmptyState title="Nothing to show yet" showReportButtons={false}>
        Once Supabase is connected, new reports will appear here.
      </EmptyState>
    );
  }

  const supabase = await createClient();
  const [{ data: categories }, { items, error }] = await Promise.all([
    getCategories(supabase),
    getItems(supabase, { pageSize: 8 }),
  ]);

  if (error) return <SetupNotice reason="database" />;

  return (
    <div className="flex flex-col gap-7">
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2.5" aria-label="Browse by category">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/items?category=${c.slug}`}
              className="flex min-h-11 items-center rounded-full border-[1.5px] border-brand-200 bg-white px-[18px] text-[14.5px] font-semibold text-ink-700 no-underline hover:border-brand-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="No reports yet">
          Nothing has been posted so far. If you lost something or found something, be the first to
          post it.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <div className="flex justify-center">
            <ButtonLink href="/items" size="lg">
              Browse all items
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}

function HowItWorks() {
  const desk = siteConfig.claimDesk;
  const steps = [
    {
      title: "Post a report",
      text: "Add a photo, a short description, and where and when it happened. Lost or found, it takes about a minute.",
    },
    {
      title: "Get matched",
      text: "Search by category or place. When a listing looks like yours, send a request through the site.",
    },
    {
      title: "Claim it safely",
      text: `Prove ownership with a detail only you would know, then pick the item up at ${desk.office}, ${desk.location}.`,
    },
  ];

  return (
    <section id="how" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-6 pt-12 sm:px-8 sm:pt-16 lg:pt-20">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">
          How CvSUFound works
        </h2>
        <p className="text-base text-ink-700">Three steps from missing to matched.</p>
      </div>
      <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3.5 rounded-[20px] border border-brand-200 bg-white p-6 sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-brand-700 font-display text-[22px] font-extrabold text-gold-400">
              {i + 1}
            </span>
            <h3 className="text-xl font-bold text-ink-900">{s.title}</h3>
            <p className="text-[15.5px] leading-relaxed text-ink-700">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReportCtas() {
  const desk = siteConfig.claimDesk;
  return (
    <section id="report" className="mx-auto w-full max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-16 lg:pb-20 lg:pt-12">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-brand-100 p-6 sm:p-10">
          <h3 className="font-display text-3xl font-extrabold tracking-tight text-brand-800">
            I lost something
          </h3>
          <p className="text-base leading-relaxed text-[#2f4a38]">
            Describe it once. It will be shown to everyone who turns in items on campus.
          </p>
          <ButtonLink href="/report?type=lost" size="lg">
            Report lost item
          </ButtonLink>
        </div>
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-brand-800 p-6 sm:p-10">
          <h3 className="font-display text-3xl font-extrabold tracking-tight text-white">
            I found something
          </h3>
          <p className="text-base leading-relaxed text-[#cfe5d3]">
            Post it here, then leave it at {desk.office} ({desk.location}) so the owner can claim it.
          </p>
          <ButtonLink href="/report?type=found" variant="gold" size="lg">
            Post found item
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}