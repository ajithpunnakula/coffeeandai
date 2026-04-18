---
title: "Source - Claude Code Enterprise Network Configuration"
type: source
date: 2026-04-13
source_file: "raw/enterprise-network-configuration.md"
tags: [claude-code, enterprise, configuration]
---

# Source - Claude Code Enterprise Network Configuration

[[Claude Code]] supports comprehensive enterprise network configurations through environment variables, covering proxy routing, custom certificate authorities, and mutual TLS client authentication. All settings documented here can also be placed in `settings.json` rather than the shell environment. SOCKS proxies are explicitly not supported; only HTTP/HTTPS proxies are recognized.

Proxy configuration uses standard environment variables: `HTTPS_PROXY` (preferred) or `HTTP_PROXY` for routing, and `NO_PROXY` for bypass lists (accepts space- or comma-separated hostnames, wildcards, and domains with leading dots). Basic authentication credentials can be embedded directly in the proxy URL; for advanced schemes like NTLM or Kerberos, an [[Source - Claude Code LLM Gateway Configuration|LLM Gateway]] that handles authentication is recommended instead. The `CLAUDE_CODE_CERT_STORE` variable controls which certificate stores are trusted: `bundled` (Mozilla CA set shipped with Claude Code), `system` (OS trust store), or a comma-separated combination of both (default is `bundled,system`). Enterprise TLS-inspection proxies such as CrowdStrike Falcon and Zscaler work without additional configuration when their root CA is installed in the OS trust store. Custom CA certificates can be loaded via `NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem`; this is required when running on the Node.js runtime since system CA store merging is automatic only in the native binary.

For environments requiring client certificate authentication, [[Source - Claude Code Enterprise Network Configuration|mTLS]] is supported via three variables: `CLAUDE_CODE_CLIENT_CERT` (path to client certificate PEM), `CLAUDE_CODE_CLIENT_KEY` (path to private key PEM), and optionally `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE` for encrypted keys. Firewall allowlists must include `api.anthropic.com` (Claude API), `claude.ai` (claude.ai account auth), and `platform.claude.com` (Console account auth). Native installer and auto-updater additionally require `storage.googleapis.com` and `downloads.claude.ai`. Organizations using [[GitHub Enterprise Server]] behind a firewall must also allowlist Anthropic API IP addresses so Anthropic infrastructure can reach the GHES host for repository cloning and review comment posting.

## Key Topics

- HTTP/HTTPS proxy setup via `HTTPS_PROXY` / `HTTP_PROXY` environment variables
- `NO_PROXY` bypass list syntax (space- or comma-separated, wildcard support)
- Basic auth credentials embedded in proxy URL; NTLM/Kerberos requires LLM Gateway
- SOCKS proxy explicitly not supported
- `CLAUDE_CODE_CERT_STORE` for controlling trusted CA sources (`bundled`, `system`, or both)
- CrowdStrike Falcon and Zscaler TLS inspection compatibility with OS trust store
- `NODE_EXTRA_CA_CERTS` for custom enterprise CA certificates
- mTLS client certificate authentication (`CLAUDE_CODE_CLIENT_CERT`, `CLAUDE_CODE_CLIENT_KEY`, `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE`)
- Required firewall allowlist URLs: `api.anthropic.com`, `claude.ai`, `platform.claude.com`, `storage.googleapis.com`, `downloads.claude.ai`
- GitHub Enterprise Server firewall requirements for Anthropic infrastructure access
