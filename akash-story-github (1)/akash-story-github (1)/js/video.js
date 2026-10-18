/*
 * Monitor video
 * -------------
 * Plays a short clip on the Millet Amma monitor while the camera is zoomed in on it
 * (STORY.video.from → STORY.video.to). If the visitor stays there it keeps playing
 * (it loops); scroll on and it pauses. The clip only starts downloading when the
 * visitor gets close to the scene, so the first load stays fast.
 * It starts muted (browsers only allow muted autoplay); the "Sound on" button unmutes.
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
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.preload = "none";
  if (V.poster) video.poster = V.poster;
  holder.appendChild(video);

  var loaded = false;
  var inZone = false;

  function load() {
    if (loaded) return;
    loaded = true;
    // offer every format given; the browser picks the first one it can play
    [].concat(V.sources || [V.src]).forEach(function (src) {
      var s = document.createElement("source");
      s.src = src;
      s.type = /\.webm$/.test(src) ? "video/webm" : "video/mp4";
      video.appendChild(s);
    });
    video.load();
  }

  video.addEventListener("playing", function () { if (inZone) body.classList.add("video-on"); });
  video.addEventListener("error", function () { if (inZone) body.classList.add("video-failed"); });

  function update() {
    body.classList.toggle("video-zone", inZone);
    if (inZone) {
      load();
      var p = video.play();
      if (p && p.catch) p.catch(function () { body.classList.add("video-failed"); });
    } else {
      video.pause();
      body.classList.remove("video-on", "video-failed");
    }
  }

  var prev = S.onFrame;
  S.onFrame = function (t) {
    if (prev) prev(t);
    if (!loaded && t > V.from - 2500) load(); // fetch a little ahead of time
    var z = t >= V.from && t <= V.to;
    if (z !== inZone) { inZone = z; update(); }
  };

  var btn = document.getElementById("sound-btn");
  if (btn) btn.addEventListener("click", function () {
    video.muted = !video.muted;
    if (!video.muted) video.volume = 0.9;
    btn.textContent = video.muted ? "🔊 Sound on" : "🔇 Sound off";
  });
  var link = document.getElementById("watch-link");
  if (link && V.youtubeId) link.href = "https://www.youtube.com/watch?v=" + V.youtubeId;
})();
