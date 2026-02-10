#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const MAXIMUMSATS_API = "https://maximumsats.com";
const WOT_API = "https://wot.klabo.world";
async function l402Post(base, endpoint, body, paymentHash) {
    const headers = {
        "Content-Type": "application/json",
    };
    if (paymentHash) {
        headers["Authorization"] = `L402 ${paymentHash}`;
    }
    const res = await fetch(`${base}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...body, ...(paymentHash ? { payment_hash: paymentHash } : {}) }),
    });
    return (await res.json());
}
async function wotGet(endpoint, params, paymentHash) {
    const url = new URL(`${WOT_API}${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
        if (v)
            url.searchParams.set(k, v);
    }
    if (paymentHash)
        url.searchParams.set("payment_hash", paymentHash);
    const res = await fetch(url.toString());
    return (await res.json());
}
function formatL402(data) {
    const l402 = data.protocols?.l402;
    if (data.status === "payment_required" || data.message?.toString().includes("Pay")) {
        const invoice = l402?.payment_request || data.invoice;
        const hash = l402?.payment_hash || data.payment_hash;
        const amount = l402?.price_sats || data.amount_sats;
        return `Payment required: ${amount} sats\n\nLightning invoice: ${invoice}\n\nAfter paying, retry the same tool call with payment_hash: ${hash}`;
    }
    return JSON.stringify(data, null, 2);
}
function textResult(text) {
    return { content: [{ type: "text", text }] };
}
const server = new mcp_js_1.McpServer({
    name: "maximumsats",
    version: "2.0.0",
});
// --- MaximumSats AI Tools (POST, L402 paid) ---
server.tool("ask_bitcoin", "Ask a question about Bitcoin, Lightning Network, or cryptocurrency. Powered by Llama 3.3 70B. Costs 21 sats via Lightning L402.", {
    prompt: zod_1.z.string().describe("Your question about Bitcoin or Lightning"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if retrying after L402 payment"),
}, async ({ prompt, payment_hash }) => {
    const data = await l402Post(MAXIMUMSATS_API, "/api/dvm", { prompt }, payment_hash);
    return textResult(data.result || formatL402(data));
});
server.tool("generate_image", "Generate an image from a text prompt using FLUX.1 Schnell (12B). Costs 100 sats via Lightning L402.", {
    prompt: zod_1.z.string().describe("Description of the image to generate"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if retrying after L402 payment"),
}, async ({ prompt, payment_hash }) => {
    const data = await l402Post(MAXIMUMSATS_API, "/api/imagegen", { prompt }, payment_hash);
    if (data.image) {
        return textResult(`Image generated. Base64 PNG (${data.image.length} chars). Model: ${data.model || "flux-1-schnell"}`);
    }
    return textResult(data.result || formatL402(data));
});
// --- WoT Scoring API Tools (GET, L402 with free tier: 50/day/IP) ---
server.tool("wot_score", "Look up a Nostr pubkey's Web of Trust score (PageRank-based, 0-100). Returns score, rank, percentile, followers. 50 free requests/day, then L402.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/score", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_sybil_check", "Run 5-signal Sybil detection on a Nostr pubkey. Analyzes follower quality, mutual trust ratio, follow diversity, temporal patterns, and community integration. Returns classification: genuine, likely_genuine, suspicious, or likely_sybil.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/sybil", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_trust_path", "Find the trust path between two Nostr pubkeys. Shows hop-by-hop path with trust scores at each hop. Useful for 'how am I connected to this person?'", {
    from: zod_1.z.string().describe("Source Nostr pubkey in hex"),
    to: zod_1.z.string().describe("Target Nostr pubkey in hex"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ from, to, payment_hash }) => {
    const data = await wotGet("/trust-path", { from, to }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_network_health", "Get Nostr network health metrics: node count, edge count, Gini coefficient (decentralization), power-law exponent, density, and component analysis. No pubkey needed.", {
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ payment_hash }) => {
    const data = await wotGet("/network-health", {}, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_follow_quality", "Analyze the quality of a Nostr pubkey's follow list. Returns quality score, ghost follower ratio, diversity entropy, and improvement suggestions.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/follow-quality", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_trust_circle", "Get a pubkey's trust circle (mutual follows with trust strength). Returns members with roles, cohesion, and density metrics.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/trust-circle", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_anomalies", "Detect anomalous patterns in a Nostr pubkey's network behavior. Checks for ghost followers, asymmetric relationships, cluster patterns, and suspicious activity.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/anomalies", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_predict_link", "Predict how likely two Nostr pubkeys are to connect. Uses 5 topology signals: Common Neighbors, Adamic-Adar, Preferential Attachment, Jaccard, WoT Proximity.", {
    source: zod_1.z.string().describe("Source Nostr pubkey in hex"),
    target: zod_1.z.string().describe("Target Nostr pubkey in hex"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ source, target, payment_hash }) => {
    const data = await wotGet("/predict", { source, target }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_compare_providers", "Compare trust scores for a pubkey across multiple NIP-85 providers. Shows consensus classification and provider agreement.", {
    pubkey: zod_1.z.string().describe("Nostr public key in hex format"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, payment_hash }) => {
    const data = await wotGet("/compare-providers", { pubkey }, payment_hash);
    return textResult(formatL402(data));
});
server.tool("wot_influence", "Simulate what happens if one pubkey follows/unfollows another. Shows ripple effect across the network using differential PageRank.", {
    pubkey: zod_1.z.string().describe("The pubkey taking the action"),
    other: zod_1.z.string().describe("The pubkey being followed/unfollowed"),
    action: zod_1.z.enum(["follow", "unfollow"]).default("follow").describe("follow or unfollow"),
    payment_hash: zod_1.z.string().optional().describe("Payment hash if free tier exhausted"),
}, async ({ pubkey, other, action, payment_hash }) => {
    const data = await wotGet("/influence", { pubkey, other, action }, payment_hash);
    return textResult(formatL402(data));
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
