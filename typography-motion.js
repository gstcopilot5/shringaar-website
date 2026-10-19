/* Masked typography and scroll-linked art direction.
 * Native Web Animations, semantic text, no scroll interception or runtime library.
 * Content stays readable if scripts, observers or animation support are unavailable.
 * Every entrance rises from its mask in one direction, so motion reads as a system.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else api.init(root.document, root);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const easing = "cubic-bezier(.16,1,.3,1)";
  function entrance(direction, distance = "105%") {
    return {
      left: "translate3d(-" + distance + ",0,0)",
      right: "translate3d(" + distance + ",0,0)",
      up: "translate3d(0," + distance + ",0)",
      down: "translate3d(0,-" + distance + ",0)"
    }[direction] || "translate3d(0,40px,0)";
  }

  function splitWords(doc, heading) {
    const existing = heading.querySelectorAll(".motion-word-inner");
    if (existing.length) return Array.from(existing);
    // Preserve the actual spaces, line breaks, emphasis and original heading name.
    const walker = doc.createTreeWalker(heading, 4);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest('[aria-hidden="true"]')) nodes.push(node);
    }
    const words = [];
    nodes.forEach(node => {
      const fragment = doc.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(doc.createTextNode(part)); return; }
        const mask = doc.createElement("span"); mask.className = "motion-word";
        const word = doc.createElement("span"); word.className = "motion-word-inner";
        word.textContent = part;
        mask.append(word); fragment.append(mask); words.push(word);
      });
      node.replaceWith(fragment);
    });
    return words;
  }

  function init(doc, win) {
    if (!doc.querySelector(".hero-copy") || !win.Element || !win.Element.prototype.animate) return null;
    const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
    const active = new Set();
    const observers = [];
    let disabled = reduced.matches;
    const animate = (el, direction, delay, duration = 900, distance) => {
      if (disabled || !el) return null;
      el.dataset.entryDirection = direction;
      const animation = el.animate([
        { transform: entrance(direction, distance), opacity: 0 },
        { opacity: 1, offset: .35 },
        { transform: "translate3d(0,0,0)", opacity: 1 }
      ], { duration, delay, easing, fill: "backwards" });
      animation.id = "subo-type-" + direction;
      active.add(animation);
      animation.finished.then(() => active.delete(animation), () => active.delete(animation));
      return animation;
    };
    const heroLines = Array.from(doc.querySelectorAll(".hero-line>span"));
    const playHero = () => {
      if (disabled) return;
      heroLines.forEach((line, i) => animate(line, "up", 80 + i * 90, 950));
      animate(doc.querySelector(".hero-copy .eyebrow"), "up", 0, 700, "10px");
      animate(doc.querySelector(".hero-description"), "up", 360, 850, "16px");
      animate(doc.querySelector(".hero-actions"), "up", 440, 850, "16px");
      animate(doc.querySelector(".hero-proof"), "up", 520, 850, "12px");
    };
    // Only the section statements are split into words; cards reveal as whole blocks.
    const headings = Array.from(doc.querySelectorAll("main > section h2, .service-card h3"));
    const prepare = heading => {
      const words = splitWords(doc, heading);
      heading.dataset.typeDirection = "up";
      heading.dataset.typeState = "ready";
      return { heading, words, direction: "up" };
    };
    const groups = disabled ? [] : headings.map(prepare);
    const reveal = group => {
      group.heading.dataset.typeState = "entered";
      group.words.forEach((word, i) => animate(word, group.direction, Math.min(i * 40, 280), 900));
    };
    if ("IntersectionObserver" in win && !disabled) {
      const lookup = new Map(groups.map(group => [group.heading, group]));
      const observer = new win.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          reveal(lookup.get(entry.target)); observer.unobserve(entry.target);
        });
      }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
      groups.forEach(group => observer.observe(group.heading)); observers.push(observer);

      // Supporting copy follows the headings; prices, forms and navigation stay still.
      const copy = Array.from(doc.querySelectorAll(".heading-row>p, .studio-copy>p:not(.eyebrow), .contact-copy>p:not(.eyebrow)"));
      const copyObserver = new win.IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animate(entry.target, "up", 140, 850, "16px"); copyObserver.unobserve(entry.target);
      }), { threshold: .2 });
      copy.forEach(el => copyObserver.observe(el)); observers.push(copyObserver);
    }
    playHero();

    const band = doc.getElementById("serviceMotion");
    const tracks = Array.from(doc.querySelectorAll("[data-type-track]"));
    const emblem = doc.querySelector(".studio-emblem");
    const emblemMark = emblem && emblem.querySelector("img");
    const process = doc.querySelector(".process-steps");
    const processArt = doc.getElementById("processArt");
    const visible = new Set();
    let raf = 0;
    const scrollFrame = () => {
      raf = 0;
      if (disabled || doc.hidden) return;
      // Read the active elements together before writing any transforms.
      const position = el => {
        const rect = el.getBoundingClientRect();
        return Math.max(0, Math.min(1, (win.innerHeight - rect.top) / (win.innerHeight + rect.height)));
      };
      const bandProgress = band && visible.has(band) ? position(band) : null;
      const emblemProgress = emblem && visible.has(emblem) ? position(emblem) : null;
      // The ring maps the actual first-to-last chapter positions, including mobile wrapping.
      let storyProgress = null;
      if (process && processArt && visible.has(process)) {
        const first = process.firstElementChild.getBoundingClientRect().top;
        const last = process.lastElementChild.getBoundingClientRect().top;
        storyProgress = Math.max(0, Math.min(1, (win.innerHeight * .65 - first) / Math.max(1, last - first)));
      }
      if (bandProgress !== null) tracks.forEach(track => {
        const direction = Number(track.dataset.typeTrack);
        const distance = win.innerWidth < 600 ? 65 : 150;
        track.style.transform = "translate3d(" + ((bandProgress - .5) * distance * direction).toFixed(2) + "px,0,0)";
      });
      if (emblemProgress !== null && emblemMark) {
        emblemMark.style.transform = "translate3d(0," + ((.5 - emblemProgress) * 38).toFixed(2) + "px,0) rotate(" + ((emblemProgress - .5) * 20).toFixed(2) + "deg)";
      }
      if (storyProgress !== null) processArt.style.setProperty("--story-progress", storyProgress.toFixed(3));
    };
    const schedule = () => { if (!disabled && !raf && visible.size && !doc.hidden) raf = win.requestAnimationFrame(scrollFrame); };
    if ("IntersectionObserver" in win && !disabled) {
      const observer = new win.IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)); schedule();
      });
      [band, emblem, process].filter(Boolean).forEach(el => observer.observe(el)); observers.push(observer);
      win.addEventListener("scroll", schedule, { passive: true });
      win.addEventListener("resize", schedule, { passive: true });
    }
    const settle = () => {
      disabled = true;
      active.forEach(animation => animation.cancel()); active.clear();
      observers.forEach(observer => observer.disconnect());
      if (raf) win.cancelAnimationFrame(raf); raf = 0;
      tracks.forEach(track => { track.style.transform = "none"; });
      if (emblemMark) emblemMark.style.transform = "none";
      if (processArt) processArt.style.removeProperty("--story-progress");
      groups.forEach(group => { group.heading.dataset.typeState = "settled"; });
    };
    // Enabling reduced motion mid-entrance immediately reveals every word.
    reduced.addEventListener("change", event => { if (event.matches) settle(); });
    doc.addEventListener("visibilitychange", () => {
      if (doc.hidden) active.forEach(animation => animation.pause());
      else if (!disabled) { active.forEach(animation => animation.play()); schedule(); }
    });
    doc.addEventListener("focusin", event => {
      // Keyboard focus must never land inside an invisible moving control.
      const block = event.target.closest(".hero-actions, .hero-proof");
      if (block) active.forEach(animation => {
        if (animation.effect.target === block) animation.finish();
      });
    });
    win.addEventListener("pagehide", settle, { once: true });
    return { active, settle };
  }
  return { init, entrance, splitWords };
});
