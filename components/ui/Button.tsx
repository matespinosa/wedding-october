"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "outline-dark";
type Size = "sm" | "md";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon?: ReactNode;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  className?: string;
  magnetic?: boolean;
  target?: string;
  ariaLabel?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-sans uppercase tracking-[0.18em] transition-colors duration-500 select-none";

const variants: Record<Variant, { root: string; fill: string }> = {
  solid: {
    root: "bg-ink text-cream",
    fill: "bg-gold-deep",
  },
  outline: {
    root: "border border-ink/20 text-ink hover:border-ink/50",
    fill: "bg-ink/[0.05]",
  },
  "outline-dark": {
    root: "border border-cream/25 text-cream hover:border-gold/70",
    fill: "bg-cream/10",
  },
};

const sizes: Record<Size, string> = {
  sm: "px-6 py-3 text-[12px]",
  md: "px-8 py-4 text-[13px]",
};

/**
 * House button: pill, letterspaced caps, and a fill that sweeps up
 * from the baseline on hover. The icon nudges forward with it.
 */
export function Button({
  children,
  href,
  onClick,
  icon,
  variant = "solid",
  size = "md",
  type = "button",
  className,
  magnetic = true,
  target,
  ariaLabel,
}: Props) {
  const v = variants[variant];

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out-expo group-hover:scale-y-100",
          v.fill,
        )}
      />
      <span className="relative z-10">{children}</span>
      {icon && (
        <span
          aria-hidden
          className="relative z-10 transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
        >
          {icon}
        </span>
      )}
    </>
  );

  const cls = cn(base, v.root, sizes[size], className);

  const el = href ? (
    <motion.a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cls}
      aria-label={ariaLabel}
    >
      {inner}
    </motion.a>
  ) : (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cls}
      aria-label={ariaLabel}
    >
      {inner}
    </motion.button>
  );

  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
