"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Both actions only touch rows owned by the logged-in user.
// Row Level Security in Supabase enforces this again on the database side.

export async function markMyItemReturned(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (!user || !id) return;

  const supabase = await createClient();
  await supabase.from("items").update({ status: "returned" }).eq("id", id).eq("reporter_id", user.id);
  revalidatePath("/my-reports");
}

export async function deleteMyItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (!user || !id) return;

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("photo_path")
    .eq("id", id)
    .eq("reporter_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("items").delete().eq("id", id).eq("reporter_id", user.id);
  if (!error && item?.photo_path) {
    await supabase.storage.from("item-photos").remove([item.photo_path]);
  }
  revalidatePath("/my-reports");
}
