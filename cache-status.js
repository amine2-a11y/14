/* AMINE PS4 — legacy WebKit Application Cache status display.
 * This reports browser cache events; it does not validate exploit files.
 */
(function () {
  "use strict";
  var el = document.getElementById("cacheStatus");
  var bar = document.getElementById("cacheProgress");
  var app = window.applicationCache;
  var finished = false;
  window.AMINE_CACHE_READY = false;
  window.AMINE_CACHE_ERROR = false;

  function paint(message, cls, percent) {
    if (el) {
      el.textContent = "OFFLINE CACHE: " + message;
      el.className = "cache-status" + (cls ? " " + cls : "");
    }
    if (bar && typeof percent === "number") {
      bar.style.width = Math.max(0, Math.min(100, percent)) + "%";
    }
  }
  function signal(ready, error) {
    window.AMINE_CACHE_READY = !!ready;
    window.AMINE_CACHE_ERROR = !!error;
    var event;
    try {
      event = document.createEvent("Event");
      event.initEvent(ready ? "amine-cache-ready" : "amine-cache-state", false, false);
      window.dispatchEvent(event);
    } catch (e) { /* Older WebKit may not expose custom event support. */ }
  }
  function ready() {
    if (finished && window.AMINE_CACHE_READY) return;
    finished = true;
    paint("100% — SAVED FOR OFFLINE USE", "ready", 100);
    signal(true, false);
  }
  function failed(message) {
    finished = false;
    paint(message, "error", 0);
    signal(false, true);
  }
  if (!app) {
    failed("APP CACHE NOT AVAILABLE — USE LOCAL SERVER AND CHECK BROWSER SUPPORT");
    return;
  }

  function update() {
    if (finished && app.status !== app.UPDATEREADY) return;
    switch (app.status) {
      case app.IDLE:
        ready();
        break;
      case app.CHECKING:
        paint("CHECKING FILE LIST…", "", 0);
        signal(false, false);
        break;
      case app.DOWNLOADING:
        paint("DOWNLOADING FILES…", "", 0);
        signal(false, false);
        break;
      case app.UNCACHED:
        paint("NOT CACHED — WAITING FOR FIRST DOWNLOAD", "", 0);
        signal(false, false);
        break;
      case app.UPDATEREADY:
        try { app.swapCache(); } catch (e) {}
        ready();
        break;
      case app.OBSOLETE:
        failed("CACHE OBSOLETE — RELOAD FROM LOCAL SERVER");
        break;
      default:
        paint("WAITING FOR CACHE…", "", 0);
        signal(false, false);
    }
  }

  app.addEventListener("checking", update, false);
  app.addEventListener("downloading", update, false);
  app.addEventListener("progress", function (event) {
    var pct = 0;
    if (event && event.lengthComputable && event.total > 0) {
      pct = Math.round((event.loaded / event.total) * 100);
    }
    paint(pct ? "DOWNLOADING " + pct + "%" : "DOWNLOADING FILES…", "", pct);
    signal(false, false);
  }, false);
  app.addEventListener("cached", ready, false);
  app.addEventListener("noupdate", ready, false);
  app.addEventListener("updateready", function () {
    try { app.swapCache(); } catch (e) {}
    ready();
  }, false);
  app.addEventListener("obsolete", function () {
    failed("CACHE OBSOLETE — RELOAD FROM LOCAL SERVER");
  }, false);
  app.addEventListener("error", function () {
    failed("CACHE DOWNLOAD FAILED — CHECK SERVER AND RELOAD");
  }, false);

  update();
  try {
    if (app.status === app.UNCACHED || app.status === app.IDLE) app.update();
  } catch (e) {
    failed("CACHE UPDATE FAILED — RELOAD FROM LOCAL SERVER");
  }
})();
