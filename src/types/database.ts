// Hand-written types that mirror supabase/migrations/0001_schema.sql.
// If you change a table, update the matching type here.

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "returned";
export type ClaimStatus = "pending" | "approved" | "rejected";
export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  student_number: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category_id: string | null;
  location_id: string | null;
  location_detail: string | null;
  event_date: string; // YYYY-MM-DD
  photo_path: string | null;
  status: ItemStatus;
  reporter_id: string;
  created_at: string;
}

/** An item plus the names from the joined categories/locations tables. */
export interface ItemWithRefs extends Item {
  categories: { name: string; slug: string } | null;
  locations: { name: string; slug: string } | null;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string;
  status: ClaimStatus;
  created_at: string;
}

/** A claim as shown on the admin page (with the item and claimant joined). */
export interface ClaimWithRefs extends Claim {
  items: Pick<Item, "id" | "title" | "type" | "status"> | null;
  profiles: Pick<Profile, "full_name" | "student_number" | "email"> | null;
}

/** A claim as shown on "My reports" (with the item joined). */
export interface MyClaim extends Claim {
  items: Pick<Item, "id" | "title" | "type" | "status"> | null;
}
