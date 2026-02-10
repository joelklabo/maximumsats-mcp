# Maximum Sats MCP Server

MCP server for Bitcoin AI tools and Nostr Web of Trust scoring. Pay-per-use via Lightning [L402](https://docs.lightning.engineering/the-lightning-network/l402).

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

## How L402 Payments Work

1. Call a tool — if payment is needed, the response includes a Lightning invoice
2. Pay the invoice with any Lightning wallet
3. Retry the same tool with the `payment_hash` parameter

No accounts. No API keys. Just Lightning.

## APIs

- [maximumsats.com/stats](https://maximumsats.com/stats) — AI tools pricing
- [wot.klabo.world/docs](https://wot.klabo.world/docs) — WoT API interactive docs
- [wot.klabo.world/openapi.json](https://wot.klabo.world/openapi.json) — OpenAPI 3.0 spec

## License

MIT
