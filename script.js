/* ==========================================================
   Ascion — landing page script
   ========================================================== */

// Where messages go if the Formspree form isn't set up yet.
// Replace with your real email address.
const CONTACT_EMAIL = "mzavattim@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Footer year ---- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Nav: background on scroll ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Contact form ---- */
  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form__status");
  const submitBtn = form.querySelector("button[type=submit]");

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = "form__status" + (type ? " is-" + type : "");
  };

  const validate = () => {
    let valid = true;
    form.querySelectorAll("[required], input[type=url]").forEach((input) => {
      const field = input.closest(".field");
      const ok = input.checkValidity() && (!input.required || input.value.trim() !== "");
      field.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    return valid;
  };

  form.querySelectorAll("input, select, textarea").forEach((el) =>
    el.addEventListener("input", () => el.closest(".field")?.classList.remove("is-invalid"))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatus("Please fill in the highlighted fields.", "err");
      return;
    }

    const data = new FormData(form);
    if (data.get("_gotcha")) return; // spam bot

    // Fallback: Formspree not configured yet → open the visitor's email app
    if (form.action.includes("YOUR_FORM_ID")) {
      const body =
        `Name: ${data.get("name")}\n` +
        `Email: ${data.get("email")}\n` +
        `Role: ${data.get("role")}\n` +
        `Looking for: ${data.get("engagement")}\n` +
        `Portfolio: ${data.get("portfolio") || "—"}\n\n` +
        `${data.get("message")}`;
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Ascion — " + data.get("role") + " application")}` +
        `&body=${encodeURIComponent(body)}`;
      setStatus("Opening your email app…", "ok");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("");

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("Thank you! Your message is on its way — I'll reply soon.", "ok");
    } catch {
      setStatus(`Something went wrong. You can also email ${CONTACT_EMAIL}.`, "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
});
