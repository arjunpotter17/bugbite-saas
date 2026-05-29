const sampleComplaint =
  "Customer says the mobile app keeps spinning after they tap Save on the shipping address screen. They tried twice on iPhone. It looked saved at first, but checkout still used the old address. They are worried the order is going to the wrong place.";

const complaintInput = document.querySelector<HTMLTextAreaElement>("#complaint");
const generateButton = document.querySelector<HTMLButtonElement>("#generate-button");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-button");
const sampleButton = document.querySelector<HTMLButtonElement>("#sample-button");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-button");
const checkoutEmail = document.querySelector<HTMLInputElement>("#checkout-email");
const lockedState = document.querySelector<HTMLElement>("#locked-state");
const ticketState = document.querySelector<HTMLElement>("#ticket-state");
const ticketOutput = document.querySelector<HTMLElement>("#ticket-output");
const planPill = document.querySelector<HTMLElement>("#plan-pill");
const paymentStatus = document.querySelector<HTMLElement>("#payment-status");

let hasPaidPlan = localStorage.getItem("bugbite-access") === "pro";

const setPaymentStatus = (message: string) => {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
};

const setPaidState = () => {
  if (!lockedState || !ticketState || !planPill) return;

  lockedState.classList.toggle("hidden", hasPaidPlan);
  ticketState.classList.toggle("hidden", !hasPaidPlan);
  planPill.textContent = hasPaidPlan ? "Pro plan" : "Free plan";
  planPill.classList.toggle("paid", hasPaidPlan);
};

const getCheckoutSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("session") ||
    params.get("session_id") ||
    params.get("checkout_id") ||
    params.get("id")
  );
};

const verifyCheckout = async (sessionId: string) => {
  setPaymentStatus("Verifying Bags checkout...");

  const response = await fetch(`/api/bags/session?id=${encodeURIComponent(sessionId)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not verify checkout.");
  }

  if (data.access === "pro") {
    hasPaidPlan = true;
    localStorage.setItem("bugbite-access", "pro");
    setPaidState();
    setPaymentStatus("Payment verified. Pro is unlocked.");
    window.history.replaceState({}, "", window.location.pathname);
    return;
  }

  setPaymentStatus(`Checkout status: ${data.checkout?.status || "pending"}. Refresh after payment settles.`);
};

const scoreSeverity = (text: string) => {
  const urgentWords = ["wrong", "lost", "broken", "charged", "cannot", "failed"];
  const hits = urgentWords.filter((word) => text.toLowerCase().includes(word)).length;
  if (hits >= 2) return "High";
  if (hits === 1) return "Medium";
  return "Low";
};

const makeTicket = (text: string) => {
  const trimmed = text.trim();
  const firstSentence = trimmed.split(/[.!?]/).find(Boolean)?.trim() || "Customer hit a product issue";
  const severity = scoreSeverity(trimmed);

  return [
    `Title: ${firstSentence}`,
    "",
    `Severity: ${severity}`,
    "Owner: Support triage",
    "",
    "Summary:",
    trimmed,
    "",
    "Steps to reproduce:",
    "1. Open the area mentioned by the customer.",
    "2. Repeat the customer action exactly as described.",
    "3. Confirm whether the product state matches the customer's report.",
    "",
    "Expected result:",
    "The action completes and the customer sees the updated state.",
    "",
    "Actual result:",
    "The customer reports that the product did not reflect the intended change.",
    "",
    "Next check:",
    "Ask engineering to inspect recent client errors and saved-state events for this flow."
  ].join("\n");
};

sampleButton?.addEventListener("click", () => {
  if (!complaintInput) return;
  complaintInput.value = sampleComplaint;
  complaintInput.focus();
});

checkoutButton?.addEventListener("click", async () => {
  try {
    checkoutButton.disabled = true;
    setPaymentStatus("Creating Bags checkout...");

    const response = await fetch("/api/bags/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: checkoutEmail?.value.trim() || undefined
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create Bags checkout.");
    }

    const checkoutUrl = data.checkout?.url;
    if (!checkoutUrl) {
      throw new Error("Bags did not return a checkout URL.");
    }

    window.location.href = checkoutUrl;
  } catch (error) {
    setPaymentStatus(error instanceof Error ? error.message : "Checkout failed.");
    checkoutButton.disabled = false;
  }
});

generateButton?.addEventListener("click", () => {
  if (!hasPaidPlan || !complaintInput || !ticketOutput) return;

  const complaint = complaintInput.value.trim();
  ticketOutput.textContent = complaint
    ? makeTicket(complaint)
    : "Paste a complaint first, then generate the ticket.";
});

copyButton?.addEventListener("click", async () => {
  if (!ticketOutput?.textContent) return;
  await navigator.clipboard.writeText(ticketOutput.textContent);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1100);
});

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    button.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(1px)" },
        { transform: "translateY(0)" }
      ],
      { duration: 140, easing: "ease-out" }
    );
  });
});

setPaidState();

const sessionId = getCheckoutSessionId();
if (!hasPaidPlan && sessionId) {
  verifyCheckout(sessionId).catch((error) => {
    setPaymentStatus(error instanceof Error ? error.message : "Could not verify checkout.");
  });
}
