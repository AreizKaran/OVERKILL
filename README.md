# Optique

Next.js 16 · React 19 · Tailwind 4 · TypeScript, set up so shadcn components
land already wearing the brand.

```bash
npm install
npm run dev
```

## Adding components

```bash
npx shadcn@latest add @skiper-ui/skiper40
npx shadcn@latest add button          # or anything from the default registry
```

Components land in `components/ui/` and inherit the palette automatically —
`components.json` points shadcn at `app/globals.css`, where the Optique tokens
are mapped onto shadcn's semantic names (`--primary`, `--muted-foreground`,
`--ring`, …). No per-component theming needed.

### Two things to know before you run that

**`shadcn init` was never run here — it couldn't be.** Both `ui.shadcn.com` and
`skiper-ui.com` are blocked by the egress policy of the environment this was
built in. What init actually does was replicated by hand instead:
`components.json`, `lib/utils.ts` (the `cn` helper), and the dependencies
(`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
`tw-animate-css`). On an unrestricted machine the `add` command works directly.

**Verify the registry URL.** `components.json` declares:

```json
"registries": { "@skiper-ui": "https://skiper-ui.com/registry/{name}.json" }
```

That path shape was read off skiper-ui's published MCP server package, which
lists entries like `skiper-ui.com/registry/card-swiper.json` — but that package
is from 2025, predates the `@namespace/name` scheme, and uses plain `http://`.
**Confirm the current URL against skiper-ui's own install docs** before relying
on it; if `add` 404s, a wrong URL here is the first thing to check.

## Design tokens

`app/globals.css` carries two themes, both from
`design-system/optique-3d/MASTER.md`:

| | Default (`:root`) | `.dark` |
|---|---|---|
| Direction | editorial light | fashion-tech dark |
| Ground | `#F4F2EE` warm | `#0B0D0E` ink |
| Accent | `#6F6730` brass | `#6C8CFF` electric blue |

Accent values are not interchangeable between them. Electric blue reads 6.34:1
on ink and **2.80:1 on cream** — it is legible only on the dark ground, which is
why it is scoped to `.dark` and the light theme uses brass instead. Likewise the
dark theme's primary button takes a *black* label (6.34:1), never white (3.07:1).

`--input` is `#8A8A83` rather than the `--hairline` grey: control edges need
3:1, and the hairline is 1.46:1 — decorative rules only.

## Layout

```
app/          routes, globals.css (all tokens)
components/ui shadcn components land here
lib/utils.ts  the cn() helper
design-system MASTER.md + standalone HTML prototypes of both directions
```
