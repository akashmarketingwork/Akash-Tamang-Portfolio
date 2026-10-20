/*
 * Monitor video
 * -------------
 * Plays the Millet Amma clip on the office monitor while the camera is on it
 * (STORY.video.from → STORY.video.to). Scroll on and it pauses; come back and it resumes.
 *
 * Sound: it tries to play WITH sound. Browsers only allow that after the visitor has
 * clicked/tapped the page once, so if it's blocked the clip plays muted and a
 * "Tap for sound" button appears (any tap on the page also turns sound on).
 * Pause/Play and Mute/Unmute buttons are shown while the clip is on screen.
 */
(function () {
  "use strict";
  var S = window.STORY;
  var V = S && S.video;
  if (!V) return;

  var body = document.body;
  var holder = document.getElementById(V.elementId);
  if (!holder) return;

  var video = document.createElement("video");
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "none";
  if (V.poster) video.poster = V.poster;
  holder.appendChild(video);

  var soundBtn = document.getElementById("sound-btn");
  var playBtn = document.getElementById("play-btn");
  var link = document.getElementById("watch-link");
  if (link && V.youtubeId) link.href = "https://www.youtube.com/watch?v=" + V.youtubeId;

  var loaded = false;
  var inZone = false;
  var userPaused = false;   // visitor pressed Pause
  var userMuted = false;    // visitor pressed Mute
  var interacted = false;   // visitor has clicked/tapped the page (lets sound play)
  var lastTry = 0;

  function load() {
    if (loaded) return;
    loaded = true;
    [].concat(V.sources || [V.src]).forEach(function (src) {
      var s = document.createElement("source");
      s.src = src;
      s.type = /\.webm$/i.test(src) ? "video/webm" : "video/mp4";
      video.appendChild(s);
    });
    video.load();
  }

  function refreshButtons() {
    if (soundBtn) {
      soundBtn.textContent = video.muted ? "🔊 Tap for sound" : "🔇 Mute";
      soundBtn.setAttribute("aria-pressed", String(!video.muted));
    }
    if (playBtn) playBtn.textContent = video.paused ? "▶ Play" : "⏸ Pause";
  }

  function tryPlay() {
    if (!inZone || userPaused) return;
    lastTry = Date.now();
    video.muted = userMuted;
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        // sound blocked by the browser: play muted instead and offer the sound button
        if (!inZone) return;
        video.muted = true;
        var q = video.play();
        if (q && q.catch) q.catch(function () { if (inZone) body.classList.add("video-failed"); });
        refreshButtons();
      });
    }
    refreshButtons();
  }

  video.addEventListener("playing", function () {
    if (inZone) { body.classList.add("video-on"); body.classList.remove("video-failed"); }
    refreshButtons();
  });
  video.addEventListener("pause", refreshButtons);
  video.addEventListener("volumechange", refreshButtons);

  function enter() {
    body.classList.add("video-zone");
    load();
    tryPlay();
  }
  function leave() {
    body.classList.remove("video-zone", "video-on", "video-failed");
    video.pause();
  }

  var prev = S.onFrame;
  S.onFrame = function (t) {
    if (prev) prev(t);
    if (!loaded && t > V.from - 3000) load(); // fetch a little ahead of time
    var z = t >= V.from && t <= V.to;
    if (z !== inZone) { inZone = z; if (z) enter(); else leave(); }
    // still on the monitor but not playing (e.g. a scroll interrupted it): try again
    else if (inZone && video.paused && !userPaused && Date.now() - lastTry > 1200) tryPlay();
  };

  // The first click/tap anywhere unlocks sound for the whole visit.
  // Phones (iOS) also need the video itself started inside that tap, so we "prime" it:
  // start it with sound for an instant and stop it again. Later it autoplays WITH sound.
  function unlock(e) {
    if (interacted) return;
    if (e && e.target && e.target.closest && e.target.closest("#video-ui")) return;
    interacted = true;
    load();
    if (inZone) { video.muted = userMuted; refreshButtons(); return; }
    video.muted = false;
    var p = video.play();
    var stop = function () { if (!inZone) { video.pause(); try { video.currentTime = 0; } catch (x) {} } };
    if (p && p.then) p.then(stop, function () {}); else stop();
  }
  ["pointerdown", "touchend", "keydown", "click"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { passive: true });
  });

  if (soundBtn) soundBtn.addEventListener("click", function () {
    video.muted = !video.muted;
    userMuted = video.muted;
    if (!video.muted) video.volume = 1;
    if (video.paused && !userPaused) tryPlay();
    refreshButtons();
  });
  if (playBtn) playBtn.addEventListener("click", function () {
    if (video.paused) { userPaused = false; tryPlay(); }
    else { userPaused = true; video.pause(); }
    refreshButtons();
  });
})();
