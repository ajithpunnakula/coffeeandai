---
title: "Source - Claude Code Voice Dictation"
type: source
date: 2026-04-13
source_file: "raw/voice-dictation.md"
tags: [claude-code, features]
---

# Source - Claude Code Voice Dictation

[[Claude Code]] includes a push-to-talk voice dictation feature for the CLI, allowing users to compose prompts by speaking rather than typing. Holding a configurable key (default: Space) initiates recording; releasing it streams the audio to Anthropic's servers for transcription. The transcription model supports 20 languages and is specifically tuned for coding vocabulary, improving accuracy on technical terms, identifiers, and programming-related speech patterns.

Voice dictation requires authentication via Claude.ai and is not available when using API keys directly, or when running [[Claude Code]] on [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]. This platform restriction reflects the feature's dependency on Anthropic-hosted transcription infrastructure rather than the underlying LLM routing.

To improve recognition accuracy, [[Claude Code]] passes the current project name and active git branch as contextual hints to the transcription service. This means the model has awareness of project-specific names that might otherwise be ambiguous in speech, reducing transcription errors for repository names, branch names, and domain-specific terminology.

## Key Topics

- Push-to-talk voice input in the CLI
- Default recording key: Space (configurable)
- Audio streamed to Anthropic for transcription
- 20 supported languages
- Tuned for coding vocabulary and technical terminology
- Requires Claude.ai authentication
- Not available on API key auth, [[Amazon Bedrock]], [[Google Vertex AI]], or [[Microsoft Foundry]]
- Project name and git branch used as transcription hints
