/*  Ants Jackson — portfolio access gate (client-side)
 *  ---------------------------------------------------------------------------
 *  This is a light front-end gate, not hard security: a static page's content
 *  still lives in the source, so a determined visitor could bypass it. It's
 *  meant to keep casual eyes out and greet invited viewers. For real protection
 *  use host-level password protection (e.g. Netlify "password protect site").
 *
 *  Credentials live in THIS file, kept out of index.html. The password is
 *  stored only as a SHA-256 hash — the plaintext word is written nowhere.
 *
 *  To change the password: hash the new one and paste the hex below, e.g.
 *      printf '%s' 'newpassword' | shasum -a 256
 *  To change who can sign in: edit ALLOWED_EMAILS.
 *  ------------------------------------------------------------------------- */
(function () {
  "use strict";

  /* ---- Credentials (edit here) ------------------------------------------ */
  var ALLOWED_EMAILS = [
    "ants.jackson@gmail.com",
    "amanda.judd@gettimely.com"
  ];
  // SHA-256 of the password (NOT the password itself).
  var PASSWORD_SHA256 = "31709d6bb7be320adc84552de93ab579d9d3152dbd745da8defd9407cab0ed06";
  var SESSION_KEY = "aj_portfolio_auth";

  // Login logging (optional). Paste your Google Apps Script Web App /exec URL
  // here to record each login to your Google Sheet. Leave "" to disable logging.
  var LOGGING_ENDPOINT = "";
  /* ----------------------------------------------------------------------- */

  // Expose the endpoint so loginhistory.html can read the same value.
  window.AJ = window.AJ || {};
  window.AJ.endpoint = LOGGING_ENDPOINT;

  function pageName() {
    var p = (location.pathname || "").split("/").pop();
    return p || "index.html";
  }

  // Fire-and-forget: record a login to the Google Sheet via the Apps Script.
  function logEvent(email) {
    if (!LOGGING_ENDPOINT) return;
    try {
      var payload = JSON.stringify({
        email: email || "",
        page: pageName(),
        userAgent: navigator.userAgent || "",
        tz: (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : ""
      });
      // text/plain + no-cors keeps it a "simple" request (no CORS preflight).
      fetch(LOGGING_ENDPOINT, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload
      }).catch(function () {});
    } catch (e) {}
  }

  // Called once the viewer has access (fresh login or existing session).
  function afterAccess(fresh, email) {
    if (fresh) logEvent(email);
    if (typeof window.AJ_onAccess === "function") {
      try { window.AJ_onAccess({ fresh: fresh, email: email || null }); } catch (e) {}
    }
  }

  /* SHA-256 — prefer native WebCrypto, fall back to a verified pure-JS impl. */
  function sha256Hex(str) {
    try {
      if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        var data = new TextEncoder().encode(str);
        return window.crypto.subtle.digest("SHA-256", data).then(function (buf) {
          var bytes = new Uint8Array(buf), hex = "";
          for (var i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
          return hex;
        }).catch(function () { return sha256Fallback(str); });
      }
    } catch (e) { /* fall through */ }
    return Promise.resolve(sha256Fallback(str));
  }

  function sha256Fallback(str) {
    function R(n, x) { return (x >>> n) | (x << (32 - n)); }
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes = Array.from(new TextEncoder().encode(str));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, 8 * i)) & 0xff);
    var w = new Array(64);
    for (var o = 0; o < bytes.length; o += 64) {
      for (var t = 0; t < 16; t++) w[t] = (bytes[o+4*t]<<24)|(bytes[o+4*t+1]<<16)|(bytes[o+4*t+2]<<8)|(bytes[o+4*t+3]);
      for (t = 16; t < 64; t++) {
        var s0 = R(7,w[t-15]) ^ R(18,w[t-15]) ^ (w[t-15] >>> 3);
        var s1 = R(17,w[t-2]) ^ R(19,w[t-2]) ^ (w[t-2] >>> 10);
        w[t] = (w[t-16] + s0 + w[t-7] + s1) | 0;
      }
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (t = 0; t < 64; t++) {
        var S1 = R(6,e) ^ R(11,e) ^ R(25,e);
        var ch = (e & f) ^ ((~e) & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = R(2,a) ^ R(13,a) ^ R(22,a);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
      }
      H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;
      H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;
    }
    var hex = "";
    for (i = 0; i < 8; i++) hex += ((H[i] >>> 0).toString(16)).padStart(8, "0");
    return hex;
  }

  /* ---- Gate wiring ------------------------------------------------------- */
  function unlock(overlay) {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
    overlay.classList.add("aj-hide");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    setTimeout(function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 420);
  }

  function init() {
    var overlay = document.getElementById("aj-gate");
    if (!overlay) return;

    // Already signed in this session? Skip the gate (no new log entry).
    var ok = false;
    try { ok = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
    if (ok) { overlay.parentNode.removeChild(overlay); afterAccess(false, null); return; }

    // Lock scroll behind the gate.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    var form = document.getElementById("aj-gate-form");
    var emailEl = document.getElementById("aj-email");
    var passEl = document.getElementById("aj-pass");
    var errEl = document.getElementById("aj-error");
    var btn = document.getElementById("aj-submit");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      errEl.textContent = "";
      var email = (emailEl.value || "").trim().toLowerCase();
      var pass = passEl.value || "";
      var emailOk = ALLOWED_EMAILS.indexOf(email) !== -1;

      btn.disabled = true;
      Promise.resolve(sha256Hex(pass)).then(function (hash) {
        btn.disabled = false;
        if (emailOk && hash === PASSWORD_SHA256) {
          unlock(overlay);
          afterAccess(true, email);
        } else {
          errEl.textContent = "That email or password wasn’t recognised. Please try again.";
          passEl.value = "";
          passEl.focus();
        }
      }).catch(function () {
        btn.disabled = false;
        errEl.textContent = "Something went wrong. Please try again.";
      });
    });

    setTimeout(function () { emailEl.focus(); }, 60);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
