"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * Skiper 40 — Animated Link
 *
 * Ported by hand from the Skiper UI component, because `npx shadcn add
 * @skiper-ui/skiper40` cannot run in the environment this was built in
 * (skiper-ui.com is refused by the egress policy). Behaviour, timings and
 * easing are unchanged from the original; the changes are:
 *
 *   - the arrow SVG, repeated five times upstream, is one `Arrow` component
 *   - colours come from the project's tokens rather than hard-coded values,
 *     so the variants work on both the light and dark themes
 *   - `motion-reduce` handling upstream is kept and extended to the two
 *     block-highlight variants, which upstream leaves animating
 *
 * Re-running the real `shadcn add` will overwrite this file with upstream's
 * copy, which is fine — that is the intended end state.
 *
 * ---------------------------------------------------------------------------
 * Original header, preserved because its licence requires attribution:
 *
 * Skiper 40 Animated Link — React
 * Inspired by and adapted from https://cursor.com/?from=home
 * We respect the original creators. This is an inspired rebuild with our own
 * taste and does not claim any ownership. These animations aren't associated
 * with cursor.com. They're independent recreations meant to study interaction
 * design.
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Author: @gurvinder-singh02 · https://gxuri.in · https://x.com/Gur__vi
 * ---------------------------------------------------------------------------
 */

type LinkProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
};

/** The ↗ glyph every variant but Link000 carries. */
const Arrow = ({ className }: { className?: string }) => (
  <svg
    className={cn(
      "ml-[0.3em] size-[0.55em] opacity-0 transition-all duration-300",
      "motion-reduce:transition-none",
      className,
    )}
    fill="none"
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Rule shared by the four underline variants. `bg-current` inherits text colour. */
const RULE = [
  "before:pointer-events-none before:absolute before:left-0 before:h-[0.05em]",
  "before:w-full before:bg-current before:content-['']",
  "before:transition-transform before:duration-300",
  "before:ease-[cubic-bezier(0.4,0,0.2,1)]",
  "motion-reduce:before:transition-none",
].join(" ");

/** Block highlight shared by Link004 / Link005. Difference-blends against either ground. */
const BLOCK = [
  "before:pointer-events-none before:absolute before:left-0 before:w-full",
  "before:bg-white before:content-[''] before:mix-blend-difference before:z-[1]",
  "before:transition-all before:duration-300",
  "before:ease-[cubic-bezier(0.4,0,0.2,1)]",
  "motion-reduce:before:transition-none",
].join(" ");

/** Underline at the baseline: retracts right, returns from the left. */
export const Link000 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    className={cn(
      "group relative flex items-center",
      className,
      RULE,
      "before:bottom-0 before:origin-right before:scale-x-0",
      "hover:before:origin-left hover:before:scale-x-100",
    )}
  >
    {children}
  </a>
);

/** Link000 with an arrow that rises into place. */
export const Link001 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={cn(
      "group relative flex items-center",
      RULE,
      "before:top-[1.5em] before:origin-right before:scale-x-0",
      "hover:before:origin-left hover:before:scale-x-100",
      className,
    )}
  >
    {children}
    <Arrow className="translate-y-1 group-hover:translate-y-0 group-hover:opacity-100" />
  </a>
);

/** Mirrored: retracts left, returns from the right. */
export const Link002 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    className={cn(
      "group relative flex items-center",
      className,
      RULE,
      "before:top-[1.5em] before:origin-left before:scale-x-0",
      "hover:before:origin-right hover:before:scale-x-100",
    )}
  >
    {children}
    <Arrow className="translate-y-1 group-hover:translate-y-0 group-hover:opacity-100" />
  </a>
);

/** Opens outward from the centre. */
export const Link003 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    className={cn(
      "group relative flex items-center",
      className,
      RULE,
      "before:top-[1.5em] before:origin-center before:scale-x-0",
      "hover:before:scale-x-100",
    )}
  >
    {children}
    <Arrow className="translate-y-1 group-hover:translate-y-0 group-hover:opacity-100" />
  </a>
);

/** Block grows up from the baseline and inverts the text through it. */
export const Link004 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    className={cn(
      "group relative flex items-center px-2",
      className,
      BLOCK,
      "before:bottom-0 before:h-0 before:origin-center before:scale-x-100",
      "hover:before:h-[1.4em]",
    )}
  >
    {children}
    <Arrow className="z-0 ml-[0.6em] translate-y-1 group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100" />
  </a>
);

/** Block wipes across from the left. */
export const Link005 = ({ children, href, className }: LinkProps) => (
  <a
    href={href}
    className={cn(
      "group relative flex items-center px-2",
      className,
      BLOCK,
      "before:top-0 before:h-full before:origin-left before:scale-x-0",
      "hover:before:scale-x-100",
    )}
  >
    {children}
    <Arrow className="z-0 ml-[0.6em] -translate-x-1 rotate-45 group-hover:translate-x-0 group-hover:opacity-100" />
  </a>
);

export const Skiper40 = () => (
  <div className="flex flex-col items-start gap-5">
    <Link001 href="mailto:hello@optique.example">hello@optique.example</Link001>
    <Link002 href="mailto:hello@optique.example">hello@optique.example</Link002>
    <Link003 href="mailto:hello@optique.example">hello@optique.example</Link003>
    <Link004 href="mailto:hello@optique.example">hello@optique.example</Link004>
    <Link005 href="mailto:hello@optique.example">hello@optique.example</Link005>
  </div>
);
