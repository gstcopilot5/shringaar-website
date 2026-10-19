/* Subo motion direction.
 * Native Web Animations gives a synchronized, inspectable timeline without a library.
 * Every hero layer shares playback, visibility and reduced-motion controls.
 * The story plays once and rests on the finished website; it never loops on its own.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else api.init(root.document, root);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const DURATION = 9000;
  // Website, phone and enquiry are all in place here; later keyframes only reset the loop.
  const REST = .86;
  const ease = "cubic-bezier(.22,1,.36,1)";
  function sceneAt(progress) { return progress < .24 ? "business" : progress < .52 ? "design" : "website"; }
  function frame(offset, transform, opacity = 1) { return { offset, transform, opacity, easing: ease }; }

  function init(doc, win) {
    const hero = doc.getElementById("heroMotion");
    if (!hero) return null;
    const toggle = doc.getElementById("motionToggle");
    const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
    const seekButtons = Array.from(hero.querySelectorAll("[data-scene-seek]"));
    const animations = [];
    const add = (selector, frames) => {
      const element = hero.querySelector(selector);
      if (!element || typeof element.animate !== "function") return;
      const animation = element.animate(frames, { duration: DURATION, iterations: Infinity, fill: "both", easing: "linear" });
      animation.pause();
      animations.push(animation);
    };
    add(".brief-card", [
      frame(0, "translate(38%,0) rotate(-5deg) scale(1)"),
      frame(.16, "translate(38%,0) rotate(-5deg) scale(1)"),
      frame(.27, "translate(-17%,4%) rotate(-12deg) scale(.75)", .6),
      frame(.35, "translate(-45%,4%) rotate(-15deg) scale(.65)", 0),
      frame(.9, "translate(-45%,4%) rotate(-15deg) scale(.65)", 0),
      frame(.96, "translate(38%,10%) rotate(-5deg) scale(.96)", 0),
      frame(1, "translate(38%,0) rotate(-5deg) scale(1)")
    ]);
    add(".wire-scene", [
      frame(0, "translateY(28px) rotateY(-18deg) rotateX(8deg) scale(.86)", 0),
      frame(.19, "translateY(28px) rotateY(-18deg) rotateX(8deg) scale(.86)", 0),
      frame(.3, "translateY(0) rotateY(-8deg) rotateX(4deg) scale(1)"),
      frame(.4, "translateY(0) rotateY(-8deg) rotateX(4deg) scale(1)"),
      frame(.51, "translateY(-12px) rotateY(-6deg) rotateX(4deg) scale(1)", 0),
      frame(1, "translateY(-12px) rotateY(-6deg) rotateX(4deg) scale(1)", 0)
    ]);
    add(".website-scene", [
      frame(0, "translateY(45px) rotateY(-18deg) rotateX(12deg) scale(.78)", 0),
      frame(.34, "translateY(45px) rotateY(-18deg) rotateX(12deg) scale(.78)", 0),
      frame(.51, "translateY(0) rotateY(-6deg) rotateX(4deg) rotateZ(-2deg) scale(1)"),
      frame(.88, "translateY(0) rotateY(-6deg) rotateX(4deg) rotateZ(-2deg) scale(1)"),
      frame(.98, "translateY(-22px) rotateY(0) rotateX(0) scale(.95)", 0),
      frame(1, "translateY(45px) rotateY(-18deg) rotateX(12deg) scale(.78)", 0)
    ]);
    add(".scene-site-header", [frame(0, "translateY(-12px)", 0), frame(.4, "translateY(-12px)", 0), frame(.51, "translateY(0)"), frame(1, "translateY(0)")]);
    add(".scene-site-copy", [frame(0, "translateX(-20px)", 0), frame(.43, "translateX(-20px)", 0), frame(.57, "translateX(0)"), frame(1, "translateX(0)")]);
    add(".scene-site-art", [frame(0, "rotateY(25deg) scale(.8)", 0), frame(.47, "rotateY(25deg) scale(.8)", 0), frame(.63, "rotateY(0) scale(1)"), frame(1, "rotateY(0) scale(1)")]);
    hero.querySelectorAll(".scene-service-row span").forEach((element, index) => {
      if (!element.animate) return;
      const animation = element.animate([frame(0, "translateY(18px)", 0), frame(.5 + index * .025, "translateY(18px)", 0), frame(.64 + index * .025, "translateY(0)"), frame(1, "translateY(0)")], { duration: DURATION, iterations: Infinity, fill: "both" });
      animation.pause(); animations.push(animation);
    });
    add(".scene-phone", [
      frame(0, "translate(20%,35px) rotate(18deg) scale(.85)", 0),
      frame(.53, "translate(20%,35px) rotate(18deg) scale(.85)", 0),
      frame(.69, "translate(0,0) rotate(8deg) scale(1)"),
      frame(.89, "translate(0,0) rotate(8deg) scale(1)"),
      frame(.98, "translate(10%,-15px) rotate(12deg) scale(.95)", 0),
      frame(1, "translate(20%,35px) rotate(18deg) scale(.85)", 0)
    ]);
    add(".scene-enquiry", [
      frame(0, "translateY(35px) rotate(-6deg) scale(.85)", 0),
      frame(.65, "translateY(35px) rotate(-6deg) scale(.85)", 0),
      frame(.75, "translateY(-3px) rotate(-3deg) scale(1.03)"),
      frame(.79, "translateY(0) rotate(-3deg) scale(1)"),
      frame(.9, "translateY(0) rotate(-3deg) scale(1)"),
      frame(.98, "translateY(15px) rotate(-3deg) scale(.95)", 0),
      frame(1, "translateY(35px) rotate(-6deg) scale(.85)", 0)
    ]);
    add(".scene-cursor", [
      frame(0, "translate(-70%,-20%)", 0), frame(.25, "translate(-70%,-20%)", 0),
      frame(.32, "translate(-30%,-30%)"), frame(.44, "translate(60%,-45%)"),
      frame(.58, "translate(-100%,60%)"), frame(.65, "translate(-100%,60%)", 0),
      frame(1, "translate(-70%,-20%)", 0)
    ]);
    // The progress line fills as the story reaches its resting frame.
    add(".motion-timeline>span", [{ offset: 0, transform: "scaleX(0)", easing: "linear" }, { offset: REST, transform: "scaleX(1)" }, { offset: 1, transform: "scaleX(1)" }]);
    if (!animations.length) {
      toggle.disabled = true; toggle.textContent = "Static preview";
      seekButtons.forEach(button => { button.disabled = true; });
      return null;
    }

    let wantsPlaying = !reduced.matches, inView = true, raf = 0;
    const now = () => ((Number(animations[0].currentTime) || 0) % DURATION) / DURATION;
    const finished = () => now() >= REST - .001;
    let lastPhase = null;
    const updateLabels = () => {
      const phase = sceneAt(now());
      if (phase === lastPhase) return;
      lastPhase = phase;
      hero.dataset.scene = phase;
      seekButtons.forEach(button => button.setAttribute("aria-pressed", String(sceneAt(Number(button.dataset.sceneSeek)) === phase)));
    };
    const seek = progress => {
      animations.forEach(animation => { animation.currentTime = Math.min(.999, Math.max(0, progress)) * DURATION; });
      updateLabels();
    };
    const tick = () => {
      if (now() >= REST) { seek(REST); wantsPlaying = false; sync(); return; }
      updateLabels(); raf = win.requestAnimationFrame(tick);
    };
    function sync() {
      if (raf) { win.cancelAnimationFrame(raf); raf = 0; }
      const playing = wantsPlaying && inView && !doc.hidden && !reduced.matches;
      animations.forEach(animation => playing ? animation.play() : animation.pause());
      hero.dataset.motion = reduced.matches ? "reduced" : playing ? "playing" : "paused";
      toggle.disabled = reduced.matches;
      toggle.textContent = reduced.matches ? "Motion off" : wantsPlaying ? "Pause" : finished() ? "Replay" : "Play";
      toggle.setAttribute("aria-label", reduced.matches ? "Motion off — reduced motion preference" : toggle.textContent + " hero animation");
      updateLabels();
      if (playing) raf = win.requestAnimationFrame(tick);
    }
    toggle.addEventListener("click", () => {
      if (!wantsPlaying && finished()) seek(0);
      wantsPlaying = !wantsPlaying; sync();
    });
    seekButtons.forEach(button => button.addEventListener("click", () => { wantsPlaying = false; seek(Number(button.dataset.sceneSeek)); sync(); }));
    reduced.addEventListener("change", () => { wantsPlaying = !reduced.matches; seek(reduced.matches ? REST : 0); sync(); });
    doc.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in win) new win.IntersectionObserver(entries => {
      inView = entries[0].isIntersecting; sync();
    }, { threshold: .05 }).observe(hero);
    seek(reduced.matches ? REST : 0);
    sync();
    return { animations, seek, pause() { wantsPlaying = false; sync(); }, play() { if (finished()) seek(0); wantsPlaying = true; sync(); } };
  }
  return { init, sceneAt, DURATION, REST };
});
