---
title: "Source - Claude Code on Amazon Bedrock"
type: source
date: 2026-04-13
source_file: "raw/claude-code-on-amazon-bedrock.md"
tags: [claude-code, cloud-providers]
---

# Source - Claude Code on Amazon Bedrock

[[Claude Code]] can route all model requests through [[Amazon Bedrock]] instead of [[Anthropic]]'s direct API, enabling organizations to use their existing AWS infrastructure, billing, and compliance controls. Prerequisites include an AWS account with Bedrock access, IAM permissions, and model use-case approval in the Bedrock console (one-time per AWS account; AWS Organizations can submit once from the management account using `PutUseCaseForModelAccess`). When Bedrock is active, `/login` and `/logout` are disabled since authentication is handled via AWS credentials.

The interactive setup wizard (`/setup-bedrock`, requires Claude Code v2.1.94+) walks through AWS credential selection (detected `~/.aws` profiles, Bedrock API keys, access key/secret, or environment credentials), region detection, model availability verification, and optional model pinning. The result is saved to the user settings file's `env` block. Manual setup via environment variables is also fully supported for CI or scripted enterprise rollouts: set `CLAUDE_CODE_USE_BEDROCK=1`, `AWS_REGION`, and optionally `ANTHROPIC_BEDROCK_BASE_URL`. Five credential methods are supported: AWS CLI config, access key env vars, SSO profile, AWS Management Console login, and Bedrock API keys (`AWS_BEARER_TOKEN_BEDROCK`).

Model pinning is strongly recommended for team deployments: without it, aliases like `sonnet` resolve to the latest version which may not yet be available in the Bedrock account when [[Anthropic]] releases updates. Pin via `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL` using cross-region inference profile IDs (e.g. `us.anthropic.claude-sonnet-4-6`). Multiple model versions can be mapped to application inference profile ARNs using the `modelOverrides` settings key. Claude Opus 4.6 and Sonnet 4.6 support the 1M token context window on Bedrock (append `[1m]` to the model ID).

Additional features include: automatic credential refresh for AWS SSO via `awsAuthRefresh` and `awsCredentialExport` settings (with caveats for corporate proxies); Amazon Bedrock Guardrails for content filtering via custom headers; and the Mantle endpoint (`CLAUDE_CODE_USE_MANTLE=1`) which serves Claude through the native Anthropic API shape rather than the Bedrock Invoke API, using the same AWS credentials with `anthropic.`-prefixed model IDs. Both endpoints can be active simultaneously for mixed model lineups.

## Key Topics

- Requires Bedrock model access approval in AWS console (one-time per account)
- Interactive wizard: `/setup-bedrock` (v2.1.94+); manual via env vars for CI/enterprise
- Five credential methods: AWS CLI, access key env vars, SSO profile, AWS login, Bedrock API key
- `CLAUDE_CODE_USE_BEDROCK=1` and `AWS_REGION` are required env vars
- Model pinning via `ANTHROPIC_DEFAULT_*_MODEL` with cross-region inference profile IDs
- `modelOverrides` in settings for mapping multiple versions to application inference profile ARNs
- Auto credential refresh: `awsAuthRefresh` (browser SSO) and `awsCredentialExport` (JSON output)
- IAM policy requires `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `bedrock:ListInferenceProfiles`
- 1M token context: Claude Opus 4.6 and Sonnet 4.6; append `[1m]` to model ID
- Bedrock Guardrails: content filtering via `ANTHROPIC_CUSTOM_HEADERS`
- Mantle endpoint: `CLAUDE_CODE_USE_MANTLE=1`; native Anthropic API shape, `anthropic.`-prefixed model IDs
- Both Bedrock Invoke API and Mantle can be active simultaneously
- Startup model checks (v2.1.94+): prompts to update outdated pins; falls back to previous version if default unavailable
