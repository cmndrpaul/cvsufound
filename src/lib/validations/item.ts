import { z } from "zod";
import { siteConfig } from "@/lib/site";

// ---------- Report form (lost / found) ----------
function todayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const reportSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters.")
    .max(80, "Keep the title under 80 characters."),
  description: z.string().trim().max(500, "Keep the description under 500 characters."),
  category_id: z.string().min(1, "Choose a category."),
  location_id: z.string().min(1, "Choose a location."),
  location_detail: z.string().trim().max(120, "Keep this under 120 characters."),
  event_date: z
    .string()
    .min(1, "Pick a date.")
    .refine((value) => value <= todayLocal(), { message: "The date can't be in the future." }),
});
export type ReportValues = z.infer<typeof reportSchema>;

// ---------- Claim form ----------
export const claimSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(500, "Keep it under 500 characters."),
});
export type ClaimValues = z.infer<typeof claimSchema>;

// ---------- Login / signup ----------
export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name."),
    student_number: z.string().trim().max(30, "That looks too long."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirm_password: z.string().min(1, "Re-enter your password."),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine(
    (v) => {
      const domain = siteConfig.allowedEmailDomain.trim().toLowerCase();
      return !domain || v.email.toLowerCase().endsWith(`@${domain}`);
    },
    {
      message: `Please use your @${siteConfig.allowedEmailDomain} email address.`,
      path: ["email"],
    },
  );
export type SignupValues = z.infer<typeof signupSchema>;

// ---------- Photo rules (checked in the browser before upload) ----------
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
