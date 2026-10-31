"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { claimSchema, type ClaimValues } from "@/lib/validations/item";
import type { ItemType } from "@/types/database";

/**
 * "This is mine" (found item) or "I found this" (lost item).
 * The claim goes to the claim desk. Nobody's contact details are shown publicly.
 */
export function ClaimForm({
  itemId,
  userId,
  itemType,
}: {
  itemId: string;
  userId: string;
  itemType: ItemType;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { message: "" },
  });

  const isFoundItem = itemType === "found";

  async function onSubmit(values: ClaimValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("claims")
      .insert({ item_id: itemId, claimant_id: userId, message: values.message });

    if (error) {
      setServerError(
        error.code === "23505"
          ? "You already sent a request for this item."
          : "Could not send your request. Please try again.",
      );
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field
        label={isFoundItem ? "Prove it's yours" : "Tell us what you know"}
        htmlFor="claim-message"
        error={errors.message?.message}
        hint={
          isFoundItem
            ? "Describe something only the owner would know: contents, marks, serial number, lock-screen photo."
            : "Where and when you found it, and where it is now."
        }
      >
        <Textarea id="claim-message" {...register("message")} />
      </Field>

      {serverError ? (
        <p role="alert" className="text-sm font-semibold text-red-800">
          {serverError}
        </p>
      ) : null}

      <div>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Sending…" : isFoundItem ? "This is mine" : "I found this"}
        </Button>
      </div>
    </form>
  );
}
