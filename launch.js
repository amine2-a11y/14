/* AMINE PS4 14.00 — automatic cache-first launcher.
 * Redirect to jb.html immediately after the offline cache is confirmed ready.
 * Default payload is GoldHEN; a saved HEN/GoldHEN choice is preserved.
 */
(function () {
  "use strict";

  var TARGET = {
    hen: "log=1&afterglow=run&payload=hen.bin",
    goldhen: "log=1&afterglow=run&mode=goldhen"
  };
  var STORE_KEY = "amine.ps4.choice";
  var redirected = false;

  function chosenPayload() {
    var value = "goldhen";
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (saved && TARGET[saved.payload]) value = saved.payload;
    } catch (e) {}
    var radio = document.querySelector('#pick input[name="payload"]:checked');
    if (radio && TARGET[radio.value]) value = radio.value;
    return value;
  }

  function goToJailbreak() {
    if (redirected || window.AMINE_CACHE_READY !== true ||
        window.AMINE_CACHE_ERROR === true) return;

    redirected = true;
    var target = TARGET[chosenPayload()];
    var status = document.getElementById("count");
    if (status) status.textContent = "CACHE SAVED — OPENING JAILBREAK PAGE…";

    // Replace the landing page immediately; no Start button or countdown.
    window.location.replace("jb.html?" + target);
  }

  window.addEventListener("amine-cache-ready", goToJailbreak, false);
  window.addEventListener("amine-cache-state", function () {
    if (window.AMINE_CACHE_ERROR === true) {
      var status = document.getElementById("count");
      if (status) status.textContent =
        "CACHE FAILED — CONNECT ONLINE AND RELOAD THIS PAGE";
    }
  }, false);

  // cache-status.js runs before this file, so also check its current state.
  if (window.AMINE_CACHE_READY === true) goToJailbreak();
})();
