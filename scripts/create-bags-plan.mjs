const apiKey = process.env.BAGS_API_KEY;
const apiBaseUrl = process.env.BAGS_API_BASE_URL || "https://getbags.app";
const appUrl = process.env.APP_URL || "https://bugbite-saas.vercel.app";
const network = process.env.BAGS_NETWORK || "base_sepolia";

if (!apiKey) {
  console.error("Missing BAGS_API_KEY.");
  process.exit(1);
}

const bagsFetch = async (path, body) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `bugbite-${Date.now()}-${Math.random().toString(36).slice(2)}`
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(JSON.stringify({ path, status: response.status, data }, null, 2));
    process.exit(1);
  }

  return data.data;
};

const product = await bagsFetch("/api/products", {
  name: "BugBite Pro",
  description: "One-time access to the BugBite complaint-to-ticket generator.",
  amount: "1.00",
  currency: "USD",
  pricingType: "one_time",
  token: "USDC",
  mode: apiKey.startsWith("bag_live_") ? "live" : "test"
});

const paymentLink = await bagsFetch("/api/payment-links", {
  productId: product.id,
  network,
  name: "BugBite Pro",
  description: "Unlock BugBite Pro for one-time testing access.",
  successUrl: `${appUrl}/?paid=success`,
  returnUrl: `${appUrl}/?paid=return`,
  merchantName: "BugBite",
  customFields: [
    {
      key: "email",
      label: "Email for access",
      type: "email",
      required: true
    }
  ]
});

console.log(
  JSON.stringify(
    {
      productId: product.id,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url || `${apiBaseUrl}/pay/${paymentLink.id}`,
      network
    },
    null,
    2
  )
);
