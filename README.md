# Cost Checker · Concept Prototype

A clickable prototype of an AI-powered feature concept for a healthcare booking
marketplace: a personalized out-of-pocket cost estimate at the point of booking.

**Live demo:** _add your Vercel URL here_
**PRD:** see `docs/` or the accompanying submission PDF.

> Concept and prototype by Ash Lingam for the HelloPM Cohort 51 Assignment 2.
> Not affiliated with or endorsed by Zocdoc. All providers, plans, insurers,
> and rates in this demo are synthetic.

## The idea in one line

Booking platforms have solved "is this provider in my network?" but not the
question that actually stops people from booking: "what will this visit cost
me?" Cost Checker answers it with a deterministic estimate built from payer
price-transparency data and a real-time benefits check, explained in plain
language by an LLM.

## The core design principle

**The math is deterministic; the AI explains.**

The estimate is computed by ordinary arithmetic in
[`src/lib/estimate.js`](src/lib/estimate.js) from structured inputs. The LLM
([`api/explain.js`](api/explain.js)) receives only those structured,
de-identified inputs and turns them into plain language. It never computes,
adjusts, or invents a number. This bounds hallucination risk to language
quality rather than financial accuracy, which is the correct trust posture for
a regulated, money-adjacent surface.

## What's real vs. mocked

| Layer | Status |
|---|---|
| Booking flow UI (4 screens) | Real, clickable |
| Estimate engine (deductible / coinsurance / copay math, confidence tiering, graceful degradation) | Real, deterministic |
| AI explanation layer | Real LLM call (Anthropic API) when deployed with a key; honest template fallback otherwise |
| Transparency in Coverage negotiated rates | Synthetic snippets in `src/data/mock.js` |
| 270/271 real-time eligibility responses | Mocked per plan persona in `src/data/mock.js` |
| Visit-reason → billing-code mapping | Static table for one visit type |

The mock boundary is intentional. The prototype proves the experience and the
AI's role; the data plumbing (MRF indexing, clearinghouse eligibility) is a
well-understood integration problem, not a product-risk problem. In production
you would buy, not build, the MRF layer (Turquoise Health, Serif Health, and
similar aggregators exist).

## Demo personas

Use the switcher in the dark bar to change insurance situations. Each persona
exercises different estimate mechanics:

1. **HDHP, deductible not met** — patient pays the full negotiated rate; the
   estimate range spans two candidate billing codes.
2. **PPO, deductible met** — coinsurance math on the negotiated rate.
3. **HMO, specialist copay** — flat copay; the payer omits deductible
   accumulators, so confidence downgrades to Medium.

The third provider in search results has no published rate data, demonstrating
graceful degradation: no estimate is shown rather than a low-confidence guess.

## Run locally

```bash
npm install
npm run dev
```

The app works fully without an API key: the AI panel falls back to template
copy and labels itself accordingly.

## Deploy with the live LLM explanation

1. Push to GitHub and import into [Vercel](https://vercel.com).
2. Add an environment variable `ANTHROPIC_API_KEY` in the Vercel project
   settings.
3. Deploy. The `api/explain.js` serverless function will generate explanations
   with a locked prompt template.

## Stack

Vite · React 18 · one hand-written stylesheet · one Vercel serverless function
· Anthropic Messages API (`claude-sonnet-4-6`).
