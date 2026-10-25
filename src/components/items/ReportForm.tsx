"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  reportSchema,
  type ReportValues,
} from "@/lib/validations/item";
import type { Category, ItemType, Location } from "@/types/database";

export function ReportForm({
  categories,
  locations,
  userId,
  defaultType,
}: {
  categories: Category[];
  locations: Location[];
  userId: string;
  defaultType: ItemType;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: defaultType,
      title: "",
      description: "",
      category_id: "",
      location_id: "",
      location_detail: "",
      event_date: "",
    },
  });

  const type = useWatch({ control, name: "type" });

  function onPhotoChange(file: File | null) {
    setPhotoError(null);
    if (file && !PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WebP image.");
      setPhoto(null);
      return;
    }
    if (file && file.size > PHOTO_MAX_BYTES) {
      setPhotoError("The photo must be 5 MB or smaller.");
      setPhoto(null);
      return;
    }
    setPhoto(file);
  }

  async function onSubmit(values: ReportValues) {
    setServerError(null);
    const supabase = createClient();

    // 1. Upload the photo (optional) into this user's own folder.
    let photoPath: string | null = null;
    if (photo) {
      const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      photoPath = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-photos")
        .upload(photoPath, photo, { contentType: photo.type });
      if (uploadError) {
        setServerError(`Could not upload the photo: ${uploadError.message}`);
        return;
      }
    }

    // 2. Save the report.
    const { data, error } = await supabase
      .from("items")
      .insert({
        type: values.type,
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        location_id: values.location_id,
        location_detail: values.location_detail || null,
        event_date: values.event_date,
        photo_path: photoPath,
        reporter_id: userId,
      })
      .select("id")
      .single();

    if (error || !data) {
      if (photoPath) await supabase.storage.from("item-photos").remove([photoPath]);
      setServerError(error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(`/items/${data.id}`);
    router.refresh();
  }

  const isLost = type === "lost";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Lost / Found switch */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-bold text-ink-900">What are you reporting?</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["lost", "found"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setValue("type", t, { shouldValidate: true })}
              className={cn(
                "min-h-14 rounded-2xl border-2 px-4 text-base font-bold",
                type === t
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-brand-200 bg-white text-ink-700 hover:border-brand-700",
              )}
            >
              {t === "lost" ? "I lost something" : "I found something"}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="Item name" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder={isLost ? "e.g. Blue backpack with keychain" : "e.g. Keys with green lanyard"}
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" htmlFor="category_id" error={errors.category_id?.message}>
          <Select id="category_id" aria-invalid={Boolean(errors.category_id)} {...register("category_id")}>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={isLost ? "Date you lost it" : "Date you found it"}
          htmlFor="event_date"
          error={errors.event_date?.message}
        >
          <Input id="event_date" type="date" aria-invalid={Boolean(errors.event_date)} {...register("event_date")} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label={isLost ? "Where do you think you lost it?" : "Where did you find it?"}
          htmlFor="location_id"
          error={errors.location_id?.message}
        >
          <Select id="location_id" aria-invalid={Boolean(errors.location_id)} {...register("location_id")}>
            <option value="">Choose a place</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="More about the place (optional)"
          htmlFor="location_detail"
          error={errors.location_detail?.message}
        >
          <Input id="location_detail" placeholder="e.g. Room 204, second floor" {...register("location_detail")} />
        </Field>
      </div>

      <Field
        label="Description (optional)"
        htmlFor="description"
        error={errors.description?.message}
        hint={
          isLost
            ? "Colour, brand, and marks that help identify it."
            : "Keep one identifying detail to yourself. The owner will be asked to describe it."
        }
      >
        <Textarea id="description" {...register("description")} />
      </Field>

      <Field
        label="Photo (optional)"
        htmlFor="photo"
        error={photoError ?? undefined}
        hint="JPG, PNG or WebP, up to 5 MB. Don't photograph ID numbers or card details."
      >
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
          className="block w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-[15px] text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:font-bold file:text-brand-800"
        />
      </Field>

      {serverError ? (
        <p role="alert" className="rounded-xl bg-[#f3d6d6] px-4 py-3 text-[15px] font-semibold text-[#7a1f1f]">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Posting…" : isLost ? "Post lost report" : "Post found item"}
        </Button>
        <p className="text-sm text-ink-500">Your contact details stay private.</p>
      </div>
    </form>
  );
}
