# Maximum Sats MCP Server

MCP server for Bitcoin AI tools and Nostr Web of Trust scoring. Pay-per-use via Lightning [L402](https://docs.lightning.engineering/the-lightning-network/l402).

## Why MaximumSats?

As MCP servers proliferate, a critical question emerges: **How do we secure and monetize MCP API access in a decentralized way?**

MaximumSats delivers:
- **L402 Payment Endpoints** — Every API call can require payment in satoshis
- **Web of Trust (WoT) Scoring** — Sybil-resistant reputation for Nostr users  
- **Nostr ID Utilities** — Decoding/encoding npub, note, nprofile, nevent, naddr, and more

## Use Cases

- **Bounty Platforms** — Pay hunters per task, prevent sybil with WoT
- **AI Agent Marketplaces** — Monetize MCP tools per-call
- **Data Feeds** — Secure oracle data with L402
- **Reputation Systems** — WoT-powered trust scoring

## Install

```sh
npx maximumsats-mcp
```

Or add to your MCP client config:

```json
{
  "mcpServers": {
    "maximumsats": {
      "command": "npx",
      "args": ["maximumsats-mcp"]
    }
  }
}
```

## Tools

### AI Tools (maximumsats.com)

| Tool | Cost | Description |
|------|------|-------------|
| `ask_bitcoin` | 21 sats | Ask about Bitcoin/Lightning (Llama 3.3 70B) |
| `generate_image` | 100 sats | Text-to-image (FLUX.1 Schnell 12B) |

### Web of Trust (wot.klabo.world) — 50 free/day

| Tool | Description |
|------|-------------|
| `wot_score` | PageRank trust score (0-100) with rank and percentile |
| `wot_sybil_check` | 5-signal Sybil detection (genuine/suspicious/likely_sybil) |
| `wot_trust_path` | Hop-by-hop trust path between two pubkeys |
| `wot_network_health` | Network metrics: 51K+ nodes, Gini coefficient, density |
| `wot_follow_quality` | Follow list quality analysis with suggestions |
| `wot_trust_circle` | Mutual follows with trust strength and cohesion |
| `wot_anomalies` | Ghost followers, asymmetric patterns, cluster detection |
| `wot_predict_link` | Link prediction (5 topology signals) |
| `wot_compare_providers` | Cross-provider NIP-85 trust score consensus |
| `wot_influence` | Simulate follow/unfollow ripple effects |

## Security & Governance Features

MaximumSats is purpose-built for the **Secure & Govern MCP** track:

### 1. Paid API Access Control — One Payment, One Retry
Every endpoint can be gated behind payment. The L402 flow is simple:

```bash
# Request returns HTTP 402 with Lightning invoice
curl -X POST https://maximumsats.com/api/dvm \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello"}'
# Returns: {"error":"Payment required","payment_request":"lnbc21...","payment_hash":"abc123","amount_sats":21}

# Pay the invoice in your Lightning wallet, then retry with payment_hash in Authorization header:
curl -X POST https://maximumsats.com/api/dvm \
  -H "Content-Type: application/json" \
  -H "Authorization: abc123" \
  -d '{"prompt":"hello"}'
# Returns: {"status":"success","data":{...}}
```

### 2. Sybil Resistance with WoT
The WoT endpoint scores Nostr pubkeys based on their network position — valuable for:
- Bounty platforms preventing fake accounts
- Voting systems needing sybil resistance
- Reputation engines
```bash
curl https://maximumsats.com/api/wot/npub1...
# Returns: {"score": 45, "rank": 1234, "percentile": 95.5}
```

### 3. No Middleman — Direct Lightning
- Instant settlement on Lightning Network
- No subscriptions, pay per request
- Pseudonymous, no KYC required

## Technical Implementation

MaximumSats uses the L402 protocol (Lightning HTTP 402):

```javascript
// Challenge response includes invoice
{ status: 402, error: "Payment required", invoice: "lnbc...", amount_sats: 21 }

// After payment, include payment_hash in retry
{ status: 402, error: "Payment required", payment_hash: "abc123..." }

// Successful response after payment verification
{ status: 200, data: { ... } }
```

All payment flows through Lightning Network — no blockchain bloat.

## APIs

- [maximumsats.com/stats](https://maximumsats.com/stats) — AI tools pricing
- [wot.klabo.world/docs](https://wot.klabo.world/docs) — WoT API interactive docs
- [wot.klabo.world/openapi.json](https://wot.klabo.world/openapi.json) — OpenAPI 3.0 spec

## Quick Examples

### Get Started: One Payment, One Retry L402 Flow

The MaximumSats API uses L402 — here's exactly how to pay and get results:

```bash
# Step 1: Request (returns 402 with Lightning invoice)
curl -X POST "https://maximumsats.com/api/bolt11-decode" \
  -H "Content-Type: application/json" \
  -d '{"invoice":"lnbc1..."}'

# Response: {"error":"Payment required","payment_request":"lnbc...","payment_hash":"abc123...","amount_sats":21}

# Step 2: Pay the invoice in your Lightning wallet, then retry with payment_hash:
curl -X POST "https://maximumsats.com/api/bolt11-decode" \
  -H "Content-Type: application/json" \
  -H "Authorization: abc123..." \
  -d '{"invoice":"lnbc1..."}'

# Response: {"status":"success","data":{...}}
```

### Check a user's reputation before paying a bounty
```bash
curl -s "https://wot.klabo.world/score/npub1..." | jq '.score'
# Returns: {"score": 42, "rank": 1234, "percentile": 95.5}
```

### Decode a Lightning invoice before payment
```bash
curl -X POST "https://maximumsats.com/api/bolt11-decode" \
  -H "Content-Type: application/json" \
  -d '{"invoice":"lnbc..."}'
# Returns: amount, description_hash, expiry, payee pubkey
```

### Verify a Nostr identity (NIP-05)
```bash
curl -X POST "https://maximumsats.com/api/nip05-verify" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"bob@nostr.com"}'
# Returns: pubkey, valid boolean, relay hints
```

## License

MIT
