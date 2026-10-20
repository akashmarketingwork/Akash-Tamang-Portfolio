/*
 * First screen: types "a story to scroll down slowly." once the page is ready,
 * then shows the scroll icon.
 */
(function () {
  "use strict";
  var TEXT = "a story to\nscroll down slowly.";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function start() {
    var el = document.getElementById("typed");
    if (!el) return;
    if (reduce) { el.textContent = TEXT; document.body.classList.add("typed-done"); return; }
    var i = 0;
    (function step() {
      el.textContent = TEXT.slice(0, ++i);
      if (i < TEXT.length) setTimeout(step, TEXT[i - 1] === "\n" ? 260 : 60 + Math.random() * 40);
      else document.body.classList.add("typed-done");
    })();
  }
  (function wait() {
    if (document.body.classList.contains("ready")) setTimeout(start, 900);
    else setTimeout(wait, 100);
  })();
})();
