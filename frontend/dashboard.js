// dashboard.js (FULL — foundational design preserved)

// -------------------- STATE --------------------
const data = {
  // Manual inputs (user editable anytime)
  goal: Number(localStorage.getItem("spendly_goal") || 500),
  manualSaved: Number(localStorage.getItem("spendly_manualSaved") || 180),

  // Auto “saved/net” calculated from statement-style OCR (adds over time)
  // (user can still edit manualSaved; auto stays separate)
  autoNetFromStatements: Number(localStorage.getItem("spendly_autoNet") || 0),

  spending: {
    Grocery: 120,
    Takeout: 90,
    Subscriptions: 45,
    Transport: 35
  },

  baseline: {
    typicalMilkPerMonth: 2,
    milkThisMonth: 6,

    subscriptionBaseline: { Netflix: 16, Spotify: 10 },
    subscriptionCurrent:  { Netflix: 17, Spotify: 11 },

    creditCardSpendLastMonth: 320,
    creditCardSpendThisMonth: 460
  },

  food: [
    { item: "Milk", qty: 1, expires: "Jan 12", status: "Use Soon" },
    { item: "Spinach", qty: 1, expires: "Jan 11", status: "Use Soon" },
    { item: "Rice", qty: 1, expires: "Feb 20", status: "Good" }
  ],

  bills: [
    { name: "Credit Card", due: "Jan 15", amount: 120, status: "Due Soon" },
    { name: "Phone Plan", due: "Jan 18", amount: 55, status: "Upcoming" }
  ],

  subs: [
    { name: "Netflix", cost: 17, lastUsed: "Jan 02", status: "Active" },
    { name: "Spotify", cost: 11, lastUsed: "Dec 20", status: "Unused" }
  ]
};

// -------------------- HELPERS --------------------
function setText(id, value){
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function money(n){
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0";
  // avoid .00 if you don’t want cents; keep as dollars:
  return `$${Math.round(v)}`;
}

function totalSaved(){
  // If autoNet goes negative, allow it to reduce total (more honest)
  // but never show below 0 visually:
  return Math.max(0, data.manualSaved + data.autoNetFromStatements);
}

function persist(){
  localStorage.setItem("spendly_goal", String(data.goal || 0));
  localStorage.setItem("spendly_manualSaved", String(data.manualSaved || 0));
  localStorage.setItem("spendly_autoNet", String(data.autoNetFromStatements || 0));
}

// -------------------- TOP PILL DATE --------------------
const todayPill = document.getElementById("todayPill");
if (todayPill) {
  todayPill.innerText = new Date().toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric"
  });
}

// -------------------- GOALS RENDER (FIXES % BUG) --------------------
function renderGoals(){
  // KPIs
  setText("goalValue", money(data.goal));
  setText("savedValue", money(totalSaved()));

  // Progress
  const goalNum = Number(data.goal) || 0;
  const savedNum = totalSaved();
  const percent = goalNum > 0 ? Math.min(100, (savedNum / goalNum) * 100) : 0;

  const goalBar = document.getElementById("goalBar");
  if (goalBar) goalBar.style.width = `${percent}%`;
  setText("goalText", `${percent.toFixed(0)}% Complete`);

  // Status + tip
  const remaining = Math.max(0, goalNum - savedNum);
  let status = "Healthy";
  let dotClass = "green";
  let tip = `You’re ${money(remaining)} away. Try cutting 2 takeout meals this week to speed up savings.`;

  if (percent < 35) {
    status = "Needs Focus";
    dotClass = "amber";
    tip = `You’re early in the goal. Pause 1 unused subscription to save $10–$20/month.`;
  }
  if (percent < 15) {
    status = "Off Track";
    dotClass = "red";
    tip = `Start small: cap takeout/transport and review Spendly every Sunday.`;
  }

  setText("statusText", status);
  setText("tipText", `💡 ${tip}`);

  // paceHint
  setText("paceHint", percent >= 35 ? "On Track" : (percent >= 15 ? "Building Momentum" : "Needs Attention"));

  // Dot color
  const badgeDot = document.querySelector("#goals .badge .dot");
  if (badgeDot) {
    badgeDot.classList.remove("green", "amber", "red");
    badgeDot.classList.add(dotClass);
  }
}

// -------------------- GOAL INPUTS (MANUAL + EDITABLE) --------------------
const goalInput = document.getElementById("goalInput");
const savedInput = document.getElementById("savedInput");

if (goalInput){
  goalInput.value = String(data.goal || 0);
  goalInput.addEventListener("input", () => {
    const v = parseFloat(goalInput.value);
    data.goal = Number.isFinite(v) ? v : 0;
    persist();
    renderGoals();
  });
}

if (savedInput){
  savedInput.value = String(data.manualSaved || 0);
  savedInput.addEventListener("input", () => {
    const v = parseFloat(savedInput.value);
    data.manualSaved = Number.isFinite(v) ? v : 0;
    persist();
    renderGoals();
  });
}

// -------------------- INSIGHTS (UNCHANGED) --------------------
function buildInsights(){
  const insights = [];

  const typical = data.baseline.typicalMilkPerMonth;
  const nowMilk = data.baseline.milkThisMonth;
  if (nowMilk >= typical * 2) {
    insights.push({
      tag: "Grocery",
      tone: "Gentle Trend",
      text: `Milk purchases are higher than usual this month (${nowMilk} vs typical ${typical}).`
    });
  }

  const base = data.baseline.subscriptionBaseline;
  const cur = data.baseline.subscriptionCurrent;
  Object.keys(cur).forEach(name => {
    if (typeof base[name] === "number" && cur[name] > base[name]) {
      insights.push({
        tag: "Subscriptions",
        tone: "Sneaky Change",
        text: `${name} increased slightly this month ($${base[name]} → $${cur[name]}).`
      });
    }
  });

  const last = data.baseline.creditCardSpendLastMonth;
  const thisM = data.baseline.creditCardSpendThisMonth;
  const change = (thisM - last) / Math.max(1, last);
  if (change >= 0.25) {
    insights.push({
      tag: "Bills",
      tone: "Usage Pattern",
      text: `Credit card spending is higher than usual this month ($${last} → $${thisM}).`
    });
  }

  const row = document.getElementById("insightRow");
  if (row) {
    row.innerHTML = "";
    const topTwo = insights.slice(0, 2);

    topTwo.forEach(i => {
      const div = document.createElement("div");
      div.className = "insightChip";
      div.innerHTML = `
        <div class="insightMeta">
          <div class="insightTag">${i.tag}</div>
          <div class="insightTone">${i.tone}</div>
        </div>
        <div class="insightText">${i.text}</div>
      `;
      row.appendChild(div);
    });

    if (insights.length === 0) {
      const div = document.createElement("div");
      div.className = "insightChip";
      div.innerHTML = `
        <div class="insightMeta">
          <div class="insightTag">All Good</div>
          <div class="insightTone">Steady Month</div>
        </div>
        <div class="insightText">No unusual spikes detected — keep going.</div>
      `;
      row.appendChild(div);
    }
  }

  const good = document.getElementById("goodNews");
  if (good) {
    good.innerText = `✨ Good news: Consistency beats perfection — you’re building awareness without stress.`;
  }
}

// -------------------- TABLES (UNCHANGED) --------------------
function renderFood(){
  const foodTable = document.getElementById("foodTable");
  if (!foodTable) return;
  foodTable.innerHTML = "";

  data.food.forEach(f => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.item}</td>
      <td>${f.qty}</td>
      <td>${f.expires}</td>
      <td>
        <span class="badge">
          <span class="dot ${f.status === "Good" ? "green" : "amber"}"></span>
          ${f.status}
        </span>
      </td>
    `;
    foodTable.appendChild(tr);
  });
}

function renderBills(){
  const billsTable = document.getElementById("billsTable");
  if (!billsTable) return;
  billsTable.innerHTML = "";

  data.bills.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.name}</td>
      <td>${b.due}</td>
      <td>$${b.amount}</td>
      <td>
        <span class="badge">
          <span class="dot ${b.status === "Due Soon" ? "amber" : "green"}"></span>
          ${b.status}
        </span>
      </td>
    `;
    billsTable.appendChild(tr);
  });
}

function renderSubs(){
  const subsTable = document.getElementById("subsTable");
  if (!subsTable) return;
  subsTable.innerHTML = "";

  data.subs.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>$${s.cost}/mo</td>
      <td>${s.lastUsed}</td>
      <td>
        <span class="badge">
          <span class="dot ${s.status === "Unused" ? "red" : "green"}"></span>
          ${s.status}
        </span>
      </td>
    `;
    subsTable.appendChild(tr);
  });
}

// -------------------- BAR CHART (UNCHANGED) --------------------
let spendingChartInstance = null;

function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderSpendingBarChart(){
  const chartEl = document.getElementById("spendingChart");
  if (!chartEl) return;

  const ctx = chartEl.getContext("2d");
  if (spendingChartInstance) spendingChartInstance.destroy();

  const bar = cssVar("--bar") || "rgba(179, 92, 132, 0.55)";
  const barBorder = cssVar("--barBorder") || "rgba(179, 92, 132, 0.90)";

  spendingChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data.spending),
      datasets: [{
        label: "Spend ($)",
        data: Object.values(data.spending),
        backgroundColor: bar,
        borderColor: barBorder,
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#3b0a22" }, grid: { display: false } },
        y: { ticks: { color: "#3b0a22" }, grid: { color: "rgba(255,192,203,0.25)" } }
      }
    }
  });
}

// -------------------- NAV HIGHLIGHT (UNCHANGED) --------------------
const sectionLinks = document.querySelectorAll(".sectionLink");
const sectionIds = ["goals","food","bills","subs"];
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

if (sectionLinks.length && sections.length){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        sectionLinks.forEach(a => a.classList.remove("active"));
        const active = document.querySelector(`.sectionLink[data-target="${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.55 });

  sections.forEach(sec => observer.observe(sec));
}

// -------------------- OCR UPLOAD (RECEIPT OR BANK STATEMENT) --------------------
const receiptInput = document.getElementById("receiptInput");
const ocrStatus = document.getElementById("ocrStatus");
const ocrText = document.getElementById("ocrText");

function extractAmountsFromLine(line){
  const m = (line.match(/\$?\d+\.\d{2}/g) || [])
    .map(a => parseFloat(a.replace("$","")))
    .filter(n => Number.isFinite(n));
  return m;
}

function updateFoodFromOCR(rawLower){
  // Only add pantry items if grocery-like keywords appear
  const groceryItems = [
    { key: "milk", item: "Milk", days: 3 },
    { key: "spinach", item: "Spinach", days: 2 },
    { key: "bread", item: "Bread", days: 5 },
    { key: "eggs", item: "Eggs", days: 7 },
    { key: "rice", item: "Rice", days: 30 }
  ];

  const now = new Date();
  function addDays(d){
    const x = new Date(now.getTime());
    x.setDate(x.getDate() + d);
    return x.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  }

  let added = false;
  groceryItems.forEach(g => {
    if (rawLower.includes(g.key)) {
      // prevent duplicates stacking too fast
      const already = data.food.some(f => f.item.toLowerCase() === g.item.toLowerCase());
      if (!already) {
        const expires = addDays(g.days);
        const status = g.days <= 3 ? "Use Soon" : "Good";
        data.food.push({ item: g.item, qty: 1, expires, status });
        added = true;
      }
    }
  });

  if (added) renderFood();
}

function parseBankStatementAndReceipt(raw){
  const rawText = raw || "";
  const lower = rawText.toLowerCase();
  const lines = rawText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  // Category keyword map (your original foundation)
  const map = [
    { key: "uber", cat: "Transport" },
    { key: "lyft", cat: "Transport" },

    { key: "doordash", cat: "Takeout" },
    { key: "ubereats", cat: "Takeout" },
    { key: "restaurant", cat: "Takeout" },

    { key: "netflix", cat: "Subscriptions" },
    { key: "spotify", cat: "Subscriptions" },

    { key: "walmart", cat: "Grocery" },
    { key: "grocery", cat: "Grocery" },
    { key: "milk", cat: "Grocery" }
  ];

  // “Deposit-ish” keywords for statement savings net (simple but useful)
  const depositKeys = ["deposit", "payroll", "salary", "etransfer", "transfer in", "credit"];
  const debitKeys = ["debit", "payment", "purchase", "withdrawal", "transfer out"];

  let totalDeposits = 0;
  let totalDebits = 0;

  // Line-based parse (works better for statements)
  lines.forEach(line => {
    const l = line.toLowerCase();
    const amts = extractAmountsFromLine(line);
    if (!amts.length) return;

    const lineAmt = Math.max(...amts);

    // spending by vendor/category
    const hit = map.find(m => l.includes(m.key));
    if (hit) {
      data.spending[hit.cat] = (data.spending[hit.cat] || 0) + lineAmt;
      return;
    }

    // deposit vs debit signals
    if (depositKeys.some(k => l.includes(k))) {
      totalDeposits += lineAmt;
      return;
    }
    if (debitKeys.some(k => l.includes(k))) {
      totalDebits += lineAmt;
      return;
    }
  });

  // Fallback: if nothing line-matched but OCR has a big “total”, use global max w/ keyword hit
  const allAmounts = (rawText.match(/\$?\d+\.\d{2}/g) || [])
    .map(a => parseFloat(a.replace("$","")))
    .filter(n => Number.isFinite(n));
  const totalGuess = allAmounts.length ? Math.max(...allAmounts) : null;

  if (totalGuess){
    const hit = map.find(m => lower.includes(m.key));
    if (hit) {
      data.spending[hit.cat] = (data.spending[hit.cat] || 0) + totalGuess;
    }
  }

  // Auto net savings from statements: deposits - debits (accumulating)
  // If it’s just a receipt, deposits likely 0, debits/merchant lines update spending instead.
  const net = totalDeposits - totalDebits;
  if (Number.isFinite(net) && net !== 0) {
    data.autoNetFromStatements += net;
  }

  // Persist + re-render
  persist();
  renderSpendingBarChart();
  buildInsights();
  updateFoodFromOCR(lower);
  renderGoals();
}

if (receiptInput){
  receiptInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (ocrStatus) ocrStatus.innerText = "Reading File…";
    if (ocrText) ocrText.innerText = "";

    try {
      if (ocrStatus) ocrStatus.innerText = "Running OCR…";

      const result = await Tesseract.recognize(file, "eng", {
        logger: m => {
          if (ocrStatus && m.status === "recognizing text") {
            ocrStatus.innerText = `OCR: ${Math.round(m.progress * 100)}%`;
          }
        }
      });

      const textOut = result?.data?.text || "";
      if (ocrStatus) ocrStatus.innerText = "OCR Complete ✅";
      if (ocrText) ocrText.innerText = textOut.trim() || "(No Text Detected)";

      // MAIN UPDATE PATH (receipt OR bank statement)
      parseBankStatementAndReceipt(textOut);

    } catch (err) {
      if (ocrStatus) ocrStatus.innerText = "OCR Failed — Try A Clearer Image (Demo).";
      if (ocrText) ocrText.innerText = "";
    }
  });
}

// -------------------- INIT RENDER --------------------
renderGoals();
buildInsights();
renderFood();
renderBills();
renderSubs();
renderSpendingBarChart();
