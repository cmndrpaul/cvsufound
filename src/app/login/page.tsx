import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Log in – CvSUFound" };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:px-8">
      <div className="rounded-3xl border border-brand-200 bg-white p-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-brand-800">Welcome back</h1>
        <p className="mb-6 text-[15.5px] text-ink-700">Log in to report or claim an item.</p>
        <LoginForm />
      </div>
    </div>
  );
}
