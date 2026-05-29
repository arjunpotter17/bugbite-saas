const BAGS_API_BASE_URL = process.env.BAGS_API_BASE_URL || "https://getbags.app";
const DEFAULT_NETWORK = process.env.BAGS_NETWORK || "base";
const SUPPORTED_NETWORKS = new Set(["base", "solana", "base_sepolia", "solana_devnet"]);

const sendJson = (response, status, body) => {
  response.status(status).setHeader("content-type", "application/json");
  response.end(JSON.stringify(body));
};

const readBody = (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return {};
};

const requireConfig = () => {
  const missing = [];
  if (!process.env.BAGS_API_KEY) missing.push("BAGS_API_KEY");
  if (!process.env.BAGS_PRODUCT_ID) missing.push("BAGS_PRODUCT_ID");
  return missing;
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const missing = requireConfig();
  if (missing.length > 0) {
    return sendJson(response, 503, {
      error: "Bags payment service is not configured.",
      missing,
      docs: "https://docs.getbags.app/docs/getting-started/authentication"
    });
  }

  const body = readBody(request);
  const origin =
    request.headers.origin ||
    `https://${request.headers["x-forwarded-host"] || request.headers.host}`;
  const requestedNetwork = body.network || DEFAULT_NETWORK;
  const network = SUPPORTED_NETWORKS.has(requestedNetwork) ? requestedNetwork : DEFAULT_NETWORK;

  const payload = {
    productId: process.env.BAGS_PRODUCT_ID,
    network,
    successUrl: `${origin}/?paid=success`,
    returnUrl: `${origin}/?paid=return`,
    externalCustomerId: body.email || "bugbite-web-user",
    customerEmail: body.email || undefined,
    customerName: body.name || "BugBite user",
    metadata: {
      app: "bugbite",
      plan: "pro"
    }
  };

  const bagsResponse = await fetch(`${BAGS_API_BASE_URL}/api/v1/checkouts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.BAGS_API_KEY}`,
      "content-type": "application/json",
      "idempotency-key": `bugbite-checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`
    },
    body: JSON.stringify(payload)
  });

  const data = await bagsResponse.json().catch(() => null);

  if (!bagsResponse.ok) {
    return sendJson(response, bagsResponse.status, {
      error: "Bags checkout creation failed.",
      details: data
    });
  }

  return sendJson(response, 200, {
    checkout: data.data
  });
};
