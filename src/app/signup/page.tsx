import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign up – CvSUFound" };

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border border-brand-200 bg-white p-5 sm:p-8">
        <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight text-brand-800">Create your account</h1>
        <p className="mb-6 text-[15.5px] text-ink-700">
          An account lets you post reports and send claim requests.
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
