// Google sends the Android sign-in here (it only redirects to web addresses); this hands the
// result to the app. The app checks it against the verifier it kept, so the link is no use elsewhere.
(function () {
  var q = location.hash.slice(1);
  var p = new URLSearchParams(q);
  if (p.get("auth_error") || p.get("google_error")) {
    document.getElementById("title").textContent = "Didn't work";
    document.getElementById("text").textContent = p.get("auth_error") || p.get("google_error");
  }
  var scheme = "dev.itiel.worktime://auth?" + q;
  var intent = "intent://auth?" + q + "#Intent;scheme=dev.itiel.worktime;package=dev.itiel.worktime;end";
  var a = document.getElementById("open");
  a.href = /Android/.test(navigator.userAgent) ? intent : scheme;
  history.replaceState(null, "", location.pathname);
  location.replace(a.href);
})();
