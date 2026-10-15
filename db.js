/* Cantonese Voice-to-Estimate — static data layer.
localStorage-backed, no backend. Voice parsing of Cantonese
transcripts against the contractor's price book. */
"use strict";

/* ---- Seed price book: SAMPLE defaults only.
Labelled in the UI as sample prices the contractor MUST adjust. */
const SAMPLE_ITEMS = [
{ name: "清拆", aliases: ["清拆", "拆"], unit: "項", default_price: 3000},
{ name: "水電安裝", aliases: ["水電", "水電安裝"], unit: "項", default_price: 8000},
{ name: "泥水", aliases: ["泥水"], unit: "項", default_price: 12000},
{ name: "油漆", aliases: ["油漆", "髹油"], unit: "平方呎", default_price: 18},
{ name: "防水工程", aliases: ["防水", "防水工程"], unit: "項", default_price: 4500},
{ name: "地磚鋪設", aliases: ["地磚", "鋪地磚", "地磚鋪設"], unit: "平方呎", default_price: 45},
{ name: "訂造櫃", aliases: ["訂造櫃", "造櫃", "衣櫃"], unit: "呎", default_price: 1200},
{ name: "廚櫃", aliases: ["廚櫃"], unit: "呎", default_price: 1500},
{ name: "鋁窗", aliases: ["鋁窗", "窗"], unit: "隻", default_price: 2800},
{ name: "潔具安裝", aliases: ["潔具", "潔具安裝", "坐廁", "洗手盆"], unit: "項", default_price: 3500},
];

const KNOWN_UNITS = ["平方呎", "呎", "尺", "米", "個", "隻", "項", "套", "日", "間", "房", "廳"];

const DEFAULT_SETTINGS = {
contractor_name: "",
phone: "",
currency: "HKD",
quote_notes: "以上為初步報價，實際價錢以現場度尺後作準。",
};

/* ---- Cantonese number parsing ------------------------------------------- */
const CN_DIGIT = {
"零": 0, "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5,
"六": 6, "七": 7, "八": 8, "九": 9,
};
const CN_UNIT = { "十": 10, "百": 100, "千": 1000, "萬": 10000};

/* Parse a Chinese-numeral string like 三萬五千, 一百二十, 十二, 兩千, 一百五,
廿二 (colloquial twenty), 卅 (colloquial thirty).
Returns a number, or NaN if not parseable. */
function parseChineseNumber(str) {
if (!str) return NaN;
// Normalise colloquial forms before parsing: 廿二 -> 二十二, 卅 -> 三十
str = String(str).replace(/廿/g, "二十").replace(/卅/g, "三十");
if (!/^[零一二三四五六七八九兩十百千萬]+$/.test(str)) return NaN;
let total = 0, section = 0, digit = -1;
const flush = () => {
if (digit >= 0) { section += digit; digit = -1;}
};
for (const ch of str) {
if (ch in CN_DIGIT) {
digit = CN_DIGIT[ch];
} else if (ch === "十" || ch === "百" || ch === "千") {
const v = CN_UNIT[ch];
section += (digit >= 0? digit: 1) * v;
digit = -1;
} else if (ch === "萬") {
flush();
total += (section || 0) * 10000;
section = 0;
}
}
flush();
total += section;
// Colloquial short forms: 一百五 = 150, 兩千八 = 2800, 一萬八 = 18000,
// and the bare spoken forms 千八 = 1800, 百五 = 150, 萬六 = 16000.
if (total > 0 && /[百千萬]$/.test(str) === false) {
let m = str.match(/^(.+?[百千萬])([一二三四五六七八九兩])$/);
if (m) {
const base = parseChineseNumber(m[1]);
const tail = CN_DIGIT[m[2]];
const scale = m[1].endsWith("百") ? 10 : m[1].endsWith("千") ? 100 : 1000;
if (!isNaN(base)) return base + tail * scale;
}
m = str.match(/^([百千萬])([一二三四五六七八九兩])$/);
if (m) {
const scale = m[1] === "百" ? 10 : m[1] === "千" ? 100 : 1000;
return CN_UNIT[m[1]] + CN_DIGIT[m[2]] * scale;
}
}
return total;
}

/* Parse one numeric token (Arabic digits or Chinese numerals). */
function parseNumberToken(tok) {
tok = (tok || "").replace(/,/g, "").trim();
if (!tok) return NaN;
if (/^\d+(\.\d+)?$/.test(tok)) return parseFloat(tok);
return parseChineseNumber(tok);
}

/* ---- Voice parser --------------------------------------------------------
Conservative: only creates a draft row when a price-book item name (or
alias) appears in the clause. Unmatched clauses are returned so the UI
can show them — nothing is silently dropped. */
const VoiceParser = {
/* Find all number tokens in a clause with their context. */
extractNumbers(clause) {
const re = /[0-9零一二三四五六七八九兩十百千萬廿卅]+(?:\.[0-9]+)?/g;
const out = [];
let m;
while ((m = re.exec(clause))!== null) {
const value = parseNumberToken(m[0]);
if (isNaN(value)) continue;
out.push({
value,
text: m[0],
index: m.index,
after: clause.slice(m.index + m[0].length, m.index + m[0].length + 8),
});
}
return out;
},

/* Per-unit price: "每平方呎20蚊", "每呎二十蚊", "20蚊一呎". */
findUnitPrice(clause) {
let m = clause.match(/每.{0,4}?([0-9零一二三四五六七八九兩十百千萬廿卅.,]+)\s*[元蚊塊]/);
if (m) {
const v = parseNumberToken(m[1]);
if (!isNaN(v)) return v;
}
m = clause.match(/([0-9零一二三四五六七八九兩十百千萬廿卅.,]+)\s*[元蚊塊]\s*(一|每)(平方呎|呎|尺|米|個|隻|套|日)/);
if (m) {
const v = parseNumberToken(m[1]);
if (!isNaN(v)) return v;
}
return null;
},

/* Lump-sum price: "總共八千蚊", "8000蚊", "埋單一萬二". */
findLumpSum(clause) {
const m = clause.match(/(?:總共|共計|埋單|一共|合共)?\s*([0-9零一二三四五六七八九兩十百千萬廿卅.,]+)\s*[元蚊塊](?!\s*(一|每)(平方呎|呎|尺|米|個|隻|套|日))/);
if (m) {
const v = parseNumberToken(m[1]);
if (!isNaN(v)) return v;
}
return null;
},

/* Quantity: number directly before a unit word.
Prefers a number spoken against the item's own price-book unit
(e.g. 450平方呎 for 油漆) over other units in the same clause
(e.g. 三間房), since the price will be calculated in the item's unit. */
findQty(clause, itemUnit) {
const allUnits = KNOWN_UNITS.concat(itemUnit? [itemUnit]: [])
.filter((u, i, a) => u && a.indexOf(u) === i)
.sort((a, b) => b.length - a.length);
const ordered = itemUnit
? [itemUnit].concat(allUnits.filter((u) => u!== itemUnit))
: allUnits;
for (const u of ordered) {
const m = clause.match(new RegExp(
"([0-9零一二三四五六七八九兩十百千萬廿卅.,]+)\\s*" + u));
if (m) {
const v = parseNumberToken(m[1]);
if (!isNaN(v) && v > 0) return { qty: v, unit: u};
}
}
return null;
},

/* Parse one clause that contains a matched item. Returns a draft row. */
parseRow(clause, item) {
const unitPrice = this.findUnitPrice(clause);
const qtyHit = this.findQty(clause, item.unit);
const row = {
item_name: item.name,
description: clause.trim(),
qty: null,
unit: item.unit,
unit_price: null,
review: true, // voice-drafted: contractor must confirm
};
if (qtyHit) {
row.qty = qtyHit.qty;
// Normalise spoken unit abbreviation to the price-book unit.
if (item.unit.includes(qtyHit.unit) || qtyHit.unit.includes(item.unit)) {
row.unit = item.unit;
} else {
row.unit = qtyHit.unit;
}
}
if (unitPrice!== null) {
row.unit_price = unitPrice;
if (row.qty === null) row.qty = 1;
} else {
const lump = this.findLumpSum(clause);
if (lump!== null) {
if (row.qty!== null && row.qty > 1) {
row.unit_price = Math.round((lump / row.qty) * 100) / 100;
} else {
row.qty = 1;
row.unit_price = lump;
}
}
}
// qty spoken but no price -> leave blank for the contractor to fill,
// unless the clause has exactly one bare number (e.g. "泥水12000"),
// which is taken as the line price (qty 1) for review.
if (row.qty === null && row.unit_price === null) {
const nums = this.extractNumbers(clause);
if (nums.length === 1) {
row.qty = 1;
row.unit_price = nums[0].value;
}
}
return row;
},

/* Main entry: transcript + price-book items -> { rows, unmatched}.
Speech often splits item and price across pauses ("清拆全屋，總共八千蚊"):
following clauses that carry numbers but no item of their own are merged
in until the row has both qty and price. */
parse(transcript, items) {
const rows = [];
const unmatched = [];
const clauses = (transcript || "")
.split(/[，。、；;．.！!？?\n]+/)
.map((c) => c.trim())
.filter((c) => c.length > 0);
const sorted = [...items].sort(
(a, b) => Math.max(...b.aliases.map((x) => x.length)) -
Math.max(...a.aliases.map((x) => x.length)));
const itemOf = (clause) => {
for (const item of sorted) {
if (item.aliases.some((a) => a && clause.includes(a))) return item;
}
return null;
};
for (let i = 0; i < clauses.length; i++) {
const clause = clauses[i];
const hit = itemOf(clause);
if (!hit) {
unmatched.push(clause);
continue;
}
/* Speech often splits item and price across pauses ("清拆全屋，總共八千蚊",
"鋁窗換六隻，每隻千八蚊"): keep absorbing following clauses that carry
numbers but no item of their own, until the row has both qty and price
(or we reach another item clause). Everything stays review-gated. */
let text = clause;
let row = this.parseRow(text, hit);
while ((row.qty === null || row.unit_price === null) && i + 1 < clauses.length) {
const next = clauses[i + 1];
if (itemOf(next) || this.extractNumbers(next).length === 0) break;
text += "，" + next;
row = this.parseRow(text, hit);
row.description = text.trim();
i++;
}
rows.push(row);
}
return { rows, unmatched};
},
};

/* ---- Data layer ---------------------------------------------------------- */
const DB = {
_read(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw? JSON.parse(raw): fallback;
} catch {
return fallback;
}
},
_write(key, value) {
localStorage.setItem(key, JSON.stringify(value));
},
_nextId(key) {
const n = (parseInt(localStorage.getItem(key) || "0", 10) || 0) + 1;
localStorage.setItem(key, String(n));
return n;
},
today() {
return new Date().toISOString().slice(0, 10);
},
/* UI language for the generated quote text only (localStorage "vea_lang",
default zh). The Cantonese parser, price matching and stored data never
change with the UI language. */
_lang() {
try {
return localStorage.getItem("vea_lang") === "en"? "en": "zh";
} catch {
return "zh";
}
},

_seedItems() {
if (localStorage.getItem("ve_items") === null) {
this._write("ve_items", SAMPLE_ITEMS.map((it, i) => ({
id: i + 1,...it, sample: true,
})));
localStorage.setItem("ve_seq", String(SAMPLE_ITEMS.length));
}
},

// ---- Settings ----------------------------------------------------------
settings() {
const stored = this._read("ve_settings", {});
return {...DEFAULT_SETTINGS,...stored};
},
saveSettings(data) {
const stored = this._read("ve_settings", {});
for (const k of Object.keys(DEFAULT_SETTINGS)) {
if (k in data) stored[k] = data[k];
}
this._write("ve_settings", stored);
},

// ---- Price book ----------------------------------------------------------
listItems() {
this._seedItems();
return this._read("ve_items", []);
},
addItem({ name, unit, default_price, aliases}) {
if (!name ||!name.trim()) throw new Error("項目名稱不能留空");
const list = this.listItems();
const item = {
id: this._nextId("ve_seq"),
name: name.trim(),
aliases: (aliases || "")
.split(/[,，、]/).map((a) => a.trim()).filter(Boolean),
unit: unit || "項",
default_price: parseFloat(default_price) || 0,
sample: false,
};
if (!item.aliases.includes(item.name)) item.aliases.unshift(item.name);
list.push(item);
this._write("ve_items", list);
return item.id;
},
updateItem(id, data) {
const list = this.listItems();
const it = list.find((x) => String(x.id) === String(id));
if (!it) return false;
for (const k of ["name", "unit", "default_price"]) {
if (k in data) it[k] = data[k];
}
if ("aliases" in data) {
it.aliases = String(data.aliases).split(/[,，、]/)
.map((a) => a.trim()).filter(Boolean);
if (!it.aliases.includes(it.name)) it.aliases.unshift(it.name);
}
it.sample = false; // once edited, it is the contractor's own price
this._write("ve_items", list);
return true;
},
deleteItem(id) {
const list = this.listItems().filter((x) => String(x.id)!== String(id));
this._write("ve_items", list);
},

// ---- Estimates -----------------------------------------------------------
newEstimateShell() {
return {
id: null,
client_name: "",
site_address: "",
est_date: this.today(),
rows: [],
discount_pct: 0,
notes: "",
created_at: "",
updated_at: "",
};
},
rowTotal(row) {
const q = parseFloat(row.qty) || 0;
const p = parseFloat(row.unit_price) || 0;
return Math.round(q * p * 100) / 100;
},
totals(est) {
const subtotal = (est.rows || [])
.reduce((s, r) => s + this.rowTotal(r), 0);
const d = Math.min(100, Math.max(0, parseFloat(est.discount_pct) || 0));
const total = Math.round(subtotal * (1 - d / 100) * 100) / 100;
return {
subtotal: Math.round(subtotal * 100) / 100,
discount_pct: d,
total,
};
},
listEstimates(search) {
let list = this._read("ve_estimates", []);
if (search) {
const q = search.toLowerCase();
list = list.filter((e) =>
((e.client_name || "") + " " + (e.site_address || ""))
.toLowerCase().includes(q));
}
return [...list].sort((a, b) =>
(b.updated_at || "").localeCompare(a.updated_at || ""));
},
getEstimate(id) {
return this._read("ve_estimates", []).find(
(e) => String(e.id) === String(id)) || null;
},
saveEstimate(est) {
const list = this._read("ve_estimates", []);
const ts = new Date().toISOString().slice(0, 19);
if (est.id) {
const i = list.findIndex((e) => String(e.id) === String(est.id));
if (i >= 0) {
list[i] = {...est, updated_at: ts};
this._write("ve_estimates", list);
return est.id;
}
}
est.id = this._nextId("ve_eseq");
est.created_at = ts;
est.updated_at = ts;
list.push({...est});
this._write("ve_estimates", list);
return est.id;
},
duplicateEstimate(id) {
const e = this.getEstimate(id);
if (!e) return null;
const copy = JSON.parse(JSON.stringify(e));
copy.id = null;
copy.client_name = (copy.client_name || "") + " (副本)";
copy.rows.forEach((r) => { r.review = false;});
return this.saveEstimate(copy);
},
deleteEstimate(id) {
this._write("ve_estimates",
this._read("ve_estimates", []).filter(
(e) => String(e.id)!== String(id)));
},

// ---- Draft (unsaved work survives refresh) -------------------------------
loadDraft() {
return this._read("ve_draft", null);
},
saveDraft(est) {
this._write("ve_draft", est);
},
clearDraft() {
try { localStorage.removeItem("ve_draft");} catch { /* noop */}
},

// ---- Quote text ----------------------------------------------------------
buildQuoteText(est) {
if (this._lang() === "en") return this.buildQuoteTextEn(est);
const s = this.settings();
const t = this.totals(est);
const lines = [];
lines.push("報價單");
if (s.contractor_name) lines.push(s.contractor_name + (s.phone? " " + s.phone: ""));
lines.push("客戶：" + (est.client_name || "—"));
if (est.site_address) lines.push("地址：" + est.site_address);
lines.push("日期：" + (est.est_date || ""));
lines.push("--------------------------------");
(est.rows || []).forEach((r, i) => {
const rt = this.rowTotal(r);
lines.push((i + 1) + ". " + (r.item_name || "項目") +
" " + (r.qty || 0) + " " + (r.unit || "") +
" @ $" + (r.unit_price === null || r.unit_price === ""? "—": r.unit_price) +
" = $" + rt.toLocaleString("en-HK"));
if (r.description) lines.push(" " + r.description);
});
lines.push("--------------------------------");
lines.push("小計：$" + t.subtotal.toLocaleString("en-HK"));
if (t.discount_pct > 0) lines.push("折扣：" + t.discount_pct + "%");
lines.push("總計：$" + t.total.toLocaleString("en-HK") + " " + (s.currency || "HKD"));
if (est.notes) lines.push("備註：" + est.notes);
else if (s.quote_notes) lines.push("備註：" + s.quote_notes);
return lines.join("\n");
},
/* English rendering of the estimate document. Line-item names come from the
contractor's own typing/speech and stay exactly as stored. */
buildQuoteTextEn(est) {
const s = this.settings();
const t = this.totals(est);
const lines = [];
lines.push("Quotation");
if (s.contractor_name) lines.push(s.contractor_name + (s.phone? " " + s.phone: ""));
lines.push("Client: " + (est.client_name || "—"));
if (est.site_address) lines.push("Site: " + est.site_address);
lines.push("Date: " + (est.est_date || ""));
lines.push("--------------------------------");
(est.rows || []).forEach((r, i) => {
const rt = this.rowTotal(r);
lines.push((i + 1) + ". " + (r.item_name || "Item") +
" " + (r.qty || 0) + " " + (r.unit || "") +
" @ $" + (r.unit_price === null || r.unit_price === ""? "—": r.unit_price) +
" = $" + rt.toLocaleString("en-HK"));
if (r.description) lines.push(" " + r.description);
});
lines.push("--------------------------------");
lines.push("Subtotal: $" + t.subtotal.toLocaleString("en-HK"));
if (t.discount_pct > 0) lines.push("Discount: " + t.discount_pct + "%");
lines.push("Total: $" + t.total.toLocaleString("en-HK") + " " + (s.currency || "HKD"));
if (est.notes) lines.push("Notes: " + est.notes);
else if (s.quote_notes) lines.push("Notes: " + s.quote_notes);
return lines.join("\n");
},
whatsappLink(est) {
return "https://wa.me/?text=" + encodeURIComponent(this.buildQuoteText(est));
},
};

/* Node export for tests (single source, no browser globals at load). */
if (typeof module!== "undefined" && module.exports) {
module.exports = { DB, VoiceParser, SAMPLE_ITEMS, parseChineseNumber, parseNumberToken};
}
