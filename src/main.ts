const sampleComplaint =
  "Customer says the mobile app keeps spinning after they tap Save on the shipping address screen. They tried twice on iPhone. It looked saved at first, but checkout still used the old address. They are worried the order is going to the wrong place.";

const complaintInput = document.querySelector<HTMLTextAreaElement>("#complaint");
const generateButton = document.querySelector<HTMLButtonElement>("#generate-button");
const unlockButton = document.querySelector<HTMLButtonElement>("#unlock-button");
const sampleButton = document.querySelector<HTMLButtonElement>("#sample-button");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-button");
const lockedState = document.querySelector<HTMLElement>("#locked-state");
const ticketState = document.querySelector<HTMLElement>("#ticket-state");
const ticketOutput = document.querySelector<HTMLElement>("#ticket-output");
const planPill = document.querySelector<HTMLElement>("#plan-pill");

let hasPaidPlan = localStorage.getItem("bugbite-plan") === "pro";

const setPaidState = () => {
  if (!lockedState || !ticketState || !planPill) return;

  lockedState.classList.toggle("hidden", hasPaidPlan);
  ticketState.classList.toggle("hidden", !hasPaidPlan);
  planPill.textContent = hasPaidPlan ? "Pro plan" : "Free plan";
  planPill.classList.toggle("paid", hasPaidPlan);
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

unlockButton?.addEventListener("click", () => {
  hasPaidPlan = true;
  localStorage.setItem("bugbite-plan", "pro");
  setPaidState();
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
