# PII GUARD | Intelligent Data Privacy Platform

**Detect. Protect. Share with Confidence.**

A privacy-first, client-side PII detection and sanitization platform built with React 19, TypeScript, Vite, Tailwind CSS, Express, and optional Gemini 2.5 Flash advisory integration.

## Core Privacy Guarantee

- **100% Client-Side Sanitization:** Text input, `.txt`/`.csv` reading, RFC4180 CSV parsing, PII detection, checksum validation, false-positive rejection, redaction, pseudonymization, comparison, analytics, and exports run strictly in browser memory (with Web Worker offloading above 50,000 characters).
- **Zero Raw Document Egress:** Original documents, raw PII values, and pseudonymization mappings are never sent to Express, Gemini, Supabase, analytics, browser logs, or `localStorage`/`sessionStorage`/`IndexedDB`.
- **Privacy-Gated Optional AI:** Gemini 2.5 Flash (`gemini-2.5-flash`) is strictly limited to generating clearly labeled synthetic sample documents and running advisory reviews on already-sanitized text after a mandatory local PII re-scan confirms zero residual PII.

## Supported PII Categories & Validators

1. **Email Addresses** — RFC-aligned local/domain/TLD validation (excludes masked patterns).
2. **Indian Mobile Numbers** — Supports `+91`, `91`, `0`, and 10-digit `[6-9]xxxxxxxxx` numbers with contextual false-positive filtering (`ORD-`, `INV-`, timestamps).
3. **International Phone Numbers** — E.164 `+country` validation (excluding `+91` and synthetic `+00` tokens).
4. **IPv4 Addresses** — Strict 4-octet `0–255` validation rejecting leading zeros and software version strings (`v1.2.3.4`).
5. **IPv6 Addresses** — Strict grammar supporting `::` compression and embedded IPv4, rejecting malformed `:::` or wall-clock timestamps.
6. **Indian PAN** — `[A-Z]{5}[0-9]{4}[A-Z]` with strict alphanumeric boundary isolation and uppercase normalization.
7. **Aadhaar Numbers** — 12 continuous, spaced, or hyphenated digits with configurable **Verhoeff checksum** enforcement (clearly distinguishing checksum-validated vs format-only matches).
8. **Payment Card Numbers** — 13–19 digits with **Luhn mod-10** validation rejecting arbitrary 16-digit sequences.

## Sanitization Modes

- **Full Mask:** `[EMAIL_REDACTED]`, `[PHONE_REDACTED]`, `[INTL_PHONE_REDACTED]`, `[IPV4_REDACTED]`, `[IPV6_REDACTED]`, `[PAN_REDACTED]`, `[AADHAAR_REDACTED]`, `[CARD_REDACTED]`
- **Partial Mask:** `m*****@example.com`, `******3210`, `*****1234F`, `XXXX XXXX 0124`, `************1111`
- **Consistent Pseudonymization:** Deterministic session-scoped synthetic identities (`person_001@example.invalid`, `+910000000001`, `ZZZPX0000Z`, `000000000000`, `0000000000000000`) wiped on reset and excluded from audit exports.

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. (Optional) Copy env templates if configuring Gemini or Supabase
cp client/.env.example client/.env
cp server/.env.example server/.env

# 3. Start frontend (:5173) and backend (:4000)
npm run dev
```

## Scripts

```bash
npm run typecheck      # TypeScript checks for server and client
npm run test:run       # Run Vitest suite
npm run test:coverage  # Run Vitest with v8 coverage report
npm run build          # Production build for server and client
```
