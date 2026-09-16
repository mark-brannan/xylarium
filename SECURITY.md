# Security policy

## Supported versions

| version | supported |
|---|---|
| latest `0.x` on [npm](https://www.npmjs.com/package/xylarium) | yes |
| anything older | no |

This package is pre-1.0. Fixes land on the newest release; there are no
backports.

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/mark-brannan/xylarium/security/advisories/new).
Please do not open a public issue for a suspected vulnerability.

Expect an acknowledgement within a week.

## What is in scope

This package ships JSON data, JSON Schema, and a test suite. It has no
runtime dependencies and executes nothing on a consumer's machine, so the
realistic attack surface is the supply chain and the data itself:

- **A compromised release** — a published tarball whose contents do not
  match the tagged commit. Releases are published from CI by npm trusted
  publishing (OIDC), so every version carries a provenance attestation;
  a mismatch is worth reporting.
- **A malicious or corrupted data file** — a value that does not match the
  cited Handbook table. Report a transcription error as an ordinary issue;
  report a *deliberately* altered value privately.
- **Anything in `.github/workflows/`** that could leak a token or let an
  untrusted pull request run with write permissions.

## What is not in scope

- **The Wood Handbook's own numbers.** If FPL-GTR-282 prints a value you
  believe is wrong, that is a matter for the Forest Products Laboratory.
  This package transcribes the table; it does not correct it.
- **Fitness for structural design.** These are clear-wood test averages,
  not design values. Using them where a design value is required is a
  misuse of the data, not a vulnerability. See `README.md`.
