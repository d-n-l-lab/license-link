# license-link

Sentinel API instructions: https://docs.sentinel.thalesgroup.com/softwareandservices/ems/EMSdocs/WSG/APIRef/index.html?info

## Overview

Serverless backend (Vercel) to sell one-time perpetual licenses via Stripe and fulfill through Sentinel. Includes:
- `POST /api/checkout` to create a Stripe Checkout Session for tiers: light, standard, ultimate
- `POST /api/webhooks/stripe` Stripe webhook to upsert Sentinel account and issue license keys
- Pluggable Sentinel client: mocked by default for local testing

License keys are attached to the Stripe PaymentIntent metadata (`license_keys`) for easy verification during tests. When you provide Sentinel request/response JSON, we can wire the real API calls.

## Stack
- Vercel Functions (TypeScript)
- Stripe Checkout + Webhooks
- Sentinel EMS/CLM (stubbed)

## Environment Variables

Set these in Vercel Project Settings → Environment Variables. For local dev, create a `.env` file and `vercel dev` will load it.

Required:
- `STRIPE_SECRET_KEY` – your Stripe secret key
- `STRIPE_PRICE_LIGHT` – Stripe Price ID for Light
- `STRIPE_PRICE_STANDARD` – Stripe Price ID for Standard
- `STRIPE_PRICE_ULTIMATE` – Stripe Price ID for Ultimate
- `STRIPE_WEBHOOK_SECRET` – webhook signing secret from Stripe
- `PUBLIC_URL` – e.g. `http://localhost:3000` for local

Sentinel:
- `SENTINEL_MOCK` – `true` to use mock issuance (default), `false` to use real API
- `SENTINEL_BASE_URL` – e.g. `https://inasoftsystemsgmbh.dev.sentinelcloud.com/ems/api/v5`
- `SENTINEL_AUTH_HEADER` – full Authorization header value (e.g. `Basic ...` or `Bearer ...`)
- `SENTINEL_TOKEN` – alternative to `SENTINEL_AUTH_HEADER`, will set `Authorization: Bearer <token>`
- `SENTINEL_MARKET_GROUP_ID` – e.g. `14a7a6a8-c544-4f7d-ad32-0674872afd3a`
- `SENTINEL_MARKET_GROUP_NAME` – e.g. `MEZTZ` (optional)
- `SENTINEL_CREATED_BY` – e.g. `S4AWeb` (optional)
- `SENTINEL_VENDOR_TEXT` – e.g. `Inasoft Systems GmbH` (optional)
- `SENTINEL_PRODUCT_LIGHT` – product id for Light (e.g. `d2a32891-...`)
- `SENTINEL_PRODUCT_STANDARD` – product id for Standard (e.g. `42037d6e-...`)
- `SENTINEL_PRODUCT_ULTIMATE` – product id for Ultimate (e.g. `386b2a16-...`)
- `SENTINEL_FEATURE_LIGHT` – feature id for Light (e.g. `1935b23b-...`)
- `SENTINEL_FEATURE_STANDARD` – feature id for Standard
- `SENTINEL_FEATURE_ULTIMATE` – feature id for Ultimate
- `SENTINEL_LINKS_LIGHT` – links count for Light (ASCII will be hex-encoded)
- `SENTINEL_LINKS_STANDARD` – links count for Standard
- `SENTINEL_LINKS_ULTIMATE` – links count for Ultimate

## Install

```bash
npm i
```

## Local development

```bash
npx vercel dev
```

### Create a Checkout Session

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H 'content-type: application/json' \
  -d '{"tier":"light","quantity":1}'
```

This returns `{ url }`. Open the URL to pay with Stripe test card.

### Webhook setup (local)

Use Stripe CLI to forward webhooks to your local dev server.

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the displayed signing secret and set `STRIPE_WEBHOOK_SECRET` accordingly.

After completing the Checkout, the webhook will:
- Upsert a Sentinel account and issue keys (mocked unless `SENTINEL_MOCK=false`)
- Attach the keys to the PaymentIntent metadata (`license_keys`)

Check the PaymentIntent in the Stripe Dashboard, or via CLI:

```bash
stripe payment_intents retrieve <pi_id>
```

Look for `metadata.license_keys`.

## Deploy to Vercel

```bash
npx vercel
```

Set the same environment variables in Vercel. Then in Stripe Dashboard, set your webhook endpoint to:

```
POST https://<your-vercel-deployment>/api/webhooks/stripe
```

## Wiring real Sentinel calls

Share the request/response JSON for:
- Create (or search) account
- Add entitlement and return license keys

We will replace the placeholders in `lib/sentinel.ts` with real fetch calls and keep idempotency in mind.

