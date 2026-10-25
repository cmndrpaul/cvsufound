import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, ItemType, ItemWithRefs, Location } from "@/types/database";

export const ITEMS_PER_PAGE = 12;

const ITEM_SELECT = "*, categories(name,slug), locations(name,slug)";

export async function getCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  return { data: (data ?? []) as Category[], error: error?.message };
}

export async function getLocations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order")
    .order("name");
  return { data: (data ?? []) as Location[], error: error?.message };
}

export interface ItemFilters {
  q?: string;
  type?: ItemType;
  categoryId?: string;
  locationId?: string;
  page?: number;
  pageSize?: number;
}

/** Open items, newest first, with optional search and filters. */
export async function getItems(supabase: SupabaseClient, filters: ItemFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("items")
    .select(ITEM_SELECT, { count: "exact" })
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.locationId) query = query.eq("location_id", filters.locationId);

  if (filters.q) {
    // Remove characters that have a special meaning in the filter syntax.
    const safe = filters.q.replace(/[%,()*\\]/g, " ").trim();
    if (safe) {
      query = query.or(
        `title.ilike.%${safe}%,description.ilike.%${safe}%,location_detail.ilike.%${safe}%`,
      );
    }
  }

  const { data, error, count } = await query;
  return {
    items: (data ?? []) as ItemWithRefs[],
    total: count ?? 0,
    error: error?.message,
  };
}

export async function getItem(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("id", id)
    .maybeSingle();
  return { item: (data as ItemWithRefs | null) ?? null, error: error?.message };
}
