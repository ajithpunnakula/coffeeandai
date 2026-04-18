---
name: lint
description: Health-check the wiki for contradictions, orphans, missing links, and stale content
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Lint the Wiki

Perform a health-check on all wiki pages following the Lint workflow in CLAUDE.md.

## Checks

1. **Contradictions**: Read all wiki pages and identify claims that contradict each other across pages.
2. **Orphan pages**: Find pages with no inbound `[[wikilinks]]` from other wiki pages (excluding index.md and log.md).
3. **Missing pages**: Find `[[wikilinks]]` that point to pages that don't exist yet.
4. **Missing cross-references**: Identify pages that discuss the same topics but don't link to each other.
5. **Stale claims**: Check if newer sources have superseded claims in older pages.
6. **Index sync**: Verify every wiki page appears in `wiki/index.md` and every index entry points to an existing page.
7. **Frontmatter validation**: Ensure all wiki pages have valid YAML frontmatter with required fields (title, type, tags).

## Output

Print a report organized by check type:

```
## Lint Report - YYYY-MM-DD

### Contradictions
- (none found) or list

### Orphan Pages
- list of pages with no inbound links

### Missing Pages
- [[Page Name]] referenced from Page X

### Missing Cross-References
- Page A and Page B both discuss Topic but don't link

### Stale Claims
- (none found) or list

### Index Issues
- (none found) or list

### Frontmatter Issues
- (none found) or list
```

## Fixing issues

After showing the report, ask the user: "Want me to fix these issues?"

If yes:
1. Fix all issues (create missing pages, add cross-references, update index, fix frontmatter).
2. Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | Fixed N issues`
3. Commit and push:
   ```bash
   git add wiki/
   git commit -m "wiki: lint - fix N issues"
   git push
   ```
