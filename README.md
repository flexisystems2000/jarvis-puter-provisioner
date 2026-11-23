# JARVIS Puter Provisioner

A standalone Cloudflare Worker intended to sit between JARVIS and a future officially supported Puter account-provisioning integration.

## Current capability and limitation

The service provides a health endpoint and an authenticated provisioning contract. **It does not create Puter accounts yet.** Puter's documented SDK supports browser authentication and temporary-user creation flows, but a supported server-side API for silently creating permanent Puter accounts from an external identity has not been verified. The Worker deliberately returns HTTP 501 rather than using undocumented private endpoints, claiming success, or sharing one developer account among users.

## Endpoints

- `GET /health` — public service health and capability status.
- `POST /v1/provision` — authenticated JARVIS-to-provisioner request. Requires `Authorization: Bearer <JARVIS_PROVISIONING_SECRET>` and JSON `{ "userId": "..." }`. Currently returns 501 with an explicit explanation; no account is created.
- `GET /v1/status` — authenticated capability status.

## Cloudflare configuration

Create a Worker named `jarvis-puter-provisioner`, upload `src/index.js` as the module entry point, and add a secret named `JARVIS_PROVISIONING_SECRET`. Generate a long random value and configure the same value only in the trusted JARVIS backend. Never put it in the Android app or a public repository.

## Security

- Only the trusted JARVIS backend may call provisioning endpoints.
- Never send Google passwords or OAuth access tokens to Puter.
- Never log bearer credentials.
- Do not store Puter credentials in plaintext.
- Provisioning must be idempotent and tied to the authenticated JARVIS user once an official provider flow exists.

## Local tests

Run `npm test` with Node.js 20 or newer.
