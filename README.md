# Maximum Sats MCP Server

MCP server for Bitcoin AI tools — text generation, image generation, Web of Trust scoring, and Lightning Network analysis. Pay-per-use via Lightning [L402](https://docs.lightning.engineering/the-lightning-network/l402).

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

### Free

| Tool | Description |
|------|-------------|
| `wot_score` | Look up a Nostr pubkey's Web of Trust score |
| `wot_top` | Get the top 100 Nostr accounts by WoT score |

### Paid (Lightning L402)

| Tool | Cost | Description |
|------|------|-------------|
| `ask_bitcoin` | 21 sats | Ask about Bitcoin/Lightning (Llama 3.3 70B) |
| `generate_image` | 100 sats | Generate an image from text (FLUX.1 Schnell 12B) |
| `wot_report` | 100 sats | Detailed Web of Trust analysis for a pubkey |
| `nostr_summary` | 50 sats | AI-powered Nostr profile summary |
| `ln_analysis` | 75 sats | Lightning Network analysis |
| `retry_with_payment` | — | Complete a request after paying the invoice |

## How L402 Payments Work

1. Call a paid tool (e.g. `ask_bitcoin`)
2. Receive a Lightning invoice in the response
3. Pay the invoice using any Lightning wallet
4. Call `retry_with_payment` with the `payment_hash` to get the result

No accounts. No API keys. Just Lightning.

## API

All tools call the [maximumsats.com](https://maximumsats.com) API. The `/stats` endpoint lists all available endpoints and pricing.

## License

MIT
