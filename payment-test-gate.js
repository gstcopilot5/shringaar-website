/* Local, explicitly enabled test UI. This is not server-side payment authorization. */
(function (root, factory) {
  const gate = factory();
  if (typeof module === "object" && module.exports) module.exports = gate;
  else { root.SuboPaymentTest = gate; gate.init(root.document, root); }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function allowed(location) {
    try {
      const url = new URL(location.href);
      return ["http:", "https:"].includes(url.protocol)
        && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
        && url.searchParams.getAll("payment-test").length === 1
        && url.searchParams.get("payment-test") === "1";
    } catch (_) { return false; }
  }
  function init(doc, win) {
    const button = doc.getElementById("testPayBtn");
    if (!button) return;
    button.hidden = true; button.disabled = true;
    if (!allowed(win.location)) return;
    // Do not download or initialize the checkout SDK during a normal public visit.
    button.hidden = false;
    button.textContent = "Loading payment test…";
    const script = doc.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.addEventListener("load", () => {
      if (typeof win.Razorpay === "function" && allowed(win.location)) {
        button.disabled = false; button.textContent = "Test ₹100 Payment";
      } else { button.textContent = "Payment test unavailable"; }
    });
    script.addEventListener("error", () => { button.textContent = "Payment test failed to load"; });
    doc.head.append(script);
  }
  return { allowed, init };
});
