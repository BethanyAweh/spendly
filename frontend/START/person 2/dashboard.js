// dashboard.js (START/person 2/dashboard.js)

// ------- MOCK DATA (replace later) -------
const data = {
  goal: 500,
  saved: 180,

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
// -------------------------------------------------------------

function setText(id, value){
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

// Top pill date
const todayPill = document.getElementById("todayPill");
if (todayPill) {
  todayPill.innerText = new Date().toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric"
  });
}

// Goal KPIs
setText("goalValue", `$${data.goal}`);
setText("savedValue", `$${data.saved}`);

const percent = Math.min(100, (data.saved / data.goal) * 100);
const goalBar = document.getElementById("goalBar");
if (goalBar) goalBar.style.width = `${percent}%`;
setText("goalText", `${percent.toFixed(0)}% Complete`);

const remaining = Math.max(0, data.goal - data.saved);
let status = "Healthy";
let dotClass = "green";
let tip = `You’re $${remaining} away. Try cutting 2 takeout meals this week to speed up savings.`;

if (percent < 35) { status = "Needs Focus"; dotClass = "amber"; tip = `You’re early in the goal. Pause 1 unused subscription to save $10–$20/month.`; }
if (percent < 15) { status = "Off Track"; dotClass = "red"; tip = `Start small: cap takeout/transport and review Spendly every Sunday.`; }

setText("statusText", status);
setText("tipText", `💡 ${tip}`);

// Update paceHint (was missing before)
setText("paceHint", percent >= 35 ? "On Track" : (percent >= 15 ? "Building Momentum" : "Needs Attention"));

const badgeDot = document.querySelector("#goals .badge .dot");
if (badgeDot) {
  badgeDot.classList.remove("green", "amber", "red");
  badgeDot.classList.add(dotClass);
}

/* -------- Insight chips (max 1–2) + positive note -------- */
function buildInsights(){
  const insights = [];

  // Grocery spike example
  const typical = data.baseline.typicalMilkPerMonth;
  const nowMilk = data.baseline.milkThisMonth;
  if (nowMilk >= typical * 2) {
    insights.push({
      tag: "Grocery",
      tone: "Gentle Trend",
      text: `Milk purchases are higher than usual this month (${nowMilk} vs typical ${typical}).`
    });
  }

  // Subscription price increases
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

  // Credit card usage up
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

  // Render max 2 chips
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

  // Positive note (always show)
  const good = document.getElementById("goodNews");
  if (good) {
    good.innerText = `✨ Good news: Consistency beats perfection — you’re building awareness without stress.`;
  }
}
buildInsights();

/* -------- Tables -------- */
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

renderFood();
renderBills();
renderSubs();

/* -------- BAR chart (pink, not blue) -------- */
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
renderSpendingBarChart();

/* -------- Top tabs active highlight -------- */
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

/* -------- OCR Upload (Tesseract.js) -------- */
const receiptInput = document.getElementById("receiptInput");
const ocrStatus = document.getElementById("ocrStatus");
const ocrText = document.getElementById("ocrText");

// demo parser: keyword → category + max amount guess
function demoParseAndUpdate(ocrRaw){
  const raw = ocrRaw || "";
  const text = raw.toLowerCase();

  const amounts = (raw.match(/\$?\d+\.\d{2}/g) || [])
    .map(a => parseFloat(a.replace("$","")))
    .filter(n => !Number.isNaN(n));

  const totalGuess = amounts.length ? Math.max(...amounts) : null;

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

  const hit = map.find(m => text.includes(m.key));

  if (hit && totalGuess) {
    data.spending[hit.cat] = (data.spending[hit.cat] || 0) + totalGuess;
    renderSpendingBarChart();
    buildInsights();
  }
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

      demoParseAndUpdate(textOut);
    } catch (err) {
      if (ocrStatus) ocrStatus.innerText = "OCR Failed — Try A Clearer Image (Demo).";
      if (ocrText) ocrText.innerText = "";
    }
  });
}
