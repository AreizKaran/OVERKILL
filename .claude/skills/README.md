# Installed skills

These skills are vendored from the **UI/UX Pro Max** plugin, installed manually
because the `/plugin` command is not available in this environment.

| | |
|---|---|
| Source | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| Commit | `15de38f` (tip of `main`) |
| Version | 2.13.0 |
| License | MIT (see each skill directory) |

Copied from the plugin's `.claude/skills/` tree, so Claude Code picks them up as
project skills in this repository.

## Skills

- `ui-ux-pro-max` — core design intelligence: searchable styles, palettes, font
  pairings, UX guidelines, icons, charts and per-stack guidance.
- `design`, `design-system`, `brand`, `slides`, `banner-design`, `ui-styling` —
  sub-skills shipped with the same plugin.

## Usage

The core skill drives a local Python search script (Python 3.x, no external
dependencies). Run it from the repository root:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "keyboard focus modal" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "ai saas dashboard" --design-system -p "Project Name"
```

## Updating

Re-copy `.claude/skills/` from a newer commit of the upstream repository, then
rewrite the `${CLAUDE_PLUGIN_ROOT}/` prefix in
`ui-ux-pro-max/SKILL.md` to project-relative paths:

```bash
sed -i 's|\${CLAUDE_PLUGIN_ROOT}/\.claude/skills/ui-ux-pro-max/|.claude/skills/ui-ux-pro-max/|g' \
  .claude/skills/ui-ux-pro-max/SKILL.md
```

The upstream paths use `${CLAUDE_PLUGIN_ROOT}`, which is only set for plugin
installs; this repository uses a project-level skills install instead.

---

# taste-skill

A second plugin, installed the same way (manually — `/plugin` is unavailable here).

| | |
|---|---|
| Source | https://github.com/Leonxlnx/taste-skill |
| Commit | `e79ca9e` |
| Version | 1.0.0 |
| License | MIT |

13 design skills, copied from the plugin's `skills/` tree. Markdown only —
no scripts, no executables, so nothing here runs; these are instructions the
agent reads.

## Skills

**Design direction** — `taste-skill` (anti-slop frontend, the headline one),
`brutalist-skill`, `minimalist-skill`, `soft-skill`, `redesign-skill`,
`stitch-skill`, `gpt-tasteskill`, `brandkit`.

**Image generation** — `imagegen-frontend-web`, `imagegen-frontend-mobile`,
`image-to-code-skill`. These generate design references as images; the first
two explicitly do not write code.

**Behaviour** — `output-skill` (`full-output-enforcement`) is not a design
skill. It modifies output behaviour: bans placeholder patterns like
`// TODO` and `// rest of code`, and enforces complete implementations.
Worth knowing it is active, since it changes how work is produced rather than
how it looks.

## Notes

- `taste-skill-v1` is the superseded version of `taste-skill`, kept by upstream
  only for exact backward compatibility. Both are installed because the plugin
  ships both; delete `taste-skill-v1` if two near-identical design skills
  competing for the same trigger is a problem.
- Directory names and frontmatter `name:` fields differ for several skills
  (`brutalist-skill` declares `industrial-brutalist-ui`, `soft-skill` declares
  `high-end-visual-design`, and so on). Expect the declared name in listings.
- Scanned before install for injection patterns, credential access and shell
  calls: clean. The only `API_KEY` hit is a Shopify meta tag inside a commented
  code sample.
