/**
 * V1/V2 ABI page: load V2 JSON into <pre> and wire version tabs.
 */
(function () {
  function root() {
    return document.querySelector(".hip4-injected");
  }

  async function loadJsonPre(url, el) {
    if (!el) return;
    try {
      const text = await fetch(url).then(function (r) {
        if (!r.ok) throw new Error(r.statusText);
        return r.text();
      });
      el.textContent = JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      el.textContent = "Failed to load ABI: " + (e && e.message ? e.message : String(e));
    }
  }

  function wireTabs(scope) {
    var tabs = scope.querySelectorAll(".hip4-abi-tab");
    var panels = scope.querySelectorAll(".hip4-abi-panel");
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var v = tab.getAttribute("data-version");
        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
        });
        panels.forEach(function (p) {
          var pv = p.getAttribute("data-version");
          p.hidden = pv !== v;
        });
      });
    });
  }

  function run() {
    var r = root();
    if (!r) return;
    var preV2 = r.querySelector("#hip4-v2-abi-json");
    loadJsonPre("/hip4/HIP4Contest.v2.abi", preV2);
    wireTabs(r);
  }

  function waitAndRun() {
    var n = 0;
    var id = setInterval(function () {
      var r = root();
      if (r && r.querySelector("#hip4-v2-abi-json")) {
        clearInterval(id);
        run();
      }
      if (++n > 400) clearInterval(id);
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitAndRun);
  } else {
    waitAndRun();
  }
})();
