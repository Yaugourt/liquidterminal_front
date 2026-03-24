/**
 * HyperCore asset table + price grid rendering.
 * Add a row to HIP4_ASSETS or an entry to HIP4_PRICES to extend.
 */
(function () {
  const HIP4_ASSETS = [
    { coin: "#90", outcome: 9, outcomeName: "100m dash", side: 0, sideName: "Hypurr", mid: 0.674 },
    { coin: "#91", outcome: 9, outcomeName: "100m dash", side: 1, sideName: "Usain Bolt", mid: 0.326 },
    { coin: "#100", outcome: 10, outcomeName: "Akami", side: 0, sideName: "Yes", mid: 0.468 },
    { coin: "#101", outcome: 10, outcomeName: "Akami", side: 1, sideName: "No", mid: 0.532 },
    { coin: "#110", outcome: 11, outcomeName: "Canned Tuna", side: 0, sideName: "Yes", mid: 0.648 },
    { coin: "#111", outcome: 11, outcomeName: "Canned Tuna", side: 1, sideName: "No", mid: 0.352 },
    { coin: "#120", outcome: 12, outcomeName: "Otoro", side: 0, sideName: "Yes", mid: 0.351 },
    { coin: "#121", outcome: 12, outcomeName: "Otoro", side: 1, sideName: "No", mid: 0.649 },
    { coin: "#19520", outcome: 1952, outcomeName: "BTC>68k", side: 0, sideName: "Yes", mid: 0.7 },
    { coin: "#19521", outcome: 1952, outcomeName: "BTC>68k", side: 1, sideName: "No", mid: 0.3 },
  ];

  const HIP4_PRICES = {
    "#90": 0.6615,
    "#91": 0.3385,
    "#100": 0.46848,
    "#101": 0.53152,
    "#110": 0.64841,
    "#111": 0.35159,
    "#120": 0.350625,
    "#121": 0.649375,
    "#130": 0.5,
    "#131": 0.5,
    "#19520": 0.75,
    "#19521": 0.25,
    "#20000": 0.5,
    "#20001": 0.5,
  };

  function sideClass(name) {
    if (name === "Yes") return "side-yes";
    if (name === "No") return "side-no";
    return "side-custom";
  }

  const tbody = document.getElementById("asset-table");
  if (tbody) {
    for (const a of HIP4_ASSETS) {
      const idx = 100_000_000 + parseInt(a.coin.slice(1), 10);
      const color = a.mid >= 0.5 ? "#00ff88" : "#ef4444";
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td class="mono" style="color:var(--brand-accent);font-weight:700">${a.coin}</td>
      <td style="font-size:12px;">#${a.outcome} ${a.outcomeName}</td>
      <td><span class="market-side ${sideClass(a.sideName)}">${a.sideName}</span></td>
      <td class="mono" style="font-size:11px;color:var(--brand-gold)">${idx}</td>
      <td style="color:${color};font-weight:700">${(a.mid * 100).toFixed(1)}%</td>`;
      tbody.appendChild(tr);
    }
  }

  const grid = document.getElementById("prices-grid");
  if (grid) {
    for (const [ticker, val] of Object.entries(HIP4_PRICES)) {
      const pct = (val * 100).toFixed(1);
      const color = val >= 0.5 ? "#00ff88" : "#ef4444";
      const cell = document.createElement("div");
      cell.className = "price-cell";
      cell.innerHTML = `
      <div class="price-ticker">${ticker}</div>
      <div class="price-val" style="color:${color}">${pct}%</div>
      <div class="price-bar"><div class="price-fill" style="width:${pct}%;background:${color}"></div></div>
    `;
      grid.appendChild(cell);
    }
  }
})();
