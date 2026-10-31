import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "danger";
type Size = "md" | "lg";

export const buttonPressClass = "touch-manipulation transition-[scale,background-color,border-color,box-shadow,color] duration-150 ease-out enabled:active:scale-[0.97] enabled:active:shadow-none [&:is(a)]:active:scale-[0.97] [&:is(a)]:active:shadow-none motion-reduce:transition-none motion-reduce:enabled:active:scale-100 motion-reduce:[&:is(a)]:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800 enabled:active:bg-brand-900 [&:is(a)]:active:bg-brand-900",
  secondary: "border-[1.5px] border-brand-700 bg-white text-brand-700 hover:bg-brand-50 enabled:active:bg-brand-100 [&:is(a)]:active:bg-brand-100",
  gold: "bg-gold-400 text-brand-900 shadow-sm hover:bg-gold-300 enabled:active:bg-gold-200 [&:is(a)]:active:bg-gold-200",
  ghost: "text-brand-800 hover:bg-brand-100 enabled:active:bg-brand-200 [&:is(a)]:active:bg-brand-200",
  danger: "border-[1.5px] border-red-700 bg-white text-red-800 hover:bg-red-50 enabled:active:bg-red-100 [&:is(a)]:active:bg-red-100",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold disabled:cursor-not-allowed disabled:opacity-60",
    buttonPressClass,
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean };

/** A normal <button>. */
export function Button({ variant, size, className, type = "button", loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

/** A link that looks like a button. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
