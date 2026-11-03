/* AMINE PS4 — guarded launcher.
 * Keeps the user in control, waits for the offline cache, and gives a
 * five-second cancellation window before optional autostart.
 * Exploit code and payload files are intentionally not modified.
 */
(function () {
  "use strict";

  var TARGET = {
    hen: "log=1&afterglow=run&payload=hen.bin",
    goldhen: "log=1&afterglow=run&mode=goldhen"
  };
  var STORE_KEY = "amine.ps4.choice";
  var AUTO_DELAY = 5;
  var timer = null;
  var remaining = AUTO_DELAY;
  var pendingManualStart = false;
  var launched = false;

  var form = document.getElementById("pick");
  var autoBox = document.getElementById("auto");
  var startButton = form ? form.querySelector('button[type="submit"]') : null;
  var status = document.getElementById("count");

  function say(message) {
    if (status) status.textContent = message;
  }

  function chosenPayload() {
    var radio = document.querySelector('#pick input[name="payload"]:checked');
    var value = radio && TARGET[radio.value] ? radio.value : "goldhen";
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ payload: value })); }
    catch (e) { /* Storage is optional; current selection remains usable. */ }
    return value;
  }

  function stopTimer() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function go() {
    if (launched) return;
    if (window.AMINE_CACHE_READY !== true || window.AMINE_CACHE_ERROR === true) {
      pendingManualStart = true;
      say("WAITING FOR OFFLINE CACHE…");
      return;
    }
    launched = true;
    stopTimer();
    if (startButton) startButton.disabled = true;
    say("CACHE READY — OPENING SELECTED PAYLOAD…");
    window.location.replace("jb.html?" + TARGET[chosenPayload()]);
  }

  function beginAutoCountdown() {
    stopTimer();
    if (!autoBox || !autoBox.checked || launched) return;
    remaining = AUTO_DELAY;
    say("AUTO START IN " + remaining + "s — UNTICK TO CANCEL");
    timer = window.setInterval(function () {
      if (!autoBox.checked || launched) {
        stopTimer();
        return;
      }
      remaining -= 1;
      if (remaining <= 0) {
        stopTimer();
        go();
      } else {
        say("AUTO START IN " + remaining + "s — UNTICK TO CANCEL");
      }
    }, 1000);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      if (event && event.preventDefault) event.preventDefault();
      pendingManualStart = true;
      if (window.AMINE_CACHE_READY === true && window.AMINE_CACHE_ERROR !== true) {
        go();
      } else {
        say("PLEASE WAIT — SAVING OFFLINE CACHE BEFORE START");
      }
    }, false);
  }

  if (autoBox) {
    autoBox.addEventListener("change", function () {
      if (!autoBox.checked) {
        stopTimer();
        say(window.AMINE_CACHE_READY ? "CACHE READY — PRESS START WHEN READY" : "AUTO START CANCELLED");
      } else if (window.AMINE_CACHE_READY === true) {
        beginAutoCountdown();
      }
    }, false);
  }

  window.addEventListener("amine-cache-ready", function () {
    if (pendingManualStart) go();
    else beginAutoCountdown();
  }, false);

  window.addEventListener("amine-cache-state", function () {
    if (window.AMINE_CACHE_ERROR === true) {
      stopTimer();
      if (startButton) startButton.disabled = false;
      say("CACHE ERROR — CHECK LOCAL SERVER, THEN RELOAD");
    }
  }, false);

  window.addEventListener("pagehide", stopTimer, false);

  if (window.AMINE_CACHE_READY === true) beginAutoCountdown();
  else if (window.AMINE_CACHE_ERROR === true) say("CACHE ERROR — CHECK LOCAL SERVER, THEN RELOAD");
  else say("WAITING FOR OFFLINE CACHE…");
})();
