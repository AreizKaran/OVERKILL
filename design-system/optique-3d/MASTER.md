# Optique 3D — Design System Master

Premium optical e-commerce: 3D face scanning, virtual try-on, product
discovery, payments. Positioned as fashion-tech, not an eyewear store.

Generated with the `ui-ux-pro-max` skill and **verified against the brief**.
Where the generator misfit the product, the mismatch and the replacement are
recorded here rather than silently adopted.

---

## 1. Style — a stack of three, not one

| Layer | Choice | Why |
|---|---|---|
| Structure | **Minimalism & Swiss Style** | Top match for "editorial minimal dark". Grid-based, generous whitespace, high contrast. `cost:low`, `a11y risk:low`. Carries the "Apple-level minimalism" half of the brief. |
| Chrome & overlays | **Liquid Glass** | Verified match for product type *E-commerce Luxury* → "Liquid Glass + Glassmorphism, premium colors + minimal accent". Its own note says best for *navigation, controls and app chrome* — so scope it there: scanner HUD, cart drawer, sticky nav, try-on controls. **Not** the whole page. `cost:moderate, drivers: animation+blur`. |
| Homepage pattern | **Scroll-Triggered Storytelling** | Section order `Intro hook > Chapter 1 > Chapter 2 > Chapter 3 > Climax CTA` maps exactly onto the brief's SEE → SCAN → UNDERSTAND → MATCH → WEAR sequence. |

### Rejected, with reasons

- **Feature-Rich Showcase** (what `--design-system` returned as the pattern) is
  a SaaS feature-grid. The brief explicitly asks for the opposite — "large
  photography, oversized typography … rather than dozens of colorful cards".
  Replaced by Scroll-Triggered Storytelling above, which is a verified match
  on a narrower query.
- **Cormorant / Montserrat** (generated typography) is classic-luxury — jewelry
  and couture. It reads heritage, not fashion-*tech*. The brief's own choice is
  better reasoned; see §3.
- **Warm stone + gold `#A16207`** (generated palette) contradicts the specified
  black/cream/electric-blue identity. The brief's palette wins; see §2.
- **"E-commerce" (generic)** product match recommends *Vibrant & Block-based +
  playful colors* — the generator's own `AVOID` line rejects this for a premium
  product. The *E-commerce Luxury* row is the correct one.

---

## 2. Colour — the brief's palette, measured

Every pair below was computed, not estimated. **Three failures were found.**

### Foundation (unchanged — all excellent)

| Token | Hex | On | Ratio |
|---|---|---|---|
| `--ink` | `#0B0D0E` | cream | **17.72** AAA |
| `--cream` | `#F6F4EF` | ink | **17.72** AAA |
| `--grey-soft` | `#D9D9D4` | ink | **13.75** AAA |
| `--charcoal` | `#191C1E` | cream | **15.58** AAA |

### The accent problem

`#6C8CFF` is beautiful on dark and **fails on light**:

| Pair | Ratio | Verdict |
|---|---|---|
| Electric Blue on Deep Black | **6.34** | PASS (AA) |
| Electric Blue on Charcoal | **5.57** | PASS (AA) |
| Electric Blue on Off White | **2.80** | **FAIL** (needs 4.5) |
| White label on Blue button | **3.07** | **FAIL** (needs 4.5) |
| Blue focus ring on Off White | **2.80** | **FAIL** (needs 3.0) |
| Soft Grey border on Off White | **1.29** | **FAIL** (needs 3.0) |

This *confirms* the brief's instinct — "accent reserved for scanning,
interaction states and technology-focused elements" — and explains why: those
are the dark contexts, which is the only place the blue is legible.

### Resolution: a two-surface accent

```css
/* dark surfaces — the tech/scanner world. Unchanged from the brief. */
--accent:            #6C8CFF;  /* 6.34:1 on --ink */

/* light surfaces — cream editorial world */
--accent-on-light:   #335FFF;  /* 4.53:1 on --cream; same hue (227deg), darker */
--focus-ring-light:  #335FFF;  /* 4.53:1, clears the 3:1 non-text bar with room */
--border-strong:     #8A8A83;  /* 3.16:1 on cream — real input borders */
--border-hairline:   #D9D9D4;  /* 1.29:1 — decorative rules ONLY, never a control edge */
```

**Do not put a blue fill button on cream.** The darkest same-hue fill that
carries a pure-white label is `#3F68FF` (4.53), but against the brand's
*off*-white `#F6F4EF` it drops to **4.12 — still failing**. On light surfaces
the primary button is ink `#0B0D0E` with a cream label (17.72). Blue fills
belong on dark. This is a constraint worth designing *into* the brand: the
accent is what the technology looks like, and the technology is dark-mode.

---

## 3. Typography

Brief specifies Space Grotesk / Sora + Inter / Manrope. **Adopt** — with one
correction.

Space Grotesk *is* in the database, but only inside pairings named **"Kinetic
Brutalism"** and **"Neo Brutalism Mobile"** — moods `aggressive, street, zine,
loud, pop art`. Those profiles prescribe ALL-UPPERCASE display, buttons and
nav, heavy weights throughout. **Do not inherit that treatment.** It is the
opposite register from premium-minimal.

```
Display  Space Grotesk 500/700 — sentence case, letter-spacing -0.02em
         Reserve UPPERCASE for short labels only (nav, eyebrow, button)
Body     Inter 400/500 — 16px base minimum, line-height 1.5
```

Two families maximum, as the brief requires. Hero 60–120px fluid, section
40–50px, card title 28–32px, body 16–18px, label 12px.

---

## 4. Motion

Verified GSAP scrub/pin preset for the signature sequence:

```js
gsap.timeline({ scrollTrigger: {
  trigger: section, start: 'top top', end: '+=150%', scrub: 1, pin: true
}}).from('.headline', { opacity: 0, y: 40 }).to('.bg-layer', { yPercent: -20 }, '<');
```

Constraints that come with it — these are from the database, not taste:

- **Pin at most 1–2 sections per page.** Excessive pinning fights native scroll
  and hurts mobile. The SEE→WEAR sequence is the one that earns a pin.
- Use `scrub: 0.5–1.5`, never an instant jump.
- Pinning forces layout reflow — **profile on mid-tier mobile**, not desktop.
- `ScrollTrigger.refresh()` after fonts and images load, or pinned heights are wrong.
- Never reveal below-the-fold content as invisible-by-default with no no-JS fallback (SEO).

Timing ladder from the brief is sound and kept: micro 150–250ms, card
250–400ms, section 500–800ms, hero 800–1200ms, easing
`cubic-bezier(0.22, 1, 0.36, 1)`.

**Reduced motion is not optional here.** Under `prefers-reduced-motion: reduce`
the storytelling pattern's own guidance applies: keep DOM reading order
complete, disable parallax and scroll-scrub, render every chapter in its final
readable state, and pause effects when offscreen.

---

## 5. Three.js budget

- Particles (face-mesh points, optical dust): **start at 3000**. Desktop:mobile
  GPU ratio can be 10:1. Do not ship 100k particles because desktop held 60fps.
- Any interactive 3D scene must bind **touchstart/touchmove** alongside mouse,
  normalised to the same NDC range, `passive:false` where you `preventDefault`.
  A rotate-the-frame viewer that only listens for mouse is dead on mobile.
- Provide a non-WebGL fallback: the product viewer degrades to a 360° image
  sprite sequence; the page must sell frames without a GPU.

---

## 6. Face scanning — privacy

> **Fallback guidance, not a database match.** Two searches (`camera permission
> request context`, `privacy consent sensitive data` on `--domain ux`) returned
> off-topic rows — stacking context, bulk actions. The skill's contract says to
> label unmatched guidance rather than dress it up as a lookup. This section is
> general practice and should be reviewed by someone with India DPDP Act
> familiarity before launch.

- Face geometry is **biometric data**. Treat it as sensitive personal data, not
  as an analytics event.
- MediaPipe Face Landmarker runs **on-device**. Keep it that way: derive the
  measurements client-side and transmit only the derived profile (face shape,
  bridge width, frame size), never the image or the raw landmark mesh.
- Ask for the camera **in context**, at the moment the user taps Scan — never
  on page load. Explain what happens before the browser prompt appears, because
  a denied permission is expensive to recover.
- State retention plainly at point of capture: the brief's "Your camera is used
  only for virtual try-on" is the right instinct; add whether anything is
  stored, and give a visible way to delete the saved face profile.
- Offer the whole funnel without a camera — the Find Your Frame quiz (§8 of the
  brief) is the no-camera path to the same recommendation, and must not be a
  second-class experience.

---

## 7. Payments

The brief is already correct and it is worth restating: **never collect card
details yourself.** Use Razorpay or Stripe's hosted fields/SDK so card data
never touches your DOM or server. UPI-first ordering for India is right.

From the database, applied to checkout:

- Every input needs a real `<label for>`. No placeholder-only fields.
- Submit must show loading → success/error. A pay button with no response state
  is the highest-severity form failure there is.
- Errors sit next to the field and say how to recover.

---

## 8. Pre-delivery checklist

- [ ] No emoji as icons — SVG only (the brief's nav sketch uses ♡ and 🛒; ship Lucide)
- [ ] Text contrast ≥ 4.5:1 on **both** cream and ink surfaces
- [ ] Focus visible on every control, on both surfaces (see `--focus-ring-light`)
- [ ] `prefers-reduced-motion` honoured: no scrub, no parallax, full reading order
- [ ] Touch targets ≥ 44px; bottom nav ≤ 5 items (brief's mobile nav is exactly 5)
- [ ] Responsive at 375 / 768 / 1024 / 1440, no horizontal scroll
- [ ] 3D: touch events bound, particle budget respected, non-WebGL fallback
- [ ] Camera: in-context permission, on-device processing, no-camera path
