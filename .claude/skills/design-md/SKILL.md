---
name: design-md
description: Library of 74 DESIGN.md design-system analyses of real product and brand websites (Stripe, Linear, Apple, Vercel, Ferrari, Nike, Notion and more), each with concrete colour, typography, spacing, radius and component tokens. Use when a brief references another product's look, when you need a worked example of how a mature design system is structured, or when choosing token architecture, type ramps, spacing scales or motion timings. Look up one reference at a time; do not copy a brand wholesale.
---

# DESIGN.md reference library

74 analyses of real websites, each reduced to the tokens and rules that
produce its look. Source: VoltAgent/awesome-design-md (MIT), commit `8147538`.

## How to use it

Read **one** reference, for a reason. These are ~36KB each — pulling several in
speculatively wastes the budget for no gain.

```bash
cat .claude/skills/design-md/references/<name>.md          # whole analysis
sed -n '1,60p' .claude/skills/design-md/references/<name>.md   # tokens only
```

Most files open with YAML frontmatter carrying the machine-readable token set —
`colors`, `typography`, `rounded`, `spacing`, `components` — followed by prose
sections: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes,
Components, Do's and Don'ts, Responsive Behavior, Iteration Guide.

## What to take, and what not to

Take the **mechanics**: how the type ramp is stepped, where the spacing scale
breaks, how many surface levels the elevation system defines, how one accent is
rationed across a page, what the radius scale implies about the brand's warmth.
That is transferable craft and it is why this library is worth having.

Do not take the **identity**. A brand's name, mark, wordmark, exact palette and
photography are theirs. "Build me a page that looks like Stripe" means adopt
Stripe's *structural discipline* — not ship something a reader would mistake for
Stripe. Where a brief asks to clone a real company's site outright, build the
layout language and give the work its own identity.

## Verify contrast yourself

These files record the palettes real sites ship, not palettes that have been
checked. Real sites fail WCAG routinely — muted captions and tinted accents on
light grounds are the usual offenders. Compute the ratio before adopting any
pair, and say so when a source palette fails.

## Two file formats

64 entries carry the YAML token frontmatter described above. **10 do not** —
they are an older prose-only format with no machine-readable token block, marked
with ◦ in the index. Expect to read those by eye rather than lifting tokens.

## Index

| Reference | Character |
|---|---|
| `airbnb` | A warm, generous consumer marketplace anchored on a clean white canvas and Airbnb Rausch (#ff385c), the… |
| `airtable` | A sober, editorial workflow-software interface anchored on white canvas and dark-ink type, where brand… |
| `apple` | A photography-first interface that turns marketing into a museum gallery. Edge-to-edge product tiles… |
| `binance` | A confident financial-platform interface anchored on a deep near-black canvas, where Binance's iconic yellow… |
| `bmw-m` | A motorsport-engineering interface anchored on a near-black canvas with white BMW Type Next Latin display… |
| `bmw` | BMW's corporate site — distinct from BMW M's motorsport-bombastic variant, this is a measured and settled… |
| `bugatti` | An austere luxury-automotive interface that uses near-pure black canvas, white uppercase letterspaced… |
| `cal` | A clean, calendar-software-first interface anchored on white canvas with black primary CTAs and custom Cal… |
| `claude` | A warm-canvas editorial interface for Anthropic's Claude product. The system anchors on a tinted cream canvas… |
| `clay` | A vibrant claymation-meets-data interface for Clay.com (GTM data-orchestration platform). Anchors on white… |
| `clickhouse` | A high-performance database interface anchored on near-pure black canvas with electric yellow as the brand… |
| `cohere` | Cohere's 2026 web system is a controlled enterprise AI interface built from stark white editorial space, deep… |
| `coinbase` | An institutional-grade crypto exchange whose marketing surfaces read like a quietly-confident… |
| `composio` | A developer-tools brand for AI-agent tool integration whose marketing surfaces lean into a dark, technical… |
| `cursor` | An AI-first code editor whose marketing site reads like a quietly-confident developer-tools brand with a… |
| `dell-1996` | An inspired interpretation of Dell.com's 1996 design language — a catalog-era enterprise web design built… |
| `elevenlabs` | A voice-AI brand whose marketing surfaces read like a quietly editorial print magazine. The base canvas is… |
| `expo` | A React Native developer-platform whose marketing site reads like a quietly-confident infrastructure brand.… |
| `ferrari` | A luxury-automotive brand whose marketing surfaces read as cinematic editorial. The base canvas is… |
| `figma` | A confident black-and-white editorial frame interrupted by oversized, hand-cut pastel color blocks. The… |
| `framer` | A confident dark-canvas builder marketing site that treats the page like a working artboard — pure black… |
| `hashicorp` | An enterprise-infrastructure marketing canvas built around a near-black ground (#000000) and a system of… |
| `hp` | An inspired interpretation of HP's design language — a white-paper enterprise-consumer system anchored by HP… |
| `ibm` | An enterprise-marketing canvas faithful to Carbon Design System: white surfaces, charcoal type, IBM Blue… |
| `intercom` | An editorial customer-service marketing canvas built around a soft cream-white ground, charcoal type set in… |
| `kraken` ◦ | Kraken's website is a clean, trustworthy crypto exchange that uses purple as its commanding brand color. The… |
| `lamborghini` ◦ | Lamborghini's website is a cathedral of darkness — a digital stage where jet-black surfaces stretch… |
| `linear.app` | A near-black product-focused marketing canvas built around #010102 (the deepest dark surface of any tool in… |
| `lovable` ◦ | Lovable's website radiates warmth through restraint. The entire page sits on a creamy, parchment-toned… |
| `mastercard` ◦ | Mastercard's experience reads like a warm, editorial magazine built from soft stone and signal orange. The… |
| `meta` | Meta's design system spans hardware commerce (Quest VR, Ray-Ban Meta AI glasses) and brand surfaces with a… |
| `minimax` | MiniMax presents itself as a premium AI infrastructure brand through a striking duality — bold black-pill… |
| `mintlify` | Mintlify presents documentation infrastructure with a dual-mode aesthetic — atmospheric sky-gradient… |
| `miro` | Miro presents itself as the AI-powered visual workspace through a confident, almost playful brand voice —… |
| `mistral.ai` | Mistral AI brands itself with a singular signature — atmospheric sunset gradients (mustard, orange, deep red)… |
| `mongodb` | MongoDB carries a strong dual-mode visual identity — dark deep-teal hero bands with bright MongoDB green… |
| `nike` | | A photography-first commerce system built on extreme typographic contrast — towering uppercase Futura… |
| `nintendo-2001` | An analysis of Nintendo.com's 2001 design language — a brushed-periwinkle "console chrome" interface where… |
| `notion` | Notion presents itself as the all-in-one workspace through a confident, illustration-rich brand voice —… |
| `nvidia` | | An engineering-grade marketing system organized around two surface modes — a deep black canvas for hero and… |
| `ollama` | | An almost defiantly minimal documentation-first system that treats the home page like a Markdown README —… |
| `opencode.ai` | | A terminal-native marketing system rendered entirely in Berkeley Mono — every word on the page, from the… |
| `pinterest` | | A photography-first discovery system organized around the Pinterest Red CTA, the masonry pin grid, and a… |
| `playstation` | | A three-surface marketing system organized around alternating black, white, and PlayStation Blue chapters… |
| `posthog` | | A playful developer-tools system rendered on a warm cream canvas with hand-drawn hedgehog mascots dotted… |
| `raycast` | | Raycast's marketing system reads like an extended product screenshot. The chrome IS the in-product chrome… |
| `renault` | | Renault's web presence pairs the freshly-modernised Renault diamond (the 2021 flat-line rhombus mark) with… |
| `replicate` | | Replicate's marketing surfaces pair the warm-cream developer-tools aesthetic of an indie ML playground with… |
| `resend` | | Resend's marketing surfaces sit on a near-pure black canvas with off-white text and a single signature… |
| `revolut` | | Revolut's marketing surfaces pair a stark black canvas with the brand's cobalt-violet (`#494fdf`) and a… |
| `runwayml` ◦ | Runway's interface is a cinematic reel brought to life as a website — a dark, editorial,… |
| `sanity` ◦ | Sanity's website is a developer-content platform rendered as a nocturnal command center -- dark, precise, and… |
| `sentry` | An inspired interpretation of Sentri's design language — a developer-tools brand built on a deep… |
| `shopify` | An inspired interpretation of Shopifi's design language — a cinematic commerce platform that runs two… |
| `slack` | An inspired interpretation of Slacc's design language — a workplace messaging brand built on a deep aubergine… |
| `spacex` | An inspired interpretation of Spasex's design language — a mission-oriented aerospace brand built on pure… |
| `spotify` ◦ | Spotify's web interface is a dark, immersive music player that wraps listeners in a near-black cocoon… |
| `starbucks` ◦ | Starbucks' design system is a **warm, confident retail flagship** wearing the green of their storefront apron… |
| `stripe` | An inspired interpretation of Stripi's design language — a financial-infrastructure brand built on a deep… |
| `supabase` | An inspired interpretation of Supabaze's design language — an open-source database platform built on a clean… |
| `superhuman` | An inspired interpretation of Superhumon's design language — a fast-email productivity brand split between an… |
| `tesla` ◦ | Tesla's website is an exercise in radical subtraction — a digital showroom where the product is everything… |
| `theverge` ◦ | The Verge's 2024 redesign feels like somebody wired a Condé Nast magazine to a chiptune soundboard. The… |
| `together.ai` | An inspired interpretation of Together AI's design language — an AI infrastructure platform whose surface… |
| `uber` | An inspired interpretation of Uber's design language — a transportation-and-delivery super-app brand whose… |
| `vercel` | An inspired interpretation of Vercel's design language — a developer-platform brand whose surface is a stark… |
| `vodafone` | An inspired interpretation of Vodafone's design language — a telecom super-brand whose web surface alternates… |
| `voltagent` | An inspired interpretation of Voltagent's design language — a developer-focused AI agent engineering platform… |
| `warp` | An inspired interpretation of Warp's design language — an agentic terminal-and-development-environment brand… |
| `webflow` | An inspired interpretation of Webflow's design language — a visual web development platform whose surface… |
| `wired` | An inspired interpretation of Wired's design language — a flagship technology-magazine brand whose surface is… |
| `wise` | An inspired interpretation of Wise's design language — a global money-transfer brand whose surface combines… |
| `x.ai` | An inspired interpretation of xAI's design language — Elon Musk's frontier-AI company whose web surface is a… |
| `zapier` | An inspired interpretation of Zapier's design language — a workflow-automation platform whose surface… |
