/* ===================================================================
   NORMALIZATION — exact port of the formula used in
   Indicator_Formula_Register.xlsx, Worked Example (Live) sheet.
   Anchors map to the four Section 6 bands: 0-24 / 25-49 / 50-74 / 75-100
   =================================================================== */
function normalize(raw, anchors, direction) {
  const [a0, a24, a49, a74, a100] = anchors;
  if (direction === "asc") {
    if (raw <= a0) return 0;
    if (raw <= a24) return ((raw - a0) / (a24 - a0)) * 24;
    if (raw <= a49) return 24 + ((raw - a24) / (a49 - a24)) * 25;
    if (raw <= a74) return 49 + ((raw - a49) / (a74 - a49)) * 25;
    if (raw <= a100) return 74 + ((raw - a74) / (a100 - a74)) * 26;
    return 100;
  } else {
    if (raw >= a0) return 0;
    if (raw >= a24) return ((a0 - raw) / (a0 - a24)) * 24;
    if (raw >= a49) return 24 + ((a24 - raw) / (a24 - a49)) * 25;
    if (raw >= a74) return 49 + ((a49 - raw) / (a49 - a74)) * 25;
    if (raw >= a100) return 74 + ((a74 - raw) / (a74 - a100)) * 26;
    return 100;
  }
}



/* deep-clone seed into working state so "reset" can restore originals */
let PROJECTS = JSON.parse(JSON.stringify(PROJECTS_SEED));
let selectedId = PROJECTS[0].id;

function classify(score) {
  if (score < 25) return { label: "Low", color: "var(--low)" };
  if (score < 50) return { label: "Moderate", color: "var(--moderate)" };
  if (score < 75) return { label: "Elevated", color: "var(--elevated)" };
  return { label: "Critical", color: "var(--critical)" };
}

function computeProject(p) {
  const indicatorResults = {};
  INDICATORS.forEach((ind) => {
    const raw = ind.raw(p);
    const score = normalize(raw, ind.anchors, ind.dir);
    indicatorResults[ind.id] = { raw, score };
  });
  const domainScores = {};
  DOMAINS.forEach((d) => {
    const scores = d.indicators.map((id) => indicatorResults[id].score);
    domainScores[d.name] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  let composite = 0;
  DOMAINS.forEach((d) => (composite += domainScores[d.name] * d.weight));
  let driver = DOMAINS[0].name;
  DOMAINS.forEach((d) => {
    if (domainScores[d.name] > domainScores[driver]) driver = d.name;
  });
  return { indicatorResults, domainScores, composite, driver };
}

function fmtVal(val, unit) {
  if (unit === "%") return (val * 100).toFixed(1) + "%";
  if (unit === "days") return Math.round(val) + " d";
  return val.toFixed(1);
}

function renderPortfolio() {
  const list = document.getElementById("portfolio-list");
  const withScores = PROJECTS.map((p) => ({ p, r: computeProject(p) }));
  withScores.sort((a, b) => b.r.composite - a.r.composite);
  document.getElementById("tb-count").textContent = PROJECTS.length;
  list.innerHTML = "";
  withScores.forEach(({ p, r }) => {
    const cls = classify(r.composite);
    const row = document.createElement("div");
    row.className = "proj-row" + (p.id === selectedId ? " active" : "");
    row.innerHTML = `
      <div class="tick" style="background:${cls.color}"></div>
      <div class="meta">
        <div class="pname">${p.name}</div>
        <div class="pid">${p.id}</div>
      </div>
      <div class="score" style="color:${cls.color}">${r.composite.toFixed(1)}</div>
    `;
    row.addEventListener("click", () => {
      selectedId = p.id;
      renderAll();
    });
    list.appendChild(row);
  });
}

function renderDetail() {
  const p = PROJECTS.find((x) => x.id === selectedId);
  const r = computeProject(p);
  const cls = classify(r.composite);

  document.getElementById("p-arche").textContent = p.archetype;
  document.getElementById("p-name").textContent = p.name;
  document.getElementById("p-id").textContent =
    p.id + " · Reporting Period 2026-08 · Synthetic data";
  document.getElementById("p-score").textContent = r.composite.toFixed(1);
  document.getElementById("p-score").style.color = cls.color;
  const badge = document.getElementById("p-badge");
  badge.textContent = cls.label;
  badge.style.background = cls.color;

  const driverScore = r.domainScores[r.driver];
  const driverCls = classify(driverScore);
  document.getElementById("p-driver").innerHTML =
    `<b>Primary driver: ${r.driver}</b> (${driverScore.toFixed(1)}, ${driverCls.label}). ` +
    `The composite score blends all seven weighted domains — a single domain can run Elevated or Critical ` +
    `while the composite stays lower, which is why this framework reports the driver alongside the composite ` +
    `rather than the composite alone.`;

  // domain bars
  const grid = document.getElementById("domain-grid");
  grid.innerHTML = "";
  DOMAINS.forEach((d) => {
    const score = r.domainScores[d.name];
    const c = classify(score);
    const row = document.createElement("div");
    row.className = "domain-row";
    row.innerHTML = `
      <div><div class="dname">${d.name}</div><div class="dweight">weight ${(d.weight * 100).toFixed(0)}%</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${score}%; background:${c.color}"></div></div>
      <div class="dscore" style="color:${c.color}">${score.toFixed(1)}</div>
      <div class="dscore" style="color:var(--ink-soft); font-size:10.5px;">${c.label}</div>
    `;
    grid.appendChild(row);
  });

  // editable inputs, grouped by domain
  const inputsBody = document.getElementById("inputs-body");
  inputsBody.innerHTML = "";
  const groups = {};
  const groupOrder = [];
  Object.keys(FIELD_LABELS).forEach(function (key) {
    const parts = FIELD_LABELS[key];
    const domain = parts[0],
      label = parts[1],
      unit = parts[2];
    if (!groups[domain]) {
      groups[domain] = [];
      groupOrder.push(domain);
    }
    groups[domain].push({ key: key, label: label, unit: unit });
  });
  groupOrder.forEach(function (domain) {
    const fields = groups[domain];
    const head = document.createElement("div");
    head.className = "domain-sub-head";
    head.textContent = domain;
    inputsBody.appendChild(head);
    const grid2 = document.createElement("div");
    grid2.className = "input-grid";
    fields.forEach((f) => {
      const wrap = document.createElement("div");
      wrap.className = "field";
      const isDate = f.unit === "date";
      wrap.innerHTML = `<label>${f.label} ${f.unit !== "date" ? "(" + f.unit + ")" : ""}</label>
        <input type="${isDate ? "date" : "number"}" data-key="${f.key}" value="${p[f.key]}">`;
      grid2.appendChild(wrap);
      wrap.querySelector("input").addEventListener("input", (e) => {
        const v = isDate ? e.target.value : parseFloat(e.target.value);
        if (isDate ? v : !isNaN(v)) {
          p[f.key] = v;
          renderPortfolio();
          renderDetail();
        }
      });
    });
    inputsBody.appendChild(grid2);
  });

  // formula reference, grouped by domain, current values shown
  const fBody = document.getElementById("formula-body");
  fBody.innerHTML = "";
  DOMAINS.forEach((d) => {
    const det = document.createElement("details");
    const domainScore = r.domainScores[d.name];
    const c = classify(domainScore);
    det.innerHTML = `<summary><span>${d.name} — domain score ${domainScore.toFixed(1)} (${c.label})</span><span class="chev">+</span></summary>`;
    const body = document.createElement("div");
    body.className = "formula-body";
    let rowsHtml = `<table><tr><th>ID</th><th>Indicator</th><th>Formula</th><th>Current Value</th><th>Normalized Score</th></tr>`;
    d.indicators.forEach((id) => {
      const ind = INDICATORS.find((x) => x.id === id);
      const res = r.indicatorResults[id];
      rowsHtml += `<tr>
        <td class="mono">${ind.id} <span class="tag ${ind.source}">${ind.source}</span></td>
        <td>${ind.name}</td>
        <td class="mono formula-text" style="margin:0;">${ind.formula}</td>
        <td class="mono">${fmtVal(res.raw, ind.unit)}</td>
        <td class="mono">${res.score.toFixed(1)}</td>
      </tr>`;
    });
    rowsHtml += `</table>`;
    body.innerHTML = rowsHtml;
    det.appendChild(body);
    fBody.appendChild(det);
  });
}

function renderAll() {
  renderPortfolio();
  renderDetail();
}

document.getElementById("reset-btn").addEventListener("click", () => {
  const idx = PROJECTS.findIndex((p) => p.id === selectedId);
  PROJECTS[idx] = JSON.parse(JSON.stringify(PROJECTS_SEED[idx]));
  renderAll();
});

renderAll();
