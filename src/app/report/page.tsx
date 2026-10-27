import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SetupNotice } from "@/components/items/EmptyState";
import { ReportForm } from "@/components/items/ReportForm";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getLocations } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Report an item – CvSUFound" };

export default function ReportPage(props: PageProps<"/report">) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-12 lg:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-brand-800">Report an item</h1>
        <p className="text-base text-ink-700">
          The more detail you add, the easier it is to match the item with its owner.
        </p>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-brand-100" aria-busy="true" />}>
        <ReportContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function ReportContent({ searchParams }: { searchParams: PageProps<"/report">["searchParams"] }) {
  if (!isSupabaseConfigured) return <SetupNotice reason="keys" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/report");

  const params = await searchParams;
  const defaultType = firstParam(params.type) === "found" ? "found" : "lost";

  const supabase = await createClient();
  const [{ data: categories, error }, { data: locations }] = await Promise.all([
    getCategories(supabase),
    getLocations(supabase),
  ]);
  if (error) return <SetupNotice reason="database" />;

  return (
    <div className="rounded-3xl border border-brand-200 bg-white p-5 sm:p-8">
      <ReportForm categories={categories} locations={locations} userId={user.id} defaultType={defaultType} />
    </div>
  );
}
