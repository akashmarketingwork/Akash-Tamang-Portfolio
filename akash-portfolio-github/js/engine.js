/*
 * Scroll-story engine v2
 * ----------------------
 * Scroll position (px) is the timeline, exactly like albinotonnina.com.
 * The story is a list of SCENES. Each scene is one illustration (plus cut-out
 * layers) with its own camera. Scenes cross over with "dive-through"
 * transitions: the camera zooms deep into one scene while the next scene
 * fades in already zoomed, then pulls back.
 *
 * Keyframes everywhere: { scrollPx: { prop: value, ease? } }
 *   scene:  opacity, blur
 *   camera: x, y (point to look at, in image px), zoom
 *   layer:  opacity, x, y, scale, rotate, blur, reveal (0..1 left-to-right wipe)
 */
(function () {
  "use strict";

  var S = window.STORY;
  var W = S.stage.width;
  var H = S.stage.height;

  var SCENE_DEF = { opacity: 1, blur: 0 };
  var CAM_DEF = { x: 0, y: 0, zoom: 1 };
  var LAYER_DEF = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, blur: 0, reveal: 1, p: 0 };

  var EASES = {
    linear: function (p) { return p; },
    in: function (p) { return p * p * p; },
    out: function (p) { return 1 - Math.pow(1 - p, 3); },
    inOut: function (p) {
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    },
  };

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function normalize(keys, defaults) {
    var frames = Object.keys(keys || {}).map(Number).sort(function (a, b) { return a - b; });
    var carry = Object.assign({}, defaults);
    return frames.map(function (f) {
      var k = keys[f];
      var v = Object.assign({}, carry);
      for (var p in defaults) if (k[p] !== undefined) v[p] = k[p];
      carry = v;
      return { t: f, v: v, ease: k.ease || "inOut" };
    });
  }

  function sample(frames, t, defaults) {
    if (!frames.length) return defaults;
    if (t <= frames[0].t) return frames[0].v;
    var last = frames[frames.length - 1];
    if (t >= last.t) return last.v;
    for (var i = 0; i < frames.length - 1; i++) {
      var a = frames[i], b = frames[i + 1];
      if (t >= a.t && t <= b.t) {
        var p = (EASES[b.ease] || EASES.inOut)((t - a.t) / (b.t - a.t || 1));
        var o = {};
        for (var k in a.v) o[k] = a.v[k] + (b.v[k] - a.v[k]) * p;
        return o;
      }
    }
    return last.v;
  }

  // ---------------------------------------------------------------- build DOM
  var root = document.getElementById("scenes");
  var overlay = document.getElementById("overlay");
  var subtitleEl = document.getElementById("subtitle");
  var progressEl = document.getElementById("progress");
  var hintEl = document.getElementById("scroll-hint");
  var debugEl = document.getElementById("debug");
  var spacer = document.getElementById("spacer");
  var pending = 0;
  var hqQueue = [];
  var SMALL_SCREEN = Math.min(screen.width, screen.height) < 820;

  function ready() {
    document.body.classList.add("ready");
    // load the sharp images one by one, in story order
    (function next() {
      var item = hqQueue.shift();
      if (!item) return;
      var img = new Image();
      img.onload = function () {
        var swap = function () { item.el.src = item.src; next(); };
        if (img.decode) img.decode().then(swap, swap); else swap();
      };
      img.onerror = next;
      img.src = item.src;
    })();
  }

  function makeLayer(L, parent) {
    var el;
    if (L.src) {
      el = new Image();
      el.alt = L.alt || "";
      el.decoding = "async";
      el.draggable = false;
      pending++;
      // fast start: show a small preview first, swap in the sharp image later
      var lq = /^images\/.*\.webp$/.test(L.src) ? L.src.replace("images/", "images/lq/") : null;
      el.onload = el.onerror = function () {
        el.onload = el.onerror = null;
        if (--pending <= 0) ready();
      };
      el.src = lq || L.src;
      // phones get a 2000px version: sharp enough, and much lighter to animate
      if (lq) hqQueue.push({ el: el, src: SMALL_SCREEN ? L.src.replace("images/", "images/md/") : L.src });
    } else {
      el = document.createElement("div");
      el.innerHTML = L.html || "";
    }
    el.className = "layer" + (L.className ? " " + L.className : "");
    if (L.left !== undefined) el.style.left = L.left + "px";
    if (L.top !== undefined) el.style.top = L.top + "px";
    if (L.width) el.style.width = L.width + "px";
    if (L.height) el.style.height = L.height + "px";
    if (L.origin) el.style.transformOrigin = L.origin;
    el.style.zIndex = L.z || 0;
    parent.appendChild(el);
    return { el: el, frames: normalize(L.keys, LAYER_DEF), hasReveal: hasProp(L.keys, "reveal"), hasP: hasProp(L.keys, "p"), last: "" };
  }

  function hasProp(keys, p) {
    for (var k in keys || {}) if (keys[k][p] !== undefined) return true;
    return false;
  }

  // camera keyframes may carry "px": where to look on phones (portrait),
  // used for wide shots whose subject would fall outside a narrow screen
  function cameraFrames(keys) {
    var frames = normalize(keys, CAM_DEF);
    frames.forEach(function (f) {
      var k = keys[f.t];
      f.v.px = k.px !== undefined ? k.px : f.v.x;
      // zoom is interpolated on a log scale so deep dives feel even
      f.v.zoom = Math.log(f.v.zoom);
    });
    return frames;
  }

  var scenes = S.scenes.map(function (sc, i) {
    var sceneEl = document.createElement("section");
    sceneEl.className = "scene";
    sceneEl.style.zIndex = i + 1;
    if (sc.bg) sceneEl.style.background = sc.bg;
    var stage = document.createElement("div");
    stage.className = "stage";
    stage.style.width = W + "px";
    stage.style.height = H + "px";
    var world = document.createElement("div");
    world.className = "world";
    stage.appendChild(world);
    sceneEl.appendChild(stage);
    root.appendChild(sceneEl);
    return {
      el: sceneEl,
      stage: stage,
      world: world,
      bounds: sc.bounds,
      ref: sc.ref || sc.bounds,
      frames: normalize(sc.keys, SCENE_DEF),
      camera: cameraFrames(sc.camera),
      layers: sc.layers.map(function (L) { return makeLayer(L, world); }),
      lastVis: null,
    };
  });

  var overlayLayers = (S.overlay || []).map(function (L) { return makeLayer(L, overlay); });
  if (pending === 0) ready();

  // ------------------------------------------------------------------- layout
  var stageScale = 1;
  var PORTRAIT_WIDTH = 0.46; // share of a picture's width a phone sees in a wide shot
  var portrait = false;

  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    stageScale = Math.max(vw / W, vh / H);
    portrait = vh > vw;
    var tf = "translate(-50%, -50%) scale(" + stageScale.toFixed(4) + ")";
    scenes.forEach(function (sc) { sc.stage.style.transform = tf; });
    // "large viewport" height so the page length doesn't jump when a phone's address bar hides
    var lvh = window.CSS && CSS.supports && CSS.supports("height", "100lvh");
    spacer.style.height = lvh ? "calc(" + S.length + "px + 100lvh)" : S.length + vh + "px";
    document.body.classList.toggle("portrait", portrait);
  }

  // ------------------------------------------------------------------- render
  function renderLayer(L, t) {
    var v = sample(L.frames, t, LAYER_DEF);
    var tf = "translate(" + v.x.toFixed(2) + "px," + v.y.toFixed(2) + "px) scale(" +
      v.scale.toFixed(4) + ") rotate(" + v.rotate.toFixed(3) + "deg)";
    var key = tf + "|" + v.opacity.toFixed(3) + "|" + v.blur.toFixed(1) + "|" + v.reveal.toFixed(4) + "|" + v.p.toFixed(4);
    if (key === L.last) return;
    L.last = key;
    L.el.style.transform = tf;
    L.el.style.opacity = v.opacity;
    L.el.style.visibility = v.opacity < 0.002 ? "hidden" : "visible";
    if (!SMALL_SCREEN) L.el.style.filter = v.blur > 0.05 ? "blur(" + v.blur.toFixed(1) + "px)" : "";
    L.el.style.pointerEvents = v.opacity > 0.5 ? "auto" : "none";
    if (L.hasP) L.el.style.setProperty("--p", v.p.toFixed(4));
    if (L.hasReveal) {
      var r = Math.max(0, Math.min(1, v.reveal));
      L.el.style.clipPath = r >= 0.999 ? "" : "inset(0 " + ((1 - r) * 100).toFixed(2) + "% 0 0)";
    }
  }

  function render(t) {
    // visible area of the stage in stage px
    var visW = window.innerWidth / stageScale;
    var visH = window.innerHeight / stageScale;

    for (var i = 0; i < scenes.length; i++) {
      var sc = scenes[i];
      var sv = sample(sc.frames, t, SCENE_DEF);
      var visible = sv.opacity > 0.002;
      if (visible !== sc.lastVis) {
        // fully remove hidden scenes from drawing so the browser can free their memory
        sc.el.style.display = visible ? "" : "none";
        sc.lastVis = visible;
      }
      if (!visible) continue;
      sc.el.style.opacity = sv.opacity;
      if (!SMALL_SCREEN) sc.el.style.filter = sv.blur > 0.05 ? "blur(" + sv.blur.toFixed(1) + "px)" : "";

      var cam = sample(sc.camera, t, CAM_DEF);
      var rel = Math.exp(cam.zoom);
      var b = sc.bounds, ref = sc.ref;
      var zoom;
      if (portrait) {
        // phones: a wide shot shows a good part of the picture's width; the picture
        // sits in the middle with soft bands of its own colours above and below
        zoom = (visW / (PORTRAIT_WIDTH * ref.w)) * Math.max(1, rel * 0.6);
        zoom = Math.max(zoom, visW / b.w);
      } else {
        // zoom 1 = the widest view of the picture that still fills the screen
        var cover = Math.max(visW / ref.w, visH / ref.h);
        zoom = Math.max(cover * rel, visW / b.w, visH / b.h);
      }
      // keep the camera inside the picture so its edges never show
      var hw = visW / 2 / zoom, hh = visH / 2 / zoom;
      var cx = portrait && cam.px !== undefined ? cam.px : cam.x;
      var x = Math.min(Math.max(cx, hw), b.w - hw);
      var y = hh * 2 >= b.h ? b.h / 2 : Math.min(Math.max(cam.y, hh), b.h - hh);
      sc.world.style.transform =
        "translate(" + W / 2 + "px," + H / 2 + "px) scale(" + zoom.toFixed(4) +
        ") translate(" + (-x).toFixed(2) + "px," + (-y).toFixed(2) + "px)";

      for (var j = 0; j < sc.layers.length; j++) renderLayer(sc.layers[j], t);
    }
    for (var k = 0; k < overlayLayers.length; k++) renderLayer(overlayLayers[k], t);

    renderSubtitle(t);
    if (S.onFrame) S.onFrame(t);
    progressEl.style.transform = "scaleX(" + Math.min(1, t / S.length).toFixed(4) + ")";
    hintEl.style.opacity = t > 40 ? 0 : 1;
    if (debugOn) debugEl.textContent = "scroll " + Math.round(t) + " / " + S.length;
  }

  var currentText = null, subTimer = null;
  function renderSubtitle(t) {
    var sub = null;
    for (var i = 0; i < S.subtitles.length; i++) {
      var s = S.subtitles[i];
      if (t >= s.start && t <= s.end) { sub = s; break; }
    }
    var text = sub ? sub.text : "";
    if (text === currentText) return;
    currentText = text;
    subtitleEl.classList.remove("show");
    clearTimeout(subTimer);
    subTimer = setTimeout(function () {
      subtitleEl.textContent = text;
      subtitleEl.parentNode.className = sub && sub.position ? sub.position : "";
      if (text) subtitleEl.classList.add("show");
    }, 140);
  }

  // smooth "film" feel: ease the rendered position toward the real scroll
  var target = 0, current = 0, running = false;
  var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  // a gentle glide on every device, so phone scrolling feels like the desktop "film"
  var EASE = touch ? 0.11 : 0.085;
  function tick() {
    var d = target - current;
    current = reduceMotion || Math.abs(d) < 0.4 ? target : current + d * EASE;
    try { render(current); } catch (err) { if (window.console) console.error(err); }
    // always keep going until we've caught up, even if a frame had a problem
    if (current !== target) requestAnimationFrame(tick);
    else running = false;
  }
  function onScroll() {
    target = Math.min(Math.max(window.scrollY, 0), S.length);
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  var debugOn = false;
  window.addEventListener("keydown", function (e) {
    if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
      debugOn = !debugOn;
      debugEl.hidden = !debugOn;
      render(current);
    }
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { layout(); scenes.forEach(function (s) { s.layers.forEach(function (l) { l.last = ""; }); }); render(current); });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  layout();
  render(0);

  // tiny API for tuning from the console: story.jump(4200)
  window.story = { jump: function (px) { window.scrollTo(0, px); } };
})();
