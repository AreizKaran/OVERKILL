# SMIT AMS — responsive & touch-target audit

Measured against the existing portal on `claude/kind-mayer-0m2nyt`
(commit `5e0cac9`), built with `npm run build` and driven with headless
Chromium via Playwright. Checked at the four widths the skill's
pre-delivery checklist names: **375 / 768 / 1024 / 1440**.

Touch widths are emulated with a **coarse pointer** (`hasTouch`), desktop
widths with a fine pointer — the distinction matters, see below.

## What already passed

The portal was in good shape before this patch. Verified, not assumed:

| Check | Result |
|---|---|
| Horizontal overflow | **0px at every width and page** |
| Keyboard focus | global `:focus-visible` outline (`index.css:80`) |
| Reduced motion | global block, neutralises Framer Motion springs (`index.css:166`) |
| Wide tables | `.scrollbox` = `overflow-x-auto` with edge bleed — the prescribed pattern |
| Chart colour | series documented as validated for CVD separation and 3:1 contrast |
| Viewport | `width=device-width, viewport-fit=cover` |
| Build | clean, route-level code splitting |

## What failed: touch targets

Controls sat below the 44x44 comfortable-touch minimum (checklist item 2,
CRITICAL). Worst on the primary mobile controls.

| Page @375 (touch) | Before | After |
|---|---|---|
| Landing | 3 | **0** |
| Student dashboard | 12 | 1 |
| Fees | 4 | **0** |

The one remaining entry is the `<a>` wrapping the "All notices" button: the
anchor's own inline box measures 113x19, but the `<button>` inside it is a
full 44px and is what actually receives the tap. Measurement artefact, not a
defect.

At 768 one marketing nav link measures 37x44 — under on the inline axis only,
and comfortably past the WCAG 2.5.8 AA floor of 24px. Padding every text link
out to 44px wide would open visible gaps in the nav for no real gain.

## The fix

`touch-targets.patch` — 6 files, +51/-16. Apply with:

```bash
git apply design-system/smit-ams/audit/touch-targets.patch
```

Gated on `@media (pointer: coarse)`, **not** a width breakpoint. The
constraint is the input device: a touch laptop at 1440px needs the larger
target, a 375px-wide desktop window does not. Desktop measurements are
byte-identical before and after, which is the proof the compact mouse
density was not disturbed.

Three parts:

1. `@media (pointer: coarse)` floor of `min-block-size: 44px` on buttons,
   role-buttons, radios, tabs, selects and text inputs.
2. `.icon-btn` adds `min-inline-size` for icon-only controls, which carry no
   text to stretch them — applied to the hamburger, theme toggle and
   notifications bell.
3. `.tap` for text links acting as controls (card-header actions, marketing
   nav). It deliberately does **not** set `display`.

### One trap worth recording

The first version of `.tap` set `display: inline-flex`. That silently
overrode Tailwind's `hidden` on the topbar profile link, forcing it back on
screen at 375px where it overflowed the header. Any utility class that sets
`display` will fight the display utilities already on the element. `.tap`
now sets only `min-block-size`, and the plain inline links carry an explicit
`inline-flex` in their own markup, where it is visible to whoever reads them.

### Known tradeoff

Widening the icon buttons costs horizontal room in the topbar. The mobile
search field goes **127x40 to 101x44** at 375px, so its placeholder
truncates. It remains usable. If the width matters more than the pill,
hiding the "Demo Mode" badge below `sm` returns the space.

## Not covered

Signal-level and geometric checks only. No screen-reader pass, no automated
colour-contrast sweep of rendered output, and only three routes
(landing, student dashboard, fees) of the fourteen modules were driven.
