/* Customer-facing interactions only. Payment and admin code stay independent. */
(function (root, factory) {
  const studio = factory();
  if (typeof module === "object" && module.exports) module.exports = studio;
  else studio.init(root.document, root);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const WHATSAPP = "https://wa.me/918116317662";
  const HOST = "https://shringaar-website.vercel.app/";

  function clean(value, limit) {
    return String(value == null ? "" : value).trim().slice(0, limit);
  }

  function enquiryURL(values) {
    const name = clean(values.name, 100);
    const business = clean(values.biz, 140);
    const city = clean(values.city, 100);
    const service = clean(values.service, 100);
    const message = clean(values.msg, 2000);
    const lines = ["Hi Subo Digital Studio!", "I am " + (name || "(name)") + (business ? " from " + business : "") + "."];
    if (city) lines.push("Town / city: " + city);
    lines.push("I need: " + (service || "Help deciding on my website."));
    if (message) lines.push("About my project: " + message);
    return WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function safeURL(value, base = HOST) {
    if (!value || !String(value).trim()) return "";
    try {
      const url = new URL(String(value), base);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }

  // Captures of the live sites: a full-page desktop scroll and the first mobile screen.
  const covers = {
    "ShineX Car Detailing": { theme: "shinex", title: "ShineX", subtitle: "CAR DETAILING", asset: "assets/project-shinex.svg", screenshot: "assets/work/shinex-desktop.webp", shotHeight: 2800, phone: "assets/work/shinex-phone.webp" },
    "AgentPassport": { theme: "passport", title: "Agent\nPassport", subtitle: "A DIGITAL PRODUCT", asset: "assets/project-passport.svg", screenshot: "assets/work/agentpassport-desktop.webp", shotHeight: 2641, phone: "assets/work/agentpassport-phone.webp" },
    "GSTCopilot": { theme: "gst", title: "GSTCopilot", subtitle: "A TOOL FOR CHARTERED ACCOUNTANTS", asset: "assets/project-gst.svg", screenshot: "assets/work/gstcopilot-desktop.webp", shotHeight: 2800, phone: "assets/work/gstcopilot-phone.webp" },
    "J.P. Imitation Jewellers": { theme: "jewels", title: "J.P.", subtitle: "IMITATION JEWELLERS", asset: "assets/project-jewels.svg", screenshot: "assets/work/jp-jewellers-desktop.webp", shotHeight: 2800, phone: "assets/work/jp-jewellers-phone.webp" }
  };

  function slug(value) {
    return String(value || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  }

  function renderProjects(doc, projects, base, onPreview) {
    const grid = doc.getElementById("workGrid");
    if (!grid || !Array.isArray(projects)) return;
    const index = doc.getElementById("workIndex");
    const fragment = doc.createDocumentFragment();
    const indexFragment = doc.createDocumentFragment();
    const previewable = [];
    const used = new Set();
    const make = (tag, className, text) => {
      const el = doc.createElement(tag);
      if (className) el.className = className;
      if (text != null) el.textContent = String(text);
      return el;
    };
    const count = projects.filter(project => project && typeof project === "object").length;
    let position = 0;
    projects.forEach(project => {
      if (!project || typeof project !== "object") return;
      const number = String(++position).padStart(2, "0");
      const art = Object.hasOwn(covers, project.title) ? covers[project.title] : { theme: "generic", title: String(project.title || "Project"), subtitle: "WEBSITE / DIGITAL" };
      let id = "project-" + slug(project.title);
      while (used.has(id)) id += "-" + position;
      used.add(id);
      const link = safeURL(project.url, base);
      const card = make("article", "project-card reveal");
      card.setAttribute("id", id);
      const media = make("div", "project-media");
      const cover = make("div", "project-cover cover-" + art.theme);
      cover.setAttribute("aria-hidden", "true");
      if (art.asset) {
        const drawing = make("img", "cover-decoration");
        drawing.src = art.asset; drawing.alt = ""; drawing.loading = "lazy"; drawing.decoding = "async";
        drawing.width = 600; drawing.height = 430;
        cover.append(drawing);
      }
      const top = make("div", "cover-topline");
      top.append(make("span", "", link ? new URL(link).hostname.replace(/^www\./, "") : "SELECTED WORK"), make("span", "", number));
      const title = make("div", "cover-title");
      art.title.split("\n").forEach((line, i) => {
        if (i) title.append(doc.createElement("br"));
        title.append(doc.createTextNode(line));
      });
      title.append(make("small", "", art.subtitle));
      cover.append(top, title, make("span", "cover-bottomline", "SUBO DIGITAL STUDIO / PROJECT ILLUSTRATION"));
      // An admin-supplied image takes precedence and is shown as a still cover.
      const custom = !!(project.image && String(project.image).trim());
      const imageURL = safeURL(custom ? project.image : art.screenshot, base);
      if (imageURL) {
        const shot = make("div", "project-shot");
        const image = make("img", custom ? "project-image" : "project-image is-scrollable");
        image.src = imageURL; image.alt = ""; image.loading = "lazy"; image.decoding = "async";
        image.width = custom ? 1440 : 960; image.height = custom ? 1000 : art.shotHeight;
        image.addEventListener("error", () => image.remove(), { once: true });
        shot.append(image); cover.append(shot);
      }
      media.append(cover);
      const phoneURL = !custom && art.phone ? safeURL(art.phone, base) : "";
      if (phoneURL) {
        const phone = make("div", "project-phone");
        phone.setAttribute("aria-hidden", "true");
        const screen = make("img", "");
        screen.src = phoneURL; screen.alt = ""; screen.loading = "lazy"; screen.decoding = "async";
        screen.width = 585; screen.height = 1266;
        screen.addEventListener("error", () => phone.remove(), { once: true });
        phone.append(screen); media.append(phone);
        card.classList.add("has-phone");
      }
      const body = make("div", "project-body");
      const heading = make("div", "project-title-row");
      heading.append(make("h3", "", project.title || "Project"));
      if (link) {
        const visit = make("a", "project-visit", "Visit website ");
        const arrow = make("span", "", "↗"); arrow.setAttribute("aria-hidden", "true"); visit.append(arrow);
        visit.href = link; visit.target = "_blank"; visit.rel = "noopener noreferrer";
        visit.setAttribute("aria-label", "Visit website: " + (project.title || "project") + " (opens in a new tab)");
        heading.append(visit);
      }
      body.append(make("p", "project-category", project.category || ""), heading, make("p", "", project.description || ""));
      if (link && onPreview) {
        const inspect = make("button", "project-inspect", "Preview actual website ");
        const arrow = make("span", "", "↗"); arrow.setAttribute("aria-hidden", "true"); inspect.append(arrow);
        inspect.type = "button";
        inspect.setAttribute("aria-label", "Preview actual website: " + (project.title || "project"));
        const entry = { project, trigger: inspect };
        previewable.push(entry);
        inspect.addEventListener("click", () => onPreview(project, inspect, previewable));
        body.append(inspect);
      }
      card.append(media, body); fragment.append(card);
      if (index) {
        const item = make("a", "");
        item.href = "#" + id;
        item.append(make("span", "work-index-number", number + " / " + String(count).padStart(2, "0")), make("strong", "", project.title || "Project"));
        if (project.category) item.append(make("small", "", project.category));
        indexFragment.append(item);
      }
    });
    grid.replaceChildren(fragment);
    if (index) index.replaceChildren(indexFragment);
  }

  function setupPreview(doc, win) {
    const dialog = doc.getElementById("projectDialog");
    if (!dialog || typeof dialog.showModal !== "function") return null;
    const stage = doc.getElementById("previewStage");
    const title = doc.getElementById("previewTitle");
    const external = doc.getElementById("previewExternal");
    const status = doc.getElementById("previewStatus");
    const devices = Array.from(dialog.querySelectorAll("[data-preview-width]"));
    const nav = doc.getElementById("previewNav");
    const prev = doc.getElementById("previewPrev");
    const next = doc.getElementById("previewNext");
    const count = doc.getElementById("previewCount");
    let frame = null, opener = null, entries = [], current = -1;
    const fit = () => {
      if (!frame) return;
      const width = stage.dataset.width === "mobile" ? 390 : 1280;
      const scale = Math.min(1, stage.clientWidth / width);
      if (scale <= 0) return;
      frame.style.width = width + "px";
      frame.style.height = Math.ceil(stage.clientHeight / scale) + "px";
      frame.style.transform = "scale(" + scale + ")";
      frame.style.left = Math.max(0, (stage.clientWidth - width * scale) / 2) + "px";
    };
    const setWidth = width => {
      stage.dataset.width = width;
      devices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.previewWidth === width)));
      fit();
    };
    devices.forEach(button => button.addEventListener("click", () => setWidth(button.dataset.previewWidth)));
    doc.getElementById("previewClose").addEventListener("click", () => dialog.close());
    doc.getElementById("previewEnquire").addEventListener("click", () => {
      opener = null;
      dialog.close();
      const contact = doc.getElementById("contact");
      if (contact) { contact.setAttribute("tabindex", "-1"); contact.focus({ preventScroll: true }); }
    });
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      stage.replaceChildren(); frame = null;
      doc.documentElement.classList.remove("preview-open");
      if (opener) opener.focus();
    });
    if ("ResizeObserver" in win) new win.ResizeObserver(fit).observe(stage);
    else win.addEventListener("resize", fit, { passive: true });
    const embeddable = project => {
      const url = safeURL(project && project.url, win.location.href);
      return url && new URL(url).origin !== new URL(win.location.href).origin ? url : "";
    };
    const load = (project, url) => {
      const name = project.title || "Project";
      title.textContent = project.title || "Project preview";
      external.href = url;
      status.textContent = "Loading " + name + "…";
      frame = doc.createElement("iframe");
      frame.title = name + " — live website preview";
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("referrerpolicy", "no-referrer");
      const loaded = frame;
      frame.addEventListener("load", () => { if (frame === loaded) status.textContent = "Scroll inside to explore · blank preview? Use Open website."; });
      frame.addEventListener("error", () => { if (frame === loaded) status.textContent = "Preview unavailable. Use Open website."; });
      frame.src = url;
      stage.replaceChildren(frame);
      fit();
      // Previous/next move between projects without closing the dialog.
      const browsable = entries.length > 1 && current >= 0;
      if (nav) nav.hidden = !browsable;
      if (count) count.textContent = browsable ? String(current + 1).padStart(2, "0") + " / " + String(entries.length).padStart(2, "0") : "";
      if (browsable) {
        const neighbour = step => entries[(current + step + entries.length) % entries.length].project.title || "project";
        if (prev) prev.setAttribute("aria-label", "Previous project: " + neighbour(-1));
        if (next) next.setAttribute("aria-label", "Next project: " + neighbour(1));
      }
    };
    const move = step => {
      if (entries.length < 2 || current < 0) return;
      current = (current + step + entries.length) % entries.length;
      opener = entries[current].trigger;
      load(entries[current].project, embeddable(entries[current].project));
    };
    if (prev) prev.addEventListener("click", () => move(-1));
    if (next) next.addEventListener("click", () => move(1));
    return (project, trigger, list) => {
      const url = safeURL(project.url, win.location.href);
      if (!url) return;
      if (!embeddable(project)) {
        win.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      entries = Array.isArray(list) ? list.filter(entry => entry && embeddable(entry.project)) : [];
      current = entries.findIndex(entry => entry.project === project);
      opener = trigger;
      load(project, url);
      doc.documentElement.classList.add("preview-open");
      dialog.showModal();
      setWidth(win.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop");
    };
  }

  function init(doc, win) {
    renderProjects(doc, win.PROJECTS, win.location.href, setupPreview(doc, win));
    const year = doc.getElementById("yr");
    if (year) year.textContent = new Date().getFullYear();
    const menu = doc.getElementById("siteNav");
    const toggle = doc.getElementById("hamb");
    const header = doc.getElementById("header");
    const note = doc.getElementById("noti");
    const mobile = win.matchMedia("(max-width: 760px)");
    const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
    let headerHeight = 90;
    const measureHeader = () => {
      if (!header) return;
      headerHeight = Math.ceil(header.getBoundingClientRect().height || 90);
      doc.documentElement.style.setProperty("--header-height", headerHeight + "px");
    };
    if (header && "ResizeObserver" in win) new win.ResizeObserver(measureHeader).observe(header);
    measureHeader();

    let menuChanged = null;
    const setMenu = (open, restoreFocus = false) => {
      if (!toggle || !menu) return;
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      measureHeader();
      if (menuChanged) menuChanged();
      if (restoreFocus) toggle.focus();
    };
    if (menu && toggle && header) {
      toggle.hidden = false;
      header.classList.add("js-nav");
      toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
      menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
        if (!mobile.matches) return;
        setMenu(false);
        const id = link.getAttribute("href");
        const target = id && id.startsWith("#") ? doc.getElementById(id.slice(1)) : null;
        if (target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      }));
      mobile.addEventListener("change", () => setMenu(false));
    }
    doc.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (toggle && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
      if (note && note.open) { note.open = false; note.querySelector("summary").focus(); }
    });
    doc.addEventListener("click", event => {
      if (header && !header.contains(event.target)) setMenu(false);
      if (note && !note.contains(event.target)) note.open = false;
    });
    if (note) note.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { note.open = false; }));

    const form = doc.getElementById("cform");
    if (form) form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const name = form.elements.namedItem("name");
      if (!name.value.trim()) {
        name.setCustomValidity("Please enter your name.");
        name.reportValidity();
        name.addEventListener("input", () => name.setCustomValidity(""), { once: true });
        return;
      }
      const values = {};
      ["name", "biz", "city", "service", "msg"].forEach(key => { values[key] = form.elements.namedItem(key).value; });
      const url = enquiryURL(values);
      // Provide a persistent link as well, including when a browser blocks new tabs.
      const status = doc.getElementById("formStatus");
      if (status) {
        const link = doc.createElement("a");
        link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
        link.textContent = "Open your WhatsApp message";
        status.replaceChildren(doc.createTextNode("Your message is ready. "), link);
      }
      win.open(url, "_blank", "noopener,noreferrer");
    });

    // Blocks are only hidden once an observer is guaranteed to reveal them; without
    // observers, JavaScript or with reduced motion, everything stays visible.
    if ("IntersectionObserver" in win && !reduced.matches) {
      const root = doc.documentElement;
      root.classList.add("js-reveal");
      const reveal = new win.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!reduced.matches) entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
      doc.querySelectorAll(".reveal").forEach(el => reveal.observe(el));
      reduced.addEventListener("change", event => {
        if (!event.matches) return;
        reveal.disconnect();
        root.classList.remove("js-reveal");
      });
      win.addEventListener("beforeprint", () => root.classList.remove("js-reveal"));
    }

    const progress = doc.getElementById("readingProgress");
    const art = doc.getElementById("processArt");
    const steps = Array.from(doc.querySelectorAll(".process-step"));
    const sections = Array.from(doc.querySelectorAll("main > section[id]"));
    const navLinks = menu ? Array.from(menu.querySelectorAll("a")) : [];
    const enquiryBar = doc.getElementById("mobileEnquiry");
    const hero = doc.querySelector(".hero");
    const contact = doc.getElementById("contact");
    // The floating WhatsApp bar never covers what visitors act on:
    // it stays out of sections with their own WhatsApp actions (plans, FAQs) and everything
    // from the contact section onward, steps aside when scrolling stops with a control
    // beneath it, and yields to keyboard focus.
    const quietSections = ["plans", "faq"].map(id => doc.getElementById(id)).filter(Boolean);
    const CONTROLS = "main a[href], main button, main summary, main input, main select, main textarea";
    let barReserve = 96, yielding = false, idleTimer = 0;
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.top < win.innerHeight && r.bottom > headerHeight; };
    const underBar = el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > win.innerHeight - barReserve && r.top < win.innerHeight; };
    function placeEnquiryBar() {
      if (!enquiryBar || !hero || !contact) return;
      const wanted = mobile.matches && hero.getBoundingClientRect().bottom < headerHeight &&
        contact.getBoundingClientRect().top >= win.innerHeight &&
        !quietSections.some(onScreen) && !(toggle && toggle.getAttribute("aria-expanded") === "true");
      enquiryBar.hidden = !wanted || yielding;
      if (!enquiryBar.hidden) {
        const top = enquiryBar.getBoundingClientRect().top;
        if (top > 0) barReserve = Math.ceil(win.innerHeight - top) + 8;
      }
    }
    const settleEnquiryBar = () => {
      idleTimer = 0;
      yielding = mobile.matches && Array.from(doc.querySelectorAll(CONTROLS)).some(underBar);
      placeEnquiryBar();
    };
    menuChanged = placeEnquiryBar;
    if (enquiryBar) doc.addEventListener("focusin", event => {
      if (enquiryBar.hidden || enquiryBar.contains(event.target) || !underBar(event.target)) return;
      yielding = true; placeEnquiryBar();
    });
    let scheduled = false;
    function updateScroll() {
      scheduled = false;
      const distance = doc.documentElement.scrollHeight - win.innerHeight;
      if (header) header.classList.toggle("has-scrolled", win.scrollY > 16);
      placeEnquiryBar();
      // Re-check once scrolling settles; during a scroll the bar keeps its state, so it never flickers.
      if (enquiryBar && win.setTimeout) {
        if (idleTimer) win.clearTimeout(idleTimer);
        idleTimer = win.setTimeout(settleEnquiryBar, 160);
      }
      if (progress) progress.style.transform = "scaleX(" + (distance > 0 ? Math.max(0, Math.min(1, win.scrollY / distance)) : 0) + ")";
      if (steps.length && art) {
        // Read layout before changing classes; no scroll hijacking or pinned panels.
        const positions = steps.map(step => step.getBoundingClientRect().top);
        let active = 0;
        positions.forEach((top, i) => { if (top < win.innerHeight * 0.65) active = i; });
        art.dataset.step = String(active + 1);
        steps.forEach((step, i) => step.classList.toggle("is-active", i === active));
      }
      // A section is current once it crosses a reading line below the sticky header,
      // so anchor jumps and normal scrolling highlight the same link.
      const line = headerHeight + (win.innerHeight - headerHeight) * .3;
      const positions = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top }));
      let current = "";
      positions.forEach(section => { if (section.top <= line) current = "#" + section.id; });
      navLinks.forEach(link => {
        if (link.getAttribute("href") === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
    const scheduleScroll = () => {
      if (!scheduled) { scheduled = true; win.requestAnimationFrame(updateScroll); }
    };
    win.addEventListener("scroll", scheduleScroll, { passive: true });
    win.addEventListener("resize", () => { measureHeader(); scheduleScroll(); }, { passive: true });
    updateScroll();
  }
  return { enquiryURL, safeURL, renderProjects, setupPreview, init };
});
