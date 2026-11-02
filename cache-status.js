/* AMINE PS4 14.00 — legacy Application Cache status/progress.
   AppCache is intentionally used here for old embedded WebKit browsers. */
(function () {
  var el = document.getElementById("cacheStatus");
  var bar = document.getElementById("cacheProgress");
  var app = window.applicationCache;
  window.AMINE_CACHE_READY = false;
  window.AMINE_CACHE_ERROR = false;

  function paint(message, cls, percent) {
    if (el) {
      el.textContent = "OFFLINE CACHE: " + message;
      el.className = "cache-status " + (cls || "");
    }
    if (bar && typeof percent === "number") {
      bar.style.width = Math.max(0, Math.min(100, percent)) + "%";
    }
  }
  function signal(ready, error) {
    window.AMINE_CACHE_READY = !!ready;
    window.AMINE_CACHE_ERROR = !!error;
    try {
      window.dispatchEvent(new Event(ready ? "amine-cache-ready" : "amine-cache-state"));
    } catch (e) {}
  }
  function ready() {
    paint("100% — SAVED FOR OFFLINE USE", "ready", 100);
    signal(true, false);
  }
  function failed(message) {
    paint(message, "error", 0);
    signal(false, true);
  }
  if (!app) {
    failed("APP CACHE API NOT AVAILABLE IN THIS BROWSER");
    return;
  }
  function update() {
    switch (app.status) {
      case app.IDLE:
        ready();
        break;
      case app.CHECKING:
        paint("CHECKING MANIFEST…", "", 0);
        signal(false, false);
        break;
      case app.DOWNLOADING:
        paint("DOWNLOADING FILES…", "", 0);
        signal(false, false);
        break;
      case app.UNCACHED:
        paint("NOT CACHED — CONNECT INTERNET AND RELOAD", "error", 0);
        signal(false, false);
        break;
      case app.UPDATEREADY:
        try { app.swapCache(); } catch (e) {}
        ready();
        break;
      case app.OBSOLETE:
        failed("MANIFEST OBSOLETE — RELOAD WHILE ONLINE");
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
    failed("MANIFEST OBSOLETE — RELOAD WHILE ONLINE");
  }, false);
  app.addEventListener("error", function () {
    failed("DOWNLOAD FAILED — CHECK GITHUB FILES / RELOAD ONLINE");
  }, false);
  update();
  try {
    if (app.status === app.UNCACHED || app.status === app.IDLE) app.update();
  } catch (e) {
    failed("CACHE UPDATE FAILED — RELOAD WHILE ONLINE");
  }
})();
