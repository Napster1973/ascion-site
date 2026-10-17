/* ==========================================================
   Ascion — landing page script
   ========================================================== */

// Shown to visitors if sending the form fails.
const CONTACT_EMAIL = "mzavattim@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Split headings into words for the rise-in animation ---- */
  document.querySelectorAll(".split").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words
      .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
      .join(" ");
  });

  /* ---- Stagger items that sit side by side ---- */
  const stagger = (selector, step) =>
    document.querySelectorAll(selector).forEach((group) =>
      [...group.children].forEach((el, i) => el.style.setProperty("--d", `${i * step}s`))
    );
  stagger(".team__grid", 0.12);
  document.querySelectorAll(".about__text, .band__text, .section__head").forEach((group) =>
    group.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`))
  );

  /* ---- Reveal on scroll ---- */
  const animated = document.querySelectorAll(".reveal, .split, .mission");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    animated.forEach((el) => io.observe(el));
  } else {
    animated.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Scroll-linked effects: nav, progress bar, hero, creature ---- */
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".progress span");
  const heroText = document.querySelector(".hero__text");
  const heroVisual = document.querySelector(".hero__visual");
  const beast = document.querySelector(".about__art");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 20);

    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduceMotion) {
      if (heroText && y < vh) {
        const p = y / vh;
        heroText.style.transform = `translateY(${y * 0.35}px)`;
        heroText.style.opacity = String(1 - p * 1.2);
        heroVisual.style.transform = `translateY(${y * 0.15}px)`;
      }
      if (beast) {
        const r = beast.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = (r.top + r.height / 2 - vh / 2) / vh;
          beast.style.translate = `0 ${p * 40}px`;
        }
      }
    }
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---- Highlight the nav link of the section on screen ---- */
  const links = [...document.querySelectorAll(".nav__links a:not(.btn)")];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
          }
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => spy.observe(s));
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

    // Fallback: Formspree not configured → open the visitor's email app
    if (form.action.includes("YOUR_FORM_ID")) {
      const body =
        `Name: ${data.get("name")}\n` +
        `Email: ${data.get("email")}\n` +
        `Who: ${data.get("role")}\n` +
        `About: ${data.get("engagement")}\n` +
        `Portfolio: ${data.get("portfolio") || "—"}\n\n` +
        `${data.get("message")}`;
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Ascion — " + data.get("engagement"))}` +
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
      setStatus("Thank you! Your message is on its way. We'll reply soon.", "ok");
    } catch {
      setStatus(`Something went wrong. You can also email ${CONTACT_EMAIL}.`, "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
});
