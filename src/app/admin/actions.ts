"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Every admin action first checks that the caller really is an admin.
// Row Level Security in Supabase checks it again on the database side.
async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("Not allowed");
  return createClient();
}

/** Approve or reject a claim. Approving also marks the item as "claimed". */
export async function reviewClaim(formData: FormData) {
  const claimId = String(formData.get("claim_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!claimId || (decision !== "approved" && decision !== "rejected")) return;

  const supabase = await requireAdmin();
  const { error } = await supabase.from("claims").update({ status: decision }).eq("id", claimId);
  if (!error && decision === "approved" && itemId) {
    await supabase.from("items").update({ status: "claimed" }).eq("id", itemId);
  }
  revalidatePath("/admin");
}

/** Mark an item as handed back to its owner. */
export async function markReturned(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase.from("items").update({ status: "returned" }).eq("id", id);
  revalidatePath("/admin");
}

/** Remove an item (for example, spam). */
export async function deleteItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await requireAdmin();
  await supabase.from("items").delete().eq("id", id);
  revalidatePath("/admin");
}
