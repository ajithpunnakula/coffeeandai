---
title: "Source - Prompt Engineering Overview"
type: source
date: 2026-04-17
source_file: "raw/prompt-engineering-overview.md"
tags: [prompt-engineering, api, best-practices]
---

This source is [[Anthropic]]'s official prompt engineering overview documentation, serving as a gateway to prompt engineering techniques and resources for working with Claude. It is a concise page that establishes prerequisites and directs users to more detailed resources.

The document assumes three prerequisites before beginning prompt engineering: a clear definition of success criteria for your use case, empirical ways to test against those criteria, and a first draft prompt to improve. It directs users without a first draft to the prompt generator in the Claude Console, and those seeking model-specific tuning guidance to the prompting best practices documentation.

The overview emphasizes that not every success criterion is best solved through prompt engineering. Some metrics like latency and cost may be more easily improved by selecting a different model rather than refining prompts. It points to a comprehensive best practices guide covering all prompting techniques including clarity, examples, XML structuring, role prompting, thinking, and prompt chaining.

The source also references interactive learning options: a GitHub-based interactive tutorial with examples covering prompt engineering concepts from the documentation, and a Google Sheets-based lighter-weight version. Additional tooling is available in the Claude Console, including a prompt generator, templates and variables, and a prompt improver.

## Key Topics

- Prerequisites for prompt engineering: success criteria, evaluation methods, draft prompt
- Prompt generator tool in the Claude Console
- Prompting best practices covering clarity, examples, XML, role prompting
- [[Extended Thinking]] and prompt chaining techniques
- Interactive tutorials on GitHub and Google Sheets
- Console tools: prompt generator, templates, variables, prompt improver
- Model selection as an alternative to prompt engineering for latency/cost
