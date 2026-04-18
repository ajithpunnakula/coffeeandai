---
title: "Source - Constrain Plugin Dependency Versions"
type: source
date: 2026-04-17
source_file: "raw/constrain-plugin-dependency-versions.md"
tags: [plugins, dependency-management, versioning]
---

This source documents the version constraint system for [[Plugins]] dependencies in [[Claude Code]]. Plugins can depend on other plugins by listing them in `plugin.json`, and version constraints allow plugin authors to hold a dependency at a tested version range instead of always tracking the latest release. This prevents upstream breaking changes from silently breaking downstream plugins.

Dependencies are declared in the `dependencies` array of `.claude-plugin/plugin.json`. Each entry can be a bare string (plugin name, tracking latest) or an object with `name`, `version` (a semver range like `~2.1.0`, `^2.0`, `>=1.4`, or `=2.1.0`), and optionally `marketplace` (for cross-marketplace resolution, subject to allowlisting). The `version` field accepts any expression supported by Node's `semver` package. Pre-release versions are excluded unless the range explicitly opts in with a pre-release suffix.

Version resolution works against git tags on marketplace repositories. Tags must follow the convention `{plugin-name}--v{version}`, allowing a single marketplace repository to host multiple plugins with independent version lines. When installing a plugin with constraints, [[Claude Code]] lists the marketplace's tags, filters to matching ones, and fetches the highest satisfying version. For npm marketplace sources, tag-based resolution does not apply, but constraints are still checked at load time.

When multiple installed plugins constrain the same dependency, Claude Code intersects their ranges and resolves to the highest satisfying version. Conflicting ranges (e.g., `~2.1` and `~3.0`) cause installation failure with a `range-conflict` error. Auto-update respects constraints by checking each dependency against all installed plugin ranges before applying updates. Common errors include `range-conflict`, `dependency-version-unsatisfied`, and `no-matching-tag`, each with specific resolution steps.

## Key Topics

- [[Plugins]] can declare dependencies on other plugins with semver version constraints
- Dependencies listed in `.claude-plugin/plugin.json` `dependencies` array
- Version ranges use Node semver syntax: tilde (`~`), caret (`^`), comparators, hyphen ranges
- Git tags follow `{plugin-name}--v{version}` convention for version resolution
- Multiple constraints on the same dependency are intersected to find the highest satisfying version
- Conflicting ranges cause `range-conflict` errors that block installation
- Auto-update respects constraints; skips versions outside any installed plugin's range
- Requires [[Claude Code]] v2.1.110 or later
- Cross-marketplace dependencies require allowlisting in `marketplace.json`
- Errors surfaced via `claude plugin list`, `/plugin` interface, and `/doctor`
