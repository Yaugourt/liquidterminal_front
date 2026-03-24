/**
 * Scan V1 + V2 contest contracts for ContestCreated logs (chunked RPC) and render pool / merkle status.
 */
(function () {
  var cfg = window.HIP4_CONFIG;
  if (!cfg || !cfg.rpc) return;

  var CHUNK = 1000;
  var MAX_CHUNKS = 80;
  var BETWEEN_MS = 120;

  function sleep(ms) {
    return new Promise(function (res) {
      setTimeout(res, ms);
    });
  }

  function padUint(n) {
    var h = BigInt(n).toString(16);
    return "0".repeat(64 - h.length) + h;
  }

  function contestIdFromCreatedLog(log) {
    if (log.topics && log.topics.length >= 2) {
      return BigInt(log.topics[1]);
    }
    var d = (log.data && log.data.slice(2)) || "";
    if (d.length < 64) return null;
    return BigInt("0x" + d.slice(0, 64));
  }

  async function rpc(method, params) {
    var res = await fetch(cfg.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }),
    });
    var j = await res.json();
    if (j.error) throw new Error(j.error.message || "RPC error");
    return j.result;
  }

  async function latestBlockHex() {
    var h = await rpc("eth_blockNumber", []);
    return parseInt(h, 16);
  }

  async function getLogsChunk(address, fromBlock, toBlock) {
    return rpc("eth_getLogs", [
      {
        address: address,
        topics: [cfg.contestCreatedTopic],
        fromBlock: "0x" + fromBlock.toString(16),
        toBlock: "0x" + toBlock.toString(16),
      },
    ]);
  }

  async function ethCall(to, data) {
    return rpc("eth_call", [{ to: to, data: data }, "latest"]);
  }

  function decodeMerkleRoot(result) {
    if (!result || result.length < 66) return null;
    var v = BigInt(result);
    return v === 0n ? null : result;
  }

  function decodePoolWei(result) {
    if (!result || result === "0x") return 0n;
    return BigInt(result);
  }

  function formatHype(wei) {
    var w = Number(wei) / 1e18;
    if (!Number.isFinite(w)) return "—";
    return w.toFixed(4) + " HYPE";
  }

  async function collectContestIds(address) {
    var latest = await latestBlockHex();
    var ids = new Set();
    var end = latest;
    var chunks = 0;
    while (chunks < MAX_CHUNKS && end >= 0) {
      var start = Math.max(0, end - CHUNK + 1);
      var logs;
      try {
        logs = await getLogsChunk(address, start, end);
      } catch (e) {
        console.warn("HIP4 markets-scan getLogs", start, end, e);
        break;
      }
      for (var i = 0; i < logs.length; i++) {
        var id = contestIdFromCreatedLog(logs[i]);
        if (id != null) ids.add(id.toString());
      }
      end = start - 1;
      chunks++;
      await sleep(BETWEEN_MS);
    }
    return ids;
  }

  async function enrichRow(address, getPoolSel, contestIdStr) {
    var idHex = padUint(contestIdStr);
    var pool = decodePoolWei(await ethCall(address, getPoolSel + idHex));
    var root = decodeMerkleRoot(await ethCall(address, cfg.merkleRootSelector + idHex));
    var status;
    if (root) status = "Merkle root published";
    else if (pool > 0n) status = "Active (no root yet)";
    else status = "Created / empty pool";
    return { id: contestIdStr, pool, root: !!root, status: status };
  }

  async function scanDeployment(key) {
    var d = cfg.contracts[key];
    if (!d) return { key: key, rows: [], error: "Unknown deployment" };
    try {
      var ids = await collectContestIds(d.address);
      var sorted = Array.from(ids).sort(function (a, b) {
        return Number(BigInt(a) - BigInt(b));
      });
      var rows = [];
      for (var j = 0; j < sorted.length; j++) {
        rows.push(await enrichRow(d.address, d.getPoolSelector, sorted[j]));
        await sleep(BETWEEN_MS);
      }
      rows.sort(function (a, b) {
        return Number(BigInt(b.pool) - BigInt(a.pool));
      });
      return { key: key, label: d.label, address: d.address, rows: rows, error: null };
    } catch (e) {
      return {
        key: key,
        label: d.label,
        address: d.address,
        rows: [],
        error: e && e.message ? e.message : String(e),
      };
    }
  }

  function renderSection(tbody, title, result) {
    if (!tbody) return;
    tbody.innerHTML = "";
    var head = document.createElement("tr");
    head.innerHTML =
      '<td colspan="3" style="font-size:11px;color:var(--text-muted);padding:10px 8px;">' +
      "<strong>" +
      title +
      "</strong> · " +
      '<span class="mono" style="color:var(--brand-accent)">' +
      result.address +
      "</span>" +
      (result.error
        ? ' · <span style="color:var(--brand-error)">RPC: ' +
          result.error +
          "</span>"
        : "") +
      "</td>";
    tbody.appendChild(head);

    if (!result.rows.length && !result.error) {
      var empty = document.createElement("tr");
      empty.innerHTML =
        '<td colspan="3" style="font-size:12px;color:var(--text-muted);padding:12px 8px;">No contests found in the scanned block window (or RPC rate-limited). Try again later.</td>';
      tbody.appendChild(empty);
      return;
    }

    for (var i = 0; i < result.rows.length; i++) {
      var r = result.rows[i];
      if (r.pool === 0n && !r.root) continue;
      var tr = document.createElement("tr");
      var badge =
        r.root
          ? '<span class="header-badge badge-gold">Merkle root published</span>'
          : '<span class="header-badge badge-muted">' + r.status + "</span>";
      tr.innerHTML =
        "<td>#" +
        r.id +
        '</td><td style="color:var(--brand-gold);font-weight:700;">' +
        formatHype(r.pool) +
        "</td><td>" +
        badge +
        "</td>";
      tbody.appendChild(tr);
    }

    if (tbody.children.length <= 1) {
      var none = document.createElement("tr");
      none.innerHTML =
        '<td colspan="3" style="font-size:12px;color:var(--text-muted);padding:12px 8px;">No contests with pool &gt; 0 or published root in scan window.</td>';
      tbody.appendChild(none);
    }
  }

  async function run() {
    var v1body = document.getElementById("hip4-onchain-contests-v1");
    var v2body = document.getElementById("hip4-onchain-contests-v2");
    if (!v1body && !v2body) return;

    var r1 = await scanDeployment("v1");
    var r2 = await scanDeployment("v2");
    renderSection(v1body, r1.label + " — on-chain contests", r1);
    renderSection(v2body, r2.label + " — on-chain contests", r2);

    var foot = document.getElementById("hip4-markets-scan-footnote");
    if (foot) {
      foot.textContent =
        "Live scan: ContestCreated logs over the last ~" +
        CHUNK * MAX_CHUNKS +
        " blocks per contract (chunk size " +
        CHUNK +
        ", HyperEVM RPC). Same owner (genesis): " +
        cfg.sameOwner +
        ".";
    }
  }

  function waitAndRun() {
    var n = 0;
    var id = setInterval(function () {
      if (document.getElementById("hip4-onchain-contests-v1")) {
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
