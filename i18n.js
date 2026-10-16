/* i18n — EN / 繁中 language switch for the voice estimate app.
   UI language only: speech recognition stays yue-Hant-HK, the Cantonese
   number parser in db.js is untouched, and user data is never translated.
   Persisted per browser. */
"use strict";

const I18N = {
  zh: {
    title: "語音報價 · Voice Estimate",
    brand: "🎙️ 語音報價",
    tab_quote: "報價單", tab_pricebook: "價目表",
    tab_history: "歷史", tab_settings: "設定",
    quote_title: "開報價單", quote_title_sub: "New estimate",
    lbl_client: "客戶名稱 Client", ph_client: "例如：陳生",
    lbl_site: "工程地址 Site", ph_site: "例如：太古城xx座xx室",
    lbl_date: "日期 Date",
    lbl_discount: "折扣 % Discount",
    voice_title: "🎙️ 語音輸入", voice_title_sub: "Voice dictation",
    btn_record: "● 開始講嘢",
    rec_recording: "錄緊…撳停",
    listening: "聽緊：", speak_now: "講嘢啦…",
    voice_error: "語音出錯：{err} — 可以手打代替。",
    unknown: "未知",
    voice_unsupported: "⚠️ 呢個瀏覽器唔支援語音輸入（例如 Safari）。唔緊要 — 下面照樣可以手打，功能一樣齊。",
    ph_dictation: "講完會自動轉做文字…亦可以直接喺度打字",
    btn_parse: "⚙️ 由文字產生項目", btn_clear: "清空",
    items_title: "報價項目", items_title_sub: "Line items",
    btn_add_row: "+ 手動加項目",
    row_hint: "⚠️ 有 {n} 項未填單價",
    th_item: "項目", th_desc: "說明", th_qty: "數量", th_unit: "單位",
    th_unit_price: "單價 (HKD)", th_subtotal: "小計",
    total_subtotal: "小計 Subtotal",
    total_discount: "折扣 Discount",
    total_total: "總計 Total",
    quote_text_title: "報價內容", quote_text_title_sub: "Quote text",
    btn_save_est: "💾 儲存報價", btn_copy: "📋 複製文字",
    btn_wa: "💬 WhatsApp 傳送", btn_new_est: "🆕 新報價",
    lbl_notes: "備註 Notes", ph_notes: "例如：不包清拆後垃圾車費",
    pb_title: "價目表", pb_title_sub: "Price book",
    sample_bold: "樣本價錢：",
    sample_note: "下面標住「樣本」嘅價錢只係方便試用嘅例子，唔係真實市價。請改成你自己嘅價錢先好用嚟報價。",
    sample_note_sub: "Sample prices are placeholders — set your own before quoting.",
    btn_new_item: "+ 新增項目",
    th_alias: "別名 (語音配對用)", th_default_price: "預設單價 (HKD)",
    hist_title: "歷史報價", hist_title_sub: "History",
    ph_hist_search: "搜尋客戶 / 地址…", btn_search: "搜尋",
    th_client: "客戶", th_address: "地址", th_date: "日期", th_total: "總計",
    settings_title: "設定", settings_title_sub: "Settings",
    lbl_contractor: "公司 / 師傅名稱 Contractor name",
    ph_name: "例如：昌哥裝修",
    lbl_phone: "電話 Phone", ph_phone: "例如：91234567",
    lbl_default_notes: "預設報價備註 Default quote notes",
    settings_note: "會自動加喺每張報價單尾。",
    btn_save_settings: "儲存設定", saved: "已儲存 ✓",
    dlg_new_item: "新增項目", dlg_edit_item: "修改項目",
    lbl_item_name: "項目名稱", ph_item_name: "例如：水電安裝",
    lbl_unit: "單位", ph_unit: "平方呎 / 呎 / 個 / 項…",
    lbl_default_price: "預設單價 (HKD)",
    lbl_aliases: "別名 (語音配對用，以逗號分隔)",
    ph_aliases: "例如：水電,水電安裝",
    btn_save: "儲存", btn_cancel: "取消",
    pill_review: "待確認", pill_sample: "樣本價",
    ph_item: "項目", ph_desc: "說明…", ph_price: "待填",
    empty_rows: "未有項目 — 用語音講，或者撳「手動加項目」。",
    nothing_to_parse: "冇嘢可以分析。",
    cand_title: "⚙️ 識別到 {n} 項（請核對再加入）",
    cand_none: "未能配對價目表項目 — 內容保留喺上面文字框。",
    unmatched_title: "未配對內容",
    unmatched_sub: "已保留喺文字框，無嘢唔見咗",
    lbl_qty_in: "數量：", lbl_price_in: "單價：",
    no_price: "未識別到價錢",
    btn_accept: "✓ 加入報價", btn_discard: "捨棄",
    done_all: "已處理晒。可繼續講或者手打。",
    alert_no_rows: "未有報價項目，唔使儲存。",
    saved_est: "已儲存報價單 #{id}",
    copied: "已複製報價文字",
    copy_fail: "自動複製失敗 — 已選取文字，請手動複製。",
    confirm_new: "開新報價單？而家呢張未儲存嘅內容會唔見。",
    confirm_del_item: "刪除呢個項目？",
    confirm_del_est: "刪除呢張報價單？",
    dup_est: "已複製為報價單 #{id}",
    alert_item_name: "項目名稱不能留空。",
    empty_history: "未有儲存嘅報價單。",
    btn_open: "開嚟睇", btn_dup: "複製", btn_del: "刪",
    btn_edit_item: "改", btn_del_item: "刪",
    backup_title: "備份與還原", backup_title_sub: "Backup & restore",
    backup_note: "備份包含價目表、歷史報價、設定同未儲存嘅草稿，匯出成一個 JSON 檔；匯入會覆寫現有資料。",
    btn_export: "⬇ 匯出備份", btn_import: "⬆ 匯入備份",
    exported: "已匯出備份 ✓", imported: "已匯入備份 ✓",
    confirm_import: "匯入備份會覆寫而家所有資料，確定要繼續？",
    import_bad_file: "讀唔到呢個檔案 — 請選擇有效嘅 JSON 備份檔。",
    import_invalid: "備份檔格式唔啱 — 冇匯入任何資料。",
    import_write_fail: "寫入儲存空間失敗 — 匯入未完成。",
    storage_warn: "⚠️ 儲存空間已滿 — 而家嘅更改儲存唔到，重新整理後會唔見。",
  },
  en: {
    title: "Voice Estimate",
    brand: "🎙️ Voice Estimate",
    tab_quote: "Quote", tab_pricebook: "Price book",
    tab_history: "History", tab_settings: "Settings",
    quote_title: "New estimate", quote_title_sub: "",
    lbl_client: "Client name", ph_client: "e.g. Mr Chan",
    lbl_site: "Site address", ph_site: "e.g. Taikoo Shing, Block X, Flat Y",
    lbl_date: "Date",
    lbl_discount: "Discount %",
    voice_title: "🎙️ Voice input", voice_title_sub: "",
    btn_record: "● Start speaking",
    rec_recording: "Recording… tap to stop",
    listening: "Listening: ", speak_now: "Speak now…",
    voice_error: "Voice error: {err} — you can type instead.",
    unknown: "unknown",
    voice_unsupported: "⚠️ This browser doesn't support voice input (e.g. Safari). No problem — you can type below, everything works the same.",
    ph_dictation: "Speech becomes text automatically… or type here directly",
    btn_parse: "⚙️ Generate items from text", btn_clear: "Clear",
    items_title: "Line items", items_title_sub: "",
    btn_add_row: "+ Add item manually",
    row_hint: "⚠️ {n} item(s) missing a unit price",
    th_item: "Item", th_desc: "Details", th_qty: "Qty", th_unit: "Unit",
    th_unit_price: "Unit price (HKD)", th_subtotal: "Subtotal",
    total_subtotal: "Subtotal",
    total_discount: "Discount",
    total_total: "Total",
    quote_text_title: "Quote text", quote_text_title_sub: "",
    btn_save_est: "💾 Save quote", btn_copy: "📋 Copy text",
    btn_wa: "💬 Send via WhatsApp", btn_new_est: "🆕 New quote",
    lbl_notes: "Notes", ph_notes: "e.g. excludes debris disposal",
    pb_title: "Price book", pb_title_sub: "",
    sample_bold: "Sample prices:",
    sample_note: "Prices marked “sample” are placeholders for trying out — not real market prices. Set your own prices before quoting.",
    sample_note_sub: "",
    btn_new_item: "+ New item",
    th_alias: "Aliases (voice matching)", th_default_price: "Default price (HKD)",
    hist_title: "Quote history", hist_title_sub: "",
    ph_hist_search: "Search client / address…", btn_search: "Search",
    th_client: "Client", th_address: "Address", th_date: "Date", th_total: "Total",
    settings_title: "Settings", settings_title_sub: "",
    lbl_contractor: "Contractor name",
    ph_name: "e.g. contractor name",
    lbl_phone: "Phone", ph_phone: "e.g. 91234567",
    lbl_default_notes: "Default quote notes",
    settings_note: "Added to the end of every quote.",
    btn_save_settings: "Save settings", saved: "Saved ✓",
    dlg_new_item: "New item", dlg_edit_item: "Edit item",
    lbl_item_name: "Item name", ph_item_name: "e.g. plumbing & electrical",
    lbl_unit: "Unit", ph_unit: "sq ft / ft / pc / lot…",
    lbl_default_price: "Default unit price (HKD)",
    lbl_aliases: "Aliases (voice matching, comma-separated)",
    ph_aliases: "e.g. 水電,水電安裝",
    btn_save: "Save", btn_cancel: "Cancel",
    pill_review: "Review", pill_sample: "Sample",
    ph_item: "Item", ph_desc: "Details…", ph_price: "To fill",
    empty_rows: "No items yet — speak, or tap “+ Add item manually”.",
    nothing_to_parse: "Nothing to analyse.",
    cand_title: "⚙️ Found {n} item(s) — check before adding",
    cand_none: "No price-book match — your text is kept in the box above.",
    unmatched_title: "Unmatched text",
    unmatched_sub: "kept in the text box — nothing lost",
    lbl_qty_in: "Qty: ", lbl_price_in: "Price: ",
    no_price: "No price detected",
    btn_accept: "✓ Add to quote", btn_discard: "Discard",
    done_all: "All done. Speak more or type.",
    alert_no_rows: "No items — nothing to save.",
    saved_est: "Quote #{id} saved",
    copied: "Quote text copied",
    copy_fail: "Auto-copy failed — text selected, please copy manually.",
    confirm_new: "Start a new quote? Unsaved content will be lost.",
    confirm_del_item: "Delete this item?",
    confirm_del_est: "Delete this quote?",
    dup_est: "Duplicated as quote #{id}",
    alert_item_name: "Please enter an item name.",
    empty_history: "No saved quotes yet.",
    btn_open: "Open", btn_dup: "Duplicate", btn_del: "Delete",
    btn_edit_item: "Edit", btn_del_item: "Delete",
    backup_title: "Backup & restore", backup_title_sub: "",
    backup_note: "Exports the price book, quote history, settings and the unsaved draft as one JSON file; importing overwrites current data.",
    btn_export: "⬇ Export backup", btn_import: "⬆ Import backup",
    exported: "Backup exported ✓", imported: "Backup imported ✓",
    confirm_import: "Importing a backup will overwrite all current data. Continue?",
    import_bad_file: "Couldn't read that file — please choose a valid JSON backup.",
    import_invalid: "Backup file is invalid — nothing was imported.",
    import_write_fail: "Couldn't write to storage — import incomplete.",
    storage_warn: "⚠️ Storage is full — changes can't be saved and will be lost on refresh.",
  },
};

let LANG = "zh";
try {
  LANG = localStorage.getItem("vea_lang") === "en" ? "en" : "zh";
} catch { /* storage unavailable: keep default */ }

function t(key) {
  return (I18N[LANG] && I18N[LANG][key]) || I18N.zh[key] || key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll("[data-lang-btn]").forEach((b) =>
    b.classList.toggle("active", b.dataset.langBtn === LANG));
  document.documentElement.lang = LANG === "zh" ? "zh-Hant-HK" : "en";
  document.title = t("title");
}

function setLang(next) {
  if (next !== "zh" && next !== "en") return;
  LANG = next;
  try { localStorage.setItem("vea_lang", LANG); } catch { /* ignore */ }
  applyI18n();
  if (typeof renderAll === "function") renderAll();
  if (typeof window.onLangChange === "function") window.onLangChange();
}

document.querySelectorAll("[data-lang-btn]").forEach((b) =>
  b.addEventListener("click", () => setLang(b.dataset.langBtn)));
