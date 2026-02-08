#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://maximumsats.com";

interface L402Response {
  status: string;
  protocols?: {
    l402?: {
      price_sats: number;
      payment_request: string;
      payment_hash: string;
    };
  };
  // Successful response fields
  result?: string;
  image?: string;
  model?: string;
  [key: string]: unknown;
}

async function l402Request(
  endpoint: string,
  body: Record<string, unknown>,
  paymentHash?: string
): Promise<L402Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (paymentHash) {
    headers["Authorization"] = `L402 ${paymentHash}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, ...(paymentHash ? { payment_hash: paymentHash } : {}) }),
  });

  return (await res.json()) as L402Response;
}

const server = new McpServer({
  name: "maximumsats",
  version: "1.0.0",
});

// Tool: Ask Bitcoin — AI text generation (21 sats)
server.tool(
  "ask_bitcoin",
  "Ask a question about Bitcoin, Lightning Network, or cryptocurrency. Powered by Llama 3.3 70B. Costs 21 sats via Lightning L402.",
  { prompt: z.string().describe("Your question about Bitcoin or Lightning") },
  async ({ prompt }) => {
    const data = await l402Request("/api/dvm", { prompt });

    if (data.status === "payment_required") {
      const l402 = data.protocols?.l402;
      return {
        content: [
          {
            type: "text" as const,
            text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with the payment_hash: ${l402?.payment_hash}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: data.result || JSON.stringify(data) }],
    };
  }
);

// Tool: Retry with payment — complete an L402 request after paying
server.tool(
  "retry_with_payment",
  "Complete an L402 request after paying the Lightning invoice. Pass the payment_hash from the original request and the endpoint to retry.",
  {
    payment_hash: z.string().describe("The payment_hash from the 402 response"),
    endpoint: z.string().describe("The API endpoint to retry (e.g. /api/dvm, /api/imagegen)"),
    prompt: z.string().describe("The original prompt"),
  },
  async ({ payment_hash, endpoint, prompt }) => {
    const data = await l402Request(endpoint, { prompt }, payment_hash);

    if (data.image) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Image generated successfully. Base64 PNG data (${data.image.length} chars). Model: ${data.model || "flux-1-schnell"}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: data.result || JSON.stringify(data) }],
    };
  }
);

// Tool: Generate Image — AI image generation (100 sats)
server.tool(
  "generate_image",
  "Generate an image from a text prompt using FLUX.1 Schnell (12B). Costs 100 sats via Lightning L402.",
  { prompt: z.string().describe("Description of the image to generate") },
  async ({ prompt }) => {
    const data = await l402Request("/api/imagegen", { prompt });

    if (data.status === "payment_required") {
      const l402 = data.protocols?.l402;
      return {
        content: [
          {
            type: "text" as const,
            text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/imagegen" and payment_hash: ${l402?.payment_hash}`,
          },
        ],
      };
    }

    if (data.image) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Image generated. Base64 PNG (${data.image.length} chars). Model: ${data.model || "flux-1-schnell"}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
    };
  }
);

// Tool: WoT Score — look up Nostr Web of Trust score (free)
server.tool(
  "wot_score",
  "Look up a Nostr pubkey's Web of Trust score. Free, no payment required.",
  { pubkey: z.string().describe("Nostr public key in hex format") },
  async ({ pubkey }) => {
    const res = await fetch(`${API_BASE}/wot/score?pubkey=${pubkey}`);
    const data = await res.json();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Tool: WoT Top — get top Nostr Web of Trust scores (free)
server.tool(
  "wot_top",
  "Get the top 100 Nostr accounts by Web of Trust score. Free, no payment required.",
  {},
  async () => {
    const res = await fetch(`${API_BASE}/wot`);
    const data = await res.json();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Tool: WoT Report — detailed trust analysis (100 sats)
server.tool(
  "wot_report",
  "Get a detailed Web of Trust analysis report for a Nostr pubkey. Costs 100 sats via Lightning L402.",
  { pubkey: z.string().describe("Nostr public key in hex format") },
  async ({ pubkey }) => {
    const data = await l402Request("/api/wot-report", { pubkey });

    if (data.status === "payment_required") {
      const l402 = data.protocols?.l402;
      return {
        content: [
          {
            type: "text" as const,
            text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/wot-report" and payment_hash: ${l402?.payment_hash}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: data.result || JSON.stringify(data) }],
    };
  }
);

// Tool: Nostr Summary — AI profile analysis (50 sats)
server.tool(
  "nostr_summary",
  "Get an AI-powered summary of a Nostr profile with activity and reputation analysis. Costs 50 sats via Lightning L402.",
  { pubkey: z.string().describe("Nostr public key in hex format") },
  async ({ pubkey }) => {
    const data = await l402Request("/api/nostr-summary", { pubkey });

    if (data.status === "payment_required") {
      const l402 = data.protocols?.l402;
      return {
        content: [
          {
            type: "text" as const,
            text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/nostr-summary" and payment_hash: ${l402?.payment_hash}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: data.result || JSON.stringify(data) }],
    };
  }
);

// Tool: Lightning Analysis — network analysis (75 sats)
server.tool(
  "ln_analysis",
  "Get an AI-powered Lightning Network analysis with real-time data. Costs 75 sats via Lightning L402.",
  { query: z.string().describe("What to analyze about the Lightning Network") },
  async ({ query }) => {
    const data = await l402Request("/api/ln-analysis", { prompt: query });

    if (data.status === "payment_required") {
      const l402 = data.protocols?.l402;
      return {
        content: [
          {
            type: "text" as const,
            text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/ln-analysis" and payment_hash: ${l402?.payment_hash}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: data.result || JSON.stringify(data) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
