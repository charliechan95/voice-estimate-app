/* Cantonese Voice-to-Estimate — static UI. Renders from db.js, no backend. */
"use strict";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---- Tabs --------------------------------------------------------------- */
document.querySelectorAll("[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((b) =>
      b.classList.toggle("active", b === btn));
    document.querySelectorAll(".view").forEach((v) =>
      v.classList.toggle("active", v.id === "view-" + btn.dataset.tab));
    if (btn.dataset.tab === "history") renderHistory();
    if (btn.dataset.tab === "pricebook") renderItems();
  });
});

/* ---- Working estimate ---------------------------------------------------- */
let cur = DB.loadDraft() || DB.newEstimateShell();

function syncHeaderFromInputs() {
  cur.client_name = document.getElementById("q-client").value;
  cur.site_address = document.getElementById("q-site").value;
  cur.est_date = document.getElementById("q-date").value;
  cur.discount_pct = document.getElementById("q-discount").value;
  cur.notes = document.getElementById("q-notes").value;
}

function persistDraft() {
  syncHeaderFromInputs();
  DB.saveDraft(cur);
}

function renderAll() {
  syncHeaderFromInputs();
  renderQuoteRows();
  const t = DB.totals(cur);
  document.getElementById("t-sub").textContent = "$" + t.subtotal.toLocaleString("en-HK");
  document.getElementById("t-disc").textContent = t.discount_pct + "%";
  document.getElementById("t-total").textContent = "$" + t.total.toLocaleString("en-HK");
  document.getElementById("quote-preview").textContent = DB.buildQuoteText(cur);
  const missing = cur.rows.filter((r) =>
    r.unit_price === null || r.unit_price === "" || isNaN(parseFloat(r.unit_price)));
  document.getElementById("row-hint").textContent =
    missing.length ? "⚠️ 有 " + missing.length + " 項未填單價" : "";
  persistDraft();
}

function renderQuoteRows() {
  const tb = document.getElementById("quote-rows");
  tb.innerHTML = cur.rows.length ? cur.rows.map((r, i) => {
    const rt = DB.rowTotal(r);
    const needPrice = r.unit_price === null || r.unit_price === "" ||
      isNaN(parseFloat(r.unit_price));
    return `<tr>
      <td><input class="name-input" data-i="${i}" value="${esc(r.item_name || "")}"
           placeholder="項目" style="width:6.5em">
        ${r.review ? '<div><span class="pill pill-review">待確認</span></div>' : ""}</td>
      <td><input class="desc-input" data-i="${i}" value="${esc(r.description || "")}"
           placeholder="說明…"></td>
      <td><input class="qty-input" data-i="${i}" type="number" min="0" step="0.01"
           value="${r.qty === null ? "" : esc(r.qty)}"></td>
      <td><input class="unit-input" data-i="${i}" value="${esc(r.unit || "")}"
           style="width:4.5em"></td>
      <td><input class="price-input ${needPrice ? "needs-fill" : ""}" data-i="${i}"
           type="number" min="0" step="0.01"
           value="${r.unit_price === null ? "" : esc(r.unit_price)}"
           placeholder="待填"></td>
      <td>$${rt.toLocaleString("en-HK")}</td>
      <td><div class="row-actions">
        <button data-delrow="${i}">✕</button>
      </div></td>
    </tr>`;
  }).join("")
    : `<tr><td colspan="7" class="muted">未有項目 — 用語音講，或者撳「手動加項目」。</td></tr>`;
}

/* Row editing via delegation (rows are re-rendered). */
document.getElementById("quote-rows").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (isNaN(i) || !cur.rows[i]) return;
  const r = cur.rows[i];
  if (e.target.classList.contains("qty-input")) {
    r.qty = e.target.value === "" ? null : parseFloat(e.target.value);
  } else if (e.target.classList.contains("price-input")) {
    r.unit_price = e.target.value === "" ? null : parseFloat(e.target.value);
    r.review = false;
  } else if (e.target.classList.contains("unit-input")) {
    r.unit = e.target.value;
  } else if (e.target.classList.contains("name-input")) {
    r.item_name = e.target.value;
  } else if (e.target.classList.contains("desc-input")) {
    r.description = e.target.value;
  }
  renderAll();
});
document.getElementById("quote-rows").addEventListener("click", (e) => {
  const i = e.target.dataset.delrow;
  if (i === undefined) return;
  cur.rows.splice(parseInt(i, 10), 1);
  renderAll();
});
["q-client", "q-site", "q-date", "q-discount", "q-notes"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderAll);
});

document.getElementById("btn-add-row").addEventListener("click", () => {
  cur.rows.push({
    item_name: "", description: "", qty: 1, unit: "項",
    unit_price: null, review: false,
  });
  renderAll();
  // Focus the new row's item-name box for immediate typing.
  const tb = document.getElementById("quote-rows");
  const last = tb.querySelector("tr:last-child .name-input");
  if (last) last.focus();
});

/* ---- Voice dictation ------------------------------------------------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recording = false;

if (!SR) {
  document.getElementById("voice-unsupported").style.display = "";
  document.getElementById("btn-record").disabled = true;
} else {
  const btn = document.getElementById("btn-record");
  const status = document.getElementById("rec-status");
  btn.addEventListener("click", () => {
    if (recording) { rec.stop(); return; }
    rec = new SR();
    rec.lang = document.getElementById("v-lang").value;
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript;
        else interim += ev.results[i][0].transcript;
      }
      status.textContent = interim ? "聽緊：" + interim : "";
      if (finalText) {
        const box = document.getElementById("dictation");
        box.value = (box.value ? box.value + "，" : "") + finalText.trim();
        finalText = "";
        persistDraft();
        runParse(true);
      }
    };
    rec.onend = () => {
      recording = false;
      btn.innerHTML = "● 開始講嘢";
      status.innerHTML = "";
    };
    rec.onerror = (ev) => {
      status.textContent = "語音出錯：" + (ev.error || "未知") + " — 可以手打代替。";
    };
    rec.start();
    recording = true;
    btn.innerHTML = '<span class="rec-dot"></span>錄緊…撳停';
    status.textContent = "講嘢啦…";
  });
}

document.getElementById("btn-clear-dict").addEventListener("click", () => {
  document.getElementById("dictation").value = "";
  document.getElementById("parse-results").innerHTML = "";
  persistDraft();
});

document.getElementById("btn-parse").addEventListener("click", () => runParse(false));

/* Parse the dictation box; show accept/discard candidates + unmatched text. */
function runParse(auto) {
  const text = document.getElementById("dictation").value;
  const items = DB.listItems();
  const { rows, unmatched } = VoiceParser.parse(text, items);
  if (!rows.length && !unmatched.length) {
    document.getElementById("parse-results").innerHTML =
      auto ? "" : `<p class="muted">冇嘢可以分析。</p>`;
    window._candidates = [];
    window._unmatched = [];
    return;
  }
  window._candidates = rows;
  window._unmatched = unmatched;
  renderCandidates();
}

/* Render the current candidate list (accept/discard re-renders, no re-parse). */
function renderCandidates() {
  const box = document.getElementById("parse-results");
  const rows = window._candidates || [];
  const unmatched = window._unmatched || [];
  box.innerHTML =
    (rows.length ? `<h3>⚙️ 識別到 ${rows.length} 項（請核對再加入）</h3>` +
      rows.map((r, i) => {
        const needs = r.unit_price === null;
        return `<div class="candidate">
          <div><strong>${esc(r.item_name)}</strong>
            <span class="pill pill-review">待確認</span></div>
          <div class="muted">${esc(r.description)}</div>
          <div>數量：${r.qty === null ? "—" : esc(r.qty)} ${esc(r.unit || "")}
           　單價：${needs ? '<span class="pill pill-review">未識別到價錢</span>'
                           : "$" + esc(r.unit_price)}</div>
          <div class="row-actions" style="margin-top:0.4rem">
            <button data-accept="${i}" class="primary">✓ 加入報價</button>
            <button data-discard="${i}">捨棄</button>
          </div>
        </div>`;
      }).join("") : `<p class="muted">未能配對價目表項目 — 內容保留喺上面文字框。</p>`) +
    (unmatched.length ? `<h3>未配對內容 <span class="muted">(已保留喺文字框，無嘢唔見咗)</span></h3>` +
      unmatched.map((u) => `<div class="unmatched">${esc(u)}</div>`).join("") : "");
}

document.getElementById("parse-results").addEventListener("click", (e) => {
  const a = e.target.dataset.accept, d = e.target.dataset.discard;
  if (a === undefined && d === undefined) return;
  const i = parseInt(a !== undefined ? a : d, 10);
  const rows = window._candidates || [];
  if (a !== undefined && rows[i]) {
    cur.rows.push({ ...rows[i], review: false });
    renderAll();
  }
  rows.splice(i, 1);
  if (rows.length) renderCandidates();
  else document.getElementById("parse-results").innerHTML =
    `<p class="muted">已處理晒。可繼續講或者手打。</p>`;
});

/* ---- Save / output ---------------------------------------------------------- */
document.getElementById("btn-save-est").addEventListener("click", () => {
  syncHeaderFromInputs();
  if (!cur.rows.length) { alert("未有報價項目，唔使儲存。"); return; }
  const id = DB.saveEstimate(cur);
  cur.id = id;
  DB.clearDraft();
  persistDraft();
  alert("已儲存報價單 #" + id);
  renderHistory();
});

document.getElementById("btn-copy").addEventListener("click", async () => {
  syncHeaderFromInputs();
  const text = DB.buildQuoteText(cur);
  try {
    await navigator.clipboard.writeText(text);
    alert("已複製報價文字");
  } catch {
    // Fallback: select the preview for manual copy.
    const r = document.createRange();
    r.selectNode(document.getElementById("quote-preview"));
    const sel = getSelection();
    sel.removeAllRanges(); sel.addRange(r);
    alert("自動複製失敗 — 已選取文字，請手動複製。");
  }
});

document.getElementById("btn-wa").addEventListener("click", () => {
  syncHeaderFromInputs();
  window.open(DB.whatsappLink(cur), "_blank");
});

document.getElementById("btn-new-est").addEventListener("click", () => {
  if (cur.rows.length && !confirm("開新報價單？而家呢張未儲存嘅內容會唔見。")) return;
  cur = DB.newEstimateShell();
  document.getElementById("dictation").value = "";
  document.getElementById("parse-results").innerHTML = "";
  DB.clearDraft();
  loadHeaderInputs();
  renderAll();
});

function loadHeaderInputs() {
  document.getElementById("q-client").value = cur.client_name || "";
  document.getElementById("q-site").value = cur.site_address || "";
  document.getElementById("q-date").value = cur.est_date || DB.today();
  document.getElementById("q-discount").value = cur.discount_pct || 0;
  document.getElementById("q-notes").value = cur.notes || "";
}

/* ---- Price book --------------------------------------------------------------- */
let editingItemId = null;

function renderItems() {
  const list = DB.listItems();
  document.getElementById("item-rows").innerHTML = list.map((it) => `
    <tr>
      <td><strong>${esc(it.name)}</strong>
        ${it.sample ? '<div><span class="pill pill-sample">樣本價</span></div>' : ""}</td>
      <td class="muted">${esc((it.aliases || []).join("、"))}</td>
      <td>${esc(it.unit)}</td>
      <td>$${Number(it.default_price || 0).toLocaleString("en-HK")}</td>
      <td><div class="row-actions">
        <button data-edititem="${it.id}">改</button>
        <button data-delitem="${it.id}">刪</button>
      </div></td>
    </tr>`).join("");
}

document.getElementById("item-rows").addEventListener("click", (e) => {
  const ed = e.target.dataset.edititem, del = e.target.dataset.delitem;
  if (ed !== undefined) {
    const it = DB.listItems().find((x) => String(x.id) === String(ed));
    if (!it) return;
    editingItemId = it.id;
    document.getElementById("dlg-item-title").textContent = "修改項目";
    const f = document.getElementById("frm-item");
    f.name.value = it.name; f.unit.value = it.unit;
    f.default_price.value = it.default_price;
    f.aliases.value = (it.aliases || []).join(",");
    document.getElementById("dlg-item").showModal();
  } else if (del !== undefined) {
    if (confirm("刪除呢個項目？")) { DB.deleteItem(del); renderItems(); }
  }
});

document.getElementById("btn-new-item").addEventListener("click", () => {
  editingItemId = null;
  document.getElementById("dlg-item-title").textContent = "新增項目";
  document.getElementById("frm-item").reset();
  document.getElementById("dlg-item").showModal();
});
document.getElementById("btn-cancel-item").addEventListener("click", () => {
  document.getElementById("dlg-item").close();
});
document.getElementById("frm-item").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value.trim(),
    unit: f.unit.value.trim() || "項",
    default_price: parseFloat(f.default_price.value) || 0,
    aliases: f.aliases.value,
  };
  try {
    if (editingItemId) DB.updateItem(editingItemId, data);
    else DB.addItem(data);
    document.getElementById("dlg-item").close();
    renderItems();
  } catch (err) {
    alert(err.message);
  }
});

/* ---- History ------------------------------------------------------------------ */
let histQ = "";
document.getElementById("h-apply").addEventListener("click", () => {
  histQ = document.getElementById("h-q").value;
  renderHistory();
});

function renderHistory() {
  const list = DB.listEstimates(histQ);
  document.getElementById("hist-rows").innerHTML = list.length
    ? list.map((e) => {
        const t = DB.totals(e);
        return `<tr>
          <td><strong>${esc(e.client_name || "—")}</strong></td>
          <td class="muted">${esc(e.site_address || "")}</td>
          <td>${esc(e.est_date || "")}</td>
          <td>$${t.total.toLocaleString("en-HK")}</td>
          <td><div class="row-actions">
            <button data-openest="${e.id}">開嚟睇</button>
            <button data-dupest="${e.id}">複製</button>
            <button data-delest="${e.id}">刪</button>
          </div></td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="5" class="muted">未有儲存嘅報價單。</td></tr>`;
}

document.getElementById("hist-rows").addEventListener("click", (e) => {
  const open = e.target.dataset.openest,
        dup = e.target.dataset.dupest,
        del = e.target.dataset.delest;
  if (open !== undefined) {
    const est = DB.getEstimate(open);
    if (!est) return;
    cur = JSON.parse(JSON.stringify(est));
    DB.saveDraft(cur);
    loadHeaderInputs();
    renderAll();
    document.querySelector('[data-tab="quote"]').click();
  } else if (dup !== undefined) {
    const id = DB.duplicateEstimate(dup);
    renderHistory();
    alert("已複製為報價單 #" + id);
  } else if (del !== undefined) {
    if (confirm("刪除呢張報價單？")) { DB.deleteEstimate(del); renderHistory(); }
  }
});

/* ---- Settings ----------------------------------------------------------------- */
function loadSettings() {
  const s = DB.settings();
  document.getElementById("s-name").value = s.contractor_name || "";
  document.getElementById("s-phone").value = s.phone || "";
  document.getElementById("s-notes").value = s.quote_notes || "";
}
document.getElementById("frm-settings").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  DB.saveSettings({
    contractor_name: f.get("contractor_name"),
    phone: f.get("phone"),
    quote_notes: f.get("quote_notes"),
  });
  const done = document.getElementById("settings-saved");
  done.textContent = "已儲存 ✓";
  setTimeout(() => { done.textContent = ""; }, 2000);
  renderAll();
});

/* ---- Init ---------------------------------------------------------------------- */
loadHeaderInputs();
loadSettings();
renderAll();
renderItems();
renderHistory();
