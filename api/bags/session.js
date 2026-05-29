const BAGS_API_BASE_URL = process.env.BAGS_API_BASE_URL || "https://getbags.app";

const sendJson = (response, status, body) => {
  response.status(status).setHeader("content-type", "application/json");
  response.end(JSON.stringify(body));
};

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  if (!process.env.BAGS_API_KEY) {
    return sendJson(response, 503, {
      error: "Bags payment service is not configured.",
      missing: ["BAGS_API_KEY"],
      docs: "https://docs.getbags.app/docs/getting-started/authentication"
    });
  }

  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const id = url.searchParams.get("id");

  if (!id) {
    return sendJson(response, 400, { error: "Missing checkout session id." });
  }

  const bagsResponse = await fetch(`${BAGS_API_BASE_URL}/api/v1/checkouts/${id}`, {
    headers: {
      authorization: `Bearer ${process.env.BAGS_API_KEY}`
    }
  });

  const data = await bagsResponse.json().catch(() => null);

  if (!bagsResponse.ok) {
    return sendJson(response, bagsResponse.status, {
      error: "Bags checkout lookup failed.",
      details: data
    });
  }

  const checkout = data.data;
  const isPaid =
    checkout?.status === "complete" ||
    checkout?.sessionStatus === "complete" ||
    checkout?.sessionStatus === "completed";

  return sendJson(response, 200, {
    checkout,
    access: isPaid ? "pro" : "free"
  });
};
