"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  loginSchema,
  signupSchema,
  type LoginValues,
  type SignupValues,
} from "@/lib/validations/item";

/** Only allow redirects to pages on this site. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    if (!isSupabaseConfigured) {
      setServerError("Supabase isn't connected yet. Add your keys to .env.local first.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError("Incorrect email or password.");
      return;
    }
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
      </Field>

      {serverError ? (
        <p role="alert" className="text-sm font-semibold text-red-800">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-[15px] text-ink-700">
        New here?{" "}
        <Link href="/signup" className="font-bold">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: "", student_number: "", email: "", password: "", confirm_password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    if (!isSupabaseConfigured) {
      setServerError("Supabase isn't connected yet. Add your keys to .env.local first.");
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name, student_number: values.student_number },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }
    if (data.session) {
      // Email confirmation is turned off, so the user is already logged in.
      router.push("/");
      router.refresh();
      return;
    }
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-6">
        <h2 className="font-display text-2xl font-extrabold text-brand-800">Check your email</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-700">
          We sent a confirmation link. Open it, then come back and{" "}
          <Link href="/login" className="font-bold">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  const domain = siteConfig.allowedEmailDomain;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
        <Input id="full_name" autoComplete="name" {...register("full_name")} />
      </Field>
      <Field
        label="Student number (optional)"
        htmlFor="student_number"
        error={errors.student_number?.message}
        hint="Only the claim desk can see this."
      >
        <Input id="student_number" {...register("student_number")} />
      </Field>
      <Field
        label="Email"
        htmlFor="email"
        error={errors.email?.message}
        hint={domain ? `Use your @${domain} address.` : undefined}
      >
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters.">
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm_password" error={errors.confirm_password?.message}>
        <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
      </Field>

      {serverError ? (
        <p role="alert" className="text-sm font-semibold text-red-800">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-[15px] text-ink-700">
        Already have an account?{" "}
        <Link href="/login" className="font-bold">
          Log in
        </Link>
      </p>
    </form>
  );
}
