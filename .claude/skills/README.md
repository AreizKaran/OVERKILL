# Installed skills

These skills are vendored from the **UI/UX Pro Max** plugin, installed manually
because the `/plugin` command is not available in this environment.

| | |
|---|---|
| Source | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| Commit | `7f69fed6a2717900085f1bc3b263721f8ba025e2` |
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
