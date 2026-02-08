#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const API_BASE = "https://maximumsats.com";
async function l402Request(endpoint, body, paymentHash) {
    const headers = {
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
    return (await res.json());
}
const server = new mcp_js_1.McpServer({
    name: "maximumsats",
    version: "1.0.0",
});
// Tool: Ask Bitcoin — AI text generation (21 sats)
server.tool("ask_bitcoin", "Ask a question about Bitcoin, Lightning Network, or cryptocurrency. Powered by Llama 3.3 70B. Costs 21 sats via Lightning L402.", { prompt: zod_1.z.string().describe("Your question about Bitcoin or Lightning") }, async ({ prompt }) => {
    const data = await l402Request("/api/dvm", { prompt });
    if (data.status === "payment_required") {
        const l402 = data.protocols?.l402;
        return {
            content: [
                {
                    type: "text",
                    text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with the payment_hash: ${l402?.payment_hash}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: data.result || JSON.stringify(data) }],
    };
});
// Tool: Retry with payment — complete an L402 request after paying
server.tool("retry_with_payment", "Complete an L402 request after paying the Lightning invoice. Pass the payment_hash from the original request and the endpoint to retry.", {
    payment_hash: zod_1.z.string().describe("The payment_hash from the 402 response"),
    endpoint: zod_1.z.string().describe("The API endpoint to retry (e.g. /api/dvm, /api/imagegen)"),
    prompt: zod_1.z.string().describe("The original prompt"),
}, async ({ payment_hash, endpoint, prompt }) => {
    const data = await l402Request(endpoint, { prompt }, payment_hash);
    if (data.image) {
        return {
            content: [
                {
                    type: "text",
                    text: `Image generated successfully. Base64 PNG data (${data.image.length} chars). Model: ${data.model || "flux-1-schnell"}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: data.result || JSON.stringify(data) }],
    };
});
// Tool: Generate Image — AI image generation (100 sats)
server.tool("generate_image", "Generate an image from a text prompt using FLUX.1 Schnell (12B). Costs 100 sats via Lightning L402.", { prompt: zod_1.z.string().describe("Description of the image to generate") }, async ({ prompt }) => {
    const data = await l402Request("/api/imagegen", { prompt });
    if (data.status === "payment_required") {
        const l402 = data.protocols?.l402;
        return {
            content: [
                {
                    type: "text",
                    text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/imagegen" and payment_hash: ${l402?.payment_hash}`,
                },
            ],
        };
    }
    if (data.image) {
        return {
            content: [
                {
                    type: "text",
                    text: `Image generated. Base64 PNG (${data.image.length} chars). Model: ${data.model || "flux-1-schnell"}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: JSON.stringify(data) }],
    };
});
// Tool: WoT Score — look up Nostr Web of Trust score (free)
server.tool("wot_score", "Look up a Nostr pubkey's Web of Trust score. Free, no payment required.", { pubkey: zod_1.z.string().describe("Nostr public key in hex format") }, async ({ pubkey }) => {
    const res = await fetch(`${API_BASE}/wot/score?pubkey=${pubkey}`);
    const data = await res.json();
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
});
// Tool: WoT Top — get top Nostr Web of Trust scores (free)
server.tool("wot_top", "Get the top 100 Nostr accounts by Web of Trust score. Free, no payment required.", {}, async () => {
    const res = await fetch(`${API_BASE}/wot`);
    const data = await res.json();
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
});
// Tool: WoT Report — detailed trust analysis (100 sats)
server.tool("wot_report", "Get a detailed Web of Trust analysis report for a Nostr pubkey. Costs 100 sats via Lightning L402.", { pubkey: zod_1.z.string().describe("Nostr public key in hex format") }, async ({ pubkey }) => {
    const data = await l402Request("/api/wot-report", { pubkey });
    if (data.status === "payment_required") {
        const l402 = data.protocols?.l402;
        return {
            content: [
                {
                    type: "text",
                    text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/wot-report" and payment_hash: ${l402?.payment_hash}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: data.result || JSON.stringify(data) }],
    };
});
// Tool: Nostr Summary — AI profile analysis (50 sats)
server.tool("nostr_summary", "Get an AI-powered summary of a Nostr profile with activity and reputation analysis. Costs 50 sats via Lightning L402.", { pubkey: zod_1.z.string().describe("Nostr public key in hex format") }, async ({ pubkey }) => {
    const data = await l402Request("/api/nostr-summary", { pubkey });
    if (data.status === "payment_required") {
        const l402 = data.protocols?.l402;
        return {
            content: [
                {
                    type: "text",
                    text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/nostr-summary" and payment_hash: ${l402?.payment_hash}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: data.result || JSON.stringify(data) }],
    };
});
// Tool: Lightning Analysis — network analysis (75 sats)
server.tool("ln_analysis", "Get an AI-powered Lightning Network analysis with real-time data. Costs 75 sats via Lightning L402.", { query: zod_1.z.string().describe("What to analyze about the Lightning Network") }, async ({ query }) => {
    const data = await l402Request("/api/ln-analysis", { prompt: query });
    if (data.status === "payment_required") {
        const l402 = data.protocols?.l402;
        return {
            content: [
                {
                    type: "text",
                    text: `Payment required: ${l402?.price_sats} sats\n\nLightning invoice: ${l402?.payment_request}\n\nAfter paying, call retry_with_payment with endpoint="/api/ln-analysis" and payment_hash: ${l402?.payment_hash}`,
                },
            ],
        };
    }
    return {
        content: [{ type: "text", text: data.result || JSON.stringify(data) }],
    };
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
