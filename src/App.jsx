import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LIME = "#b8ff57";
const LIME_DIM = "#8ed43c";
const BLACK = "#0a0a0a";
const DARK = "#111111";
const CARD = "#181818";
const BORDER = "#2a2a2a";
const MUTED = "#555555";
const WHITE = "#ffffff";
const GOLD = "#fbbf24";
const RED_BAD = "#f87171";
const BLUE = "#38bdf8";

// ─── MATH ─────────────────────────────────────────────────────────────────────
const toNum = (v) => parseFloat(v) || 0;
const hasVal = (v) => v !== "" && v !== null && v !== undefined && !isNaN(parseFloat(v));
const calcLSI = (inv, uninv) => {
  if (!hasVal(inv) || !hasVal(uninv) || toNum(uninv) === 0) return null;
  return ((toNum(inv) / toNum(uninv)) * 100).toFixed(1);
};
const calcTimedLSI = (inv, uninv) => {
  if (!hasVal(inv) || !hasVal(uninv) || toNum(inv) === 0) return null;
  return ((toNum(uninv) / toNum(inv)) * 100).toFixed(1);
};
const calcDiff = (a, b) => {
  if (!hasVal(a) || !hasVal(b)) return null;
  return (toNum(a) - toNum(b)).toFixed(1);
};
const calcTorqueNm = (forceLbs, tibCm) => {
  if (!hasVal(forceLbs) || !hasVal(tibCm)) return null;
  return (toNum(forceLbs) * 4.44822 * (toNum(tibCm) / 100)).toFixed(1);
};
const calcNorm = (nm, bwLbs) => {
  if (!nm || !hasVal(bwLbs) || toNum(bwLbs) === 0) return null;
  return (toNum(nm) / (toNum(bwLbs) * 0.453592)).toFixed(2);
};

// Hop helpers — convert ft+in to total inches, average 3 trials
const feetInToIn = (ft, inch) => {
  const f = toNum(ft), i = toNum(inch);
  if (f === 0 && i === 0) return null;
  return f * 12 + i;
};
const avgTrials = (trials) => {
  const vals = trials.map(t => feetInToIn(t.ft, t.in)).filter(v => v !== null && v > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};
const avgTimedTrials = (trials) => {
  const vals = trials.map(t => toNum(t.sec)).filter(v => v > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// Y-Balance: composite = (ant + pm + pl) / (limbLen * 3) * 100
// Each direction pct = reach / limbLen * 100
const calcYBalance = (ant, pm, pl, limbLen) => {
  if (!hasVal(limbLen) || toNum(limbLen) === 0) return null;
  const ll = toNum(limbLen);
  const composite = (toNum(ant) + toNum(pm) + toNum(pl)) / (ll * 3) * 100;
  return composite.toFixed(1);
};
const calcYDir = (reach, limbLen) => {
  if (!hasVal(reach) || !hasVal(limbLen) || toNum(limbLen) === 0) return null;
  return ((toNum(reach) / toNum(limbLen)) * 100).toFixed(1);
};

const lsiColor = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return MUTED;
  if (n >= 90) return LIME;
  if (n >= 80) return GOLD;
  return RED_BAD;
};
const yBalColor = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return MUTED;
  return n >= 90 ? LIME : RED_BAD;
};
const chgColor = (nv, ov, higher = true) => {
  const n = parseFloat(nv), o = parseFloat(ov);
  if (isNaN(n) || isNaN(o)) return MUTED;
  if (Math.abs(n - o) < 0.05) return GOLD;
  return (n > o) === higher ? LIME : RED_BAD;
};
const chgArrow = (nv, ov, higher = true) => {
  const n = parseFloat(nv), o = parseFloat(ov);
  if (isNaN(n) || isNaN(o)) return "—";
  if (Math.abs(n - o) < 0.05) return "=";
  return (n > o) === higher ? "▲" : "▼";
};
const fmt = (v, dec = 1) => hasVal(v) ? parseFloat(v).toFixed(dec) : null;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inp = {
  background: "#1c1c1c", border: "1px solid #2e2e2e", borderRadius: 6,
  padding: "8px 12px", color: WHITE, fontSize: 13, width: "100%",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl = {
  display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
  color: MUTED, textTransform: "uppercase", marginBottom: 4,
};
const calcBox = {
  background: "#0f0f0f", border: `1px solid ${LIME}33`, borderRadius: 6,
  padding: "8px 12px", color: LIME, fontSize: 13, fontFamily: "monospace", textAlign: "center",
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Card({ title, accent, children, id }) {
  return (
    <div id={id} style={{
      background: CARD, border: `1px solid ${accent ? LIME + "44" : BORDER}`,
      borderRadius: 12, marginBottom: 20, overflow: "hidden",
      boxShadow: accent ? `0 0 24px ${LIME}18` : "0 2px 12px rgba(0,0,0,0.4)"
    }}>
      <div style={{ padding: "12px 20px", background: accent ? `linear-gradient(90deg,${LIME}18,transparent)` : "#161616", borderBottom: `1px solid ${accent ? LIME + "33" : BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: accent ? LIME : "#444" }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", color: accent ? LIME : "#888", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
function R2({ children, mb = 12 }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: mb }}>{children}</div>;
}
function R3({ children, mb = 12 }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: mb }}>{children}</div>;
}
function R4({ children, mb = 12 }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: mb }}>{children}</div>;
}
function Field({ label, value, onChange, type = "number", step = "0.1", placeholder = "—", unit, readOnly }) {
  return (
    <div>
      <label style={lbl}>{label}{unit ? ` (${unit})` : ""}</label>
      <input style={{ ...inp, ...(readOnly ? { color: LIME, background: "#0f0f0f", borderColor: LIME + "33", cursor: "default" } : {}) }}
        type={readOnly ? "text" : type} step={step} placeholder={placeholder}
        value={value} readOnly={readOnly}
        onChange={readOnly ? undefined : e => onChange(e.target.value)} />
    </div>
  );
}
function StatBar({ stats }) {
  return (
    <div style={{ background: "#0f0f0f", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 20px", display: "flex", gap: 28, flexWrap: "wrap", marginTop: 8 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: s.color || LIME, fontFamily: "monospace" }}>{s.value || "—"}</div>
        </div>
      ))}
    </div>
  );
}
function SideToggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Left", "Right"].map(s => (
        <button key={s} onClick={() => onChange(s)} style={{
          padding: "8px 24px", borderRadius: 8, fontSize: 12, fontWeight: 800,
          cursor: "pointer", background: value === s ? LIME : "transparent",
          border: `2px solid ${value === s ? LIME : BORDER}`,
          color: value === s ? BLACK : MUTED
        }}>{s}</button>
      ))}
    </div>
  );
}

// ─── VALD CARD ────────────────────────────────────────────────────────────────
function ValdCard({ title, id, fields, values, onChange, highlight }) {
  return (
    <Card title={title} id={id}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Enter values directly from the Vald ForceDecks report.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={lbl}>{f.label}{f.unit ? ` (${f.unit})` : ""}</label>
            {f.type === "select" ? (
              <select style={inp} value={values[f.key] || ""} onChange={e => onChange(f.key, e.target.value)}>
                <option value="">—</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input style={inp} type="number" step={f.step || "0.1"} placeholder="—"
                value={values[f.key] || ""} onChange={e => onChange(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      {highlight && highlight(values)}
    </Card>
  );
}

// ─── RULE-BASED COMPARISON PARAGRAPH ─────────────────────────────────────────
function buildCompareParagraph(rows, inv, wks, graft) {
  const improved = [], regressed = [], unchanged = [], noData = [];

  rows.forEach(row => {
    const oldVal = row.oldVal, cur = row.cur;
    if (!oldVal || !cur || row.h === null) return;
    const n = parseFloat(cur), o = parseFloat(oldVal);
    if (isNaN(n) || isNaN(o)) return;
    const diff = Math.abs(n - o);
    if (diff < 0.05) { unchanged.push(row); return; }
    const imp = row.h ? n > o : n < o;
    if (imp) improved.push({ ...row, delta: (n - o).toFixed(1) });
    else regressed.push({ ...row, delta: (n - o).toFixed(1) });
  });

  const ptDesc = `Patient is currently ${wks ? wks + " weeks post-op" : "status post"} ACL reconstruction${graft ? ` with a ${graft} graft` : ""}`;
  const parts = [];

  parts.push(`${ptDesc}, ${inv} side involved.`);

  if (improved.length > 0) {
    const highlights = improved.slice(0, 3).map(r => {
      const label = r.label.replace(/ \(%\)| \(lbs\)| \(°\)| \(sec\)/g, "");
      const dir = r.h ? "improved" : "decreased";
      return `${label} ${dir} from ${r.oldVal}${r.u || ""} to ${r.cur}${r.u || ""}`;
    });
    parts.push(`Notable improvements since last assessment include: ${highlights.join("; ")}.`);
  }

  if (regressed.length > 0) {
    const highlights = regressed.slice(0, 2).map(r => {
      const label = r.label.replace(/ \(%\)| \(lbs\)| \(°\)| \(sec\)/g, "");
      return `${label} (${r.oldVal}${r.u || ""} → ${r.cur}${r.u || ""})`;
    });
    parts.push(`Areas of decline noted: ${highlights.join("; ")}.`);
  }

  // Check LSI thresholds specifically
  const keLSIRow = rows.find(r => r.label === "KE LSI (%)");
  if (keLSIRow && keLSIRow.cur) {
    const v = parseFloat(keLSIRow.cur);
    if (v >= 90) parts.push(`Knee extension LSI of ${keLSIRow.cur}% meets the 90% return-to-sport threshold.`);
    else if (v >= 80) parts.push(`Knee extension LSI of ${keLSIRow.cur}% is approaching but has not yet reached the 90% return-to-sport threshold.`);
    else parts.push(`Knee extension LSI of ${keLSIRow.cur}% remains below the 90% threshold, indicating continued quadriceps strength deficiency on the involved side.`);
  }

  const hopRows = rows.filter(r => r.label.includes("Hop LSI") && r.cur);
  if (hopRows.length > 0) {
    const hopVals = hopRows.map(r => parseFloat(r.cur));
    const allMet = hopVals.every(v => v >= 90);
    const noneMet = hopVals.every(v => v < 80);
    const avg = (hopVals.reduce((a, b) => a + b, 0) / hopVals.length).toFixed(1);
    if (allMet) parts.push(`All functional hop LSI values meet the 90% return-to-sport benchmark (average ${avg}%).`);
    else if (noneMet) parts.push(`Functional hop testing LSI values remain below 80% (average ${avg}%), indicating deficits in functional symmetry.`);
    else parts.push(`Functional hop testing shows mixed results with an average LSI of ${avg}%; some tests meet and others fall short of the 90% benchmark.`);
  }

  if (improved.length === 0 && regressed.length === 0) {
    parts.push("Overall performance is relatively unchanged from the prior assessment. Load previous data using the field above for a full comparison.");
  }

  return parts.join(" ");
}

// ─── SMART NOTE BUILDER ───────────────────────────────────────────────────────
function buildNote(d) {
  const inv = d.patient.involvedSide;
  const invR = inv === "Right";
  const uninv = invR ? "Left" : "Right";

  const gR = [d.girth.r5, d.girth.r10, d.girth.r15].reduce((a, v) => a + toNum(v), 0);
  const gL = [d.girth.l5, d.girth.l10, d.girth.l15].reduce((a, v) => a + toNum(v), 0);
  const gBig = Math.max(gR, gL), gSmall = Math.min(gR, gL);
  const gPct = gBig > 0 ? (((gBig - gSmall) / gBig) * 100).toFixed(1) : null;
  const gSide = gR < gL ? "Right deficit" : gL < gR ? "Left deficit" : "Equal";

  const torRnm = calcTorqueNm(d.forceR, d.tibLen);
  const torLnm = calcTorqueNm(d.forceL, d.tibLen);
  const normR = calcNorm(torRnm, d.bw);
  const normL = calcNorm(torLnm, d.bw);
  const torLSI = invR ? calcLSI(normR, normL) : calcLSI(normL, normR);
  const keLSI = invR ? calcLSI(d.keR, d.keL) : calcLSI(d.keL, d.keR);

  const hopAvgSI = avgTrials(d.hops.singleI), hopAvgSU = avgTrials(d.hops.singleU);
  const hopAvgTI = avgTrials(d.hops.tripleI), hopAvgTU = avgTrials(d.hops.tripleU);
  const hopAvgCI = avgTrials(d.hops.crossI),  hopAvgCU = avgTrials(d.hops.crossU);
  const hopAvgdI = avgTimedTrials(d.hops.timedI), hopAvgdU = avgTimedTrials(d.hops.timedU);
  const hopLSIs = {
    single: hopAvgSI !== null && hopAvgSU !== null && hopAvgSU > 0 ? ((hopAvgSI/hopAvgSU)*100).toFixed(1) : null,
    triple: hopAvgTI !== null && hopAvgTU !== null && hopAvgTU > 0 ? ((hopAvgTI/hopAvgTU)*100).toFixed(1) : null,
    cross:  hopAvgCI !== null && hopAvgCU !== null && hopAvgCU > 0 ? ((hopAvgCI/hopAvgCU)*100).toFixed(1) : null,
    timed:  hopAvgdI !== null && hopAvgdU !== null && hopAvgdI > 0 ? ((hopAvgdU/hopAvgdI)*100).toFixed(1) : null,
  };

  // Y-Balance composites
  const yb = d.yBalance || {};
  const ybCompR = calcYBalance(yb.rAnt, yb.rPM, yb.rPL, d.limbLen);
  const ybCompL = calcYBalance(yb.lAnt, yb.lPM, yb.lPL, d.limbLen);

  const lines = [];
  const add = (l) => lines.push(l);
  const addIf = (c, l) => { if (c) lines.push(l); };
  const br = () => lines.push("");

  add("OBJECTIVE - ACL REHABILITATION TESTING"); br();
  addIf(d.patient.date,             `Date of Testing: ${d.patient.date}`);
  addIf(d.patient.surgeon,         `Surgeon: ${d.patient.surgeon}`);
  addIf(d.patient.graftType,       `Graft Type: ${d.patient.graftType}`);
  addIf(hasVal(d.patient.weeksPostOp), `Weeks Post-Op: ${d.patient.weeksPostOp}`);
  add(`Involved Side: ${inv}`); br();

  if (hasVal(d.bw) || hasVal(d.tibLen) || hasVal(d.limbLen)) {
    add("BODY METRICS");
    addIf(hasVal(d.bw),      `Body Weight: ${d.bw} lbs`);
    addIf(hasVal(d.tibLen),  `Tibial Length: ${d.tibLen} cm`);
    addIf(hasVal(d.limbLen), `Limb Length (ASIS to MM): ${d.limbLen} cm`);
    br();
  }

  if (hasVal(d.flexR) || hasVal(d.flexL) || hasVal(d.extR) || hasVal(d.extL)) {
    add("KNEE RANGE OF MOTION");
    addIf(hasVal(d.flexR), `Knee Flexion - Right: ${d.flexR} degrees`);
    addIf(hasVal(d.flexL), `Knee Flexion - Left: ${d.flexL} degrees`);
    const fd = calcDiff(d.flexR, d.flexL);
    addIf(fd !== null, `Knee Flexion Deficit (R-L): ${fd} degrees`);
    addIf(hasVal(d.extR), `Knee Extension - Right: ${d.extR} degrees`);
    addIf(hasVal(d.extL), `Knee Extension - Left: ${d.extL} degrees`);
    const ed = calcDiff(d.extR, d.extL);
    addIf(ed !== null, `Knee Extension Deficit (R-L): ${ed} degrees`);
    br();
  }

  if (gR > 0 || gL > 0) {
    add("QUAD GIRTH (proximal to superior patella border)");
    const rp = [hasVal(d.girth.r5) && `5cm: ${d.girth.r5}cm`, hasVal(d.girth.r10) && `10cm: ${d.girth.r10}cm`, hasVal(d.girth.r15) && `15cm: ${d.girth.r15}cm`].filter(Boolean);
    const lp = [hasVal(d.girth.l5) && `5cm: ${d.girth.l5}cm`, hasVal(d.girth.l10) && `10cm: ${d.girth.l10}cm`, hasVal(d.girth.l15) && `15cm: ${d.girth.l15}cm`].filter(Boolean);
    addIf(rp.length > 0, `Right - ${rp.join("  ")}  Total: ${gR.toFixed(1)} cm`);
    addIf(lp.length > 0, `Left - ${lp.join("  ")}  Total: ${gL.toFixed(1)} cm`);
    addIf(gPct !== null, `Girth Asymmetry: ${gPct}% (${gSide})`);
    br();
  }

  if (hasVal(d.keR) || hasVal(d.keL)) {
    add("KNEE EXTENSION STRENGTH");
    addIf(hasVal(d.keR), `Right: ${d.keR} lbs`);
    addIf(hasVal(d.keL), `Left: ${d.keL} lbs`);
    const kd = calcDiff(d.keR, d.keL);
    addIf(kd !== null, `Difference (R-L): ${kd} lbs`);
    addIf(keLSI !== null, `Limb Symmetry Index (${inv} / ${uninv}): ${keLSI}%`);
    br();
  }

  if (torRnm || torLnm) {
    add("ISOMETRIC QUAD TORQUE - 90 DEGREE KNEE FLEXION (HHD)");
    addIf(hasVal(d.forceR) && torRnm, `Right: ${d.forceR} lbs  Torque: ${torRnm} Nm${normR ? `  Normalized: ${normR} Nm/kg` : ""}`);
    addIf(hasVal(d.forceL) && torLnm, `Left: ${d.forceL} lbs  Torque: ${torLnm} Nm${normL ? `  Normalized: ${normL} Nm/kg` : ""}`);
    addIf(torLSI !== null, `Quadriceps Index (${inv} / ${uninv}): ${torLSI}%`);
    br();
  }

  // Vald
  const valdMeta = [
    { key: "valdSquat", title: "SQUAT SYMMETRY - VALD FORCEDECKS",
      fields: ["lsiPct","peakForceAsym","peakConForce","copPath","classification","clinicalNote"],
      labels: { lsiPct:"LSI", peakForceAsym:"Peak Force Asymmetry", peakConForce:"Peak Concentric Force", copPath:"COP Path Length", classification:"Classification", clinicalNote:"Clinical Note" },
      units:  { lsiPct:"%", peakForceAsym:"%", peakConForce:"N", copPath:"mm" } },
    { key: "valdCMJ", title: "COUNTERMOVEMENT JUMP - VALD FORCEDECKS",
      fields: ["jumpHeight","propAsym","brakingImpulse","propRFD","modRSI","classification","clinicalNote"],
      labels: { jumpHeight:"Jump Height (impulse-derived)", propAsym:"Propulsion Asymmetry", brakingImpulse:"Braking Impulse", propRFD:"Propulsion RFD", modRSI:"Modified RSI", classification:"Classification", clinicalNote:"Clinical Note" },
      units:  { jumpHeight:"cm", propAsym:"%", brakingImpulse:"N·s", propRFD:"N/s", modRSI:"" } },
    { key: "valdSLDJ", title: "SINGLE LEG DROP JUMP - VALD FORCEDECKS",
      fields: ["invRSI","uninvRSI","peakLandForce","propPeakForce","vertLegStiff","rsiVariability","classification","clinicalNote"],
      labels: { invRSI:`RSI - ${inv}`, uninvRSI:`RSI - ${uninv}`, peakLandForce:"Peak Landing Force", propPeakForce:"Propulsion Peak Force", vertLegStiff:"Vertical Leg Stiffness", rsiVariability:"RSI Variability", classification:"Classification", clinicalNote:"Clinical Note" },
      units:  { invRSI:"", uninvRSI:"", peakLandForce:"N", propPeakForce:"N", vertLegStiff:"kN/m", rsiVariability:"" } },
  ];

  valdMeta.forEach(({ key, title, fields, labels, units }) => {
    const v = d[key] || {};
    if (!fields.some(f => v[f] && v[f] !== "")) return;
    add(title);
    fields.forEach(f => {
      const val = v[f]; if (!val || val === "") return;
      const unit = units[f] || "";
      add(`${labels[f]}: ${val}${unit && !["classification","clinicalNote"].includes(f) ? " " + unit : ""}`);
    });
    br();
  });

  // Y-Balance
  const ybHas = hasVal(yb.rAnt) || hasVal(yb.rPM) || hasVal(yb.rPL) || hasVal(yb.lAnt) || hasVal(yb.lPM) || hasVal(yb.lPL);
  if (ybHas) {
    add("Y-BALANCE TEST");
    add("Benchmark: Composite score ≥ 90% of limb length. Anterior reach side difference > 4 cm is clinically significant.");
    if (hasVal(d.limbLen)) {
      add(`Right Limb Length: ${d.limbLen} cm`);
      addIf(hasVal(yb.rAnt), `  Anterior: ${yb.rAnt} cm (${calcYDir(yb.rAnt, d.limbLen)}% LL)`);
      addIf(hasVal(yb.rPM),  `  Posteromedial: ${yb.rPM} cm (${calcYDir(yb.rPM, d.limbLen)}% LL)`);
      addIf(hasVal(yb.rPL),  `  Posterolateral: ${yb.rPL} cm (${calcYDir(yb.rPL, d.limbLen)}% LL)`);
      addIf(ybCompR !== null, `  Composite Score: ${ybCompR}% limb length`);
      add(`Left Limb Length: ${d.limbLen} cm`);
      addIf(hasVal(yb.lAnt), `  Anterior: ${yb.lAnt} cm (${calcYDir(yb.lAnt, d.limbLen)}% LL)`);
      addIf(hasVal(yb.lPM),  `  Posteromedial: ${yb.lPM} cm (${calcYDir(yb.lPM, d.limbLen)}% LL)`);
      addIf(hasVal(yb.lPL),  `  Posterolateral: ${yb.lPL} cm (${calcYDir(yb.lPL, d.limbLen)}% LL)`);
      addIf(ybCompL !== null, `  Composite Score: ${ybCompL}% limb length`);
    }
    if (hasVal(yb.rAnt) && hasVal(yb.lAnt)) {
      const antDiff = Math.abs(toNum(yb.rAnt) - toNum(yb.lAnt)).toFixed(1);
      add(`  Anterior Reach Side Difference: ${antDiff} cm${parseFloat(antDiff) > 4 ? " ⚠ EXCEEDS 4cm THRESHOLD" : ""}`);
    }
    br();
  }

  // Hops
  const hopNoteTests = [
    ["Single Hop for Distance", hopAvgSI, hopAvgSU, hopLSIs.single],
    ["Triple Hop for Distance", hopAvgTI, hopAvgTU, hopLSIs.triple],
    ["Crossover Hop for Distance", hopAvgCI, hopAvgCU, hopLSIs.cross],
    ["6-Meter Timed Hop", hopAvgdI, hopAvgdU, hopLSIs.timed, true],
  ].filter(([, i, u]) => i !== null || u !== null);

  if (hopNoteTests.length > 0) {
    add("HOP TESTING");
    hopNoteTests.forEach(([name, avgI, avgU, lsiVal, isTimed]) => {
      add(`${name}:`);
      const unit = isTimed ? "sec" : "in";
      addIf(avgI !== null, `  ${inv} (Involved) avg: ${avgI.toFixed(1)} ${unit}`);
      addIf(avgU !== null, `  ${uninv} (Uninvolved) avg: ${avgU.toFixed(1)} ${unit}`);
      addIf(lsiVal !== null, `  LSI: ${lsiVal}%`);
      br();
    });
    add("LSI Benchmark: ≥90% meets RTS criteria. 80-89% borderline. <80% does not meet criteria.");
    br();
  }

  if (hasVal(d.agilityTime)) {
    add("PRO AGILITY TEST (5-10-5)");
    add(`Best Time: ${d.agilityTime} sec`);
    br();
  }

  return lines.join("\n").trim();
}

// ─── LETTER BUILDER ───────────────────────────────────────────────────────────
function buildLetter(d, ptName, therapistName, clinic, impression) {
  const inv = d.patient.involvedSide;
  const invR = inv === "Right";
  const uninv = invR ? "Left" : "Right";

  const torRnm = calcTorqueNm(d.forceR, d.tibLen);
  const torLnm = calcTorqueNm(d.forceL, d.tibLen);
  const normR = calcNorm(torRnm, d.bw);
  const normL = calcNorm(torLnm, d.bw);
  const torLSI  = invR ? calcLSI(normR, normL) : calcLSI(normL, normR);
  const keLSI   = invR ? calcLSI(d.keR, d.keL) : calcLSI(d.keL, d.keR);
  const normInv = invR ? normR : normL;
  const hopAvgSIl = avgTrials(d.hops.singleI), hopAvgSUl = avgTrials(d.hops.singleU);
  const hopAvgTIl = avgTrials(d.hops.tripleI), hopAvgTUl = avgTrials(d.hops.tripleU);
  const hopAvgCIl = avgTrials(d.hops.crossI),  hopAvgCUl = avgTrials(d.hops.crossU);
  const hopAvgdIl = avgTimedTrials(d.hops.timedI), hopAvgdUl = avgTimedTrials(d.hops.timedU);
  const hopLSIs = {
    single: hopAvgSIl !== null && hopAvgSUl !== null && hopAvgSUl > 0 ? ((hopAvgSIl/hopAvgSUl)*100).toFixed(1) : null,
    triple: hopAvgTIl !== null && hopAvgTUl !== null && hopAvgTUl > 0 ? ((hopAvgTIl/hopAvgTUl)*100).toFixed(1) : null,
    cross:  hopAvgCIl !== null && hopAvgCUl !== null && hopAvgCUl > 0 ? ((hopAvgCIl/hopAvgCUl)*100).toFixed(1) : null,
    timed:  hopAvgdIl !== null && hopAvgdUl !== null && hopAvgdIl > 0 ? ((hopAvgdUl/hopAvgdIl)*100).toFixed(1) : null,
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const pt   = ptName || "[Patient Name]";
  const surg = d.patient.surgeon || "[Surgeon Name]";
  const ther = therapistName || "[Therapist Name, Credentials]";
  const cl   = clinic || "Train Recover Move";
  const wks  = d.patient.weeksPostOp ? `${d.patient.weeksPostOp} weeks` : "[X] weeks";
  const graft = d.patient.graftType || "[graft type]";

  const lines = [];
  const add = (l) => lines.push(l);
  const br = () => lines.push("");

  add(cl); add(today); br();
  add(`Dr. ${surg}`); br();
  add(`Re: ${pt} — ACL Rehabilitation Progress Update`); br();
  add(`Dear Dr. ${surg},`); br();

  add(`I wanted to reach out with a progress update on ${pt}, who is currently ${wks} post ACL reconstruction with a ${graft} graft and has been receiving physical therapy here at ${cl}. We recently completed a formal return-to-sport testing battery and I wanted to share the key findings with you.`);
  br();

  // Strength — lead with the most clinically meaningful data
  const hasStrength = hasVal(d.keR) || hasVal(d.keL) || keLSI || torLSI;
  if (hasStrength) {
    add("QUADRICEPS STRENGTH");
    let sLine = "";
    if (keLSI) {
      const kv = parseFloat(keLSI);
      sLine += `Knee extension strength testing revealed a Limb Symmetry Index (LSI) of ${keLSI}% (involved ${inv} versus uninvolved ${uninv} side). `;
      if (kv >= 90) sLine += "This meets the 90% LSI threshold for return-to-sport consideration. ";
      else if (kv >= 80) sLine += "This approaches but has not yet reached the 90% LSI threshold required for return-to-sport clearance. ";
      else sLine += "This remains below the 80% threshold, indicating a meaningful quadriceps strength deficit on the involved side. ";
    }
    if (torLSI) {
      sLine += `Isometric quadriceps torque testing (HHD at 90° knee flexion) yielded a Quadriceps Index of ${torLSI}%`;
      if (normInv) sLine += ` with a normalized torque of ${normInv} Nm/kg on the involved limb`;
      sLine += ". ";
    }
    if (sLine) add(sLine.trim());
    br();
  }

  // ROM
  if (hasVal(d.flexR) || hasVal(d.flexL) || hasVal(d.extR) || hasVal(d.extL)) {
    add("RANGE OF MOTION");
    const fInv = invR ? d.flexR : d.flexL, fUninv = invR ? d.flexL : d.flexR;
    const eInv = invR ? d.extR : d.extL, eUninv = invR ? d.extL : d.extR;
    let rLine = `${pt} demonstrated`;
    if (hasVal(fInv) && hasVal(fUninv)) rLine += ` knee flexion of ${fInv}° (involved) and ${fUninv}° (uninvolved)`;
    else if (hasVal(fInv)) rLine += ` knee flexion of ${fInv}° on the involved side`;
    if (hasVal(eInv)) rLine += `. Knee extension measured ${eInv}° on the involved side${hasVal(eUninv) ? ` and ${eUninv}° on the uninvolved side` : ""}`;
    rLine += ".";
    add(rLine); br();
  }

  // Y-Balance
  const yb = d.yBalance || {};
  const ybCompInv = invR ? calcYBalance(yb.rAnt, yb.rPM, yb.rPL, d.limbLen) : calcYBalance(yb.lAnt, yb.lPM, yb.lPL, d.limbLen);
  const ybCompUninv = invR ? calcYBalance(yb.lAnt, yb.lPM, yb.lPL, d.limbLen) : calcYBalance(yb.rAnt, yb.rPM, yb.rPL, d.limbLen);
  if (ybCompInv || ybCompUninv) {
    add("Y-BALANCE TEST");
    let yLine = "Y-Balance testing ";
    if (ybCompInv && ybCompUninv) {
      yLine += `demonstrated a composite score of ${ybCompInv}% on the involved (${inv}) limb and ${ybCompUninv}% on the uninvolved (${uninv}) limb. `;
    } else if (ybCompInv) {
      yLine += `demonstrated a composite score of ${ybCompInv}% on the involved limb. `;
    }
    const antInv = invR ? yb.rAnt : yb.lAnt, antUninv = invR ? yb.lAnt : yb.rAnt;
    if (hasVal(antInv) && hasVal(antUninv)) {
      const antDiff = Math.abs(toNum(antInv) - toNum(antUninv)).toFixed(1);
      yLine += `Anterior reach difference between limbs was ${antDiff} cm${parseFloat(antDiff) > 4 ? ", which exceeds the 4 cm threshold associated with increased injury risk" : ", which is within acceptable limits"}. `;
    }
    yLine += "The benchmark for composite score is ≥90% of limb length.";
    add(yLine); br();
  }

  // Vald
  const valdSect = [
    { k: "valdSquat", name: "Bilateral Squat Symmetry",
      show: (v) => { let s = `${v.classification ? v.classification + ". " : ""}${v.peakForceAsym ? `Peak force asymmetry ${v.peakForceAsym}%. ` : ""}${v.clinicalNote || ""}`; return s.trim(); } },
    { k: "valdCMJ", name: "Countermovement Jump",
      show: (v) => { let s = `${v.jumpHeight ? `Jump height ${v.jumpHeight} cm. ` : ""}${v.propAsym ? `Propulsion asymmetry ${v.propAsym}%. ` : ""}${v.modRSI ? `Modified RSI ${v.modRSI}. ` : ""}${v.classification ? v.classification + ". " : ""}${v.clinicalNote || ""}`; return s.trim(); } },
    { k: "valdSLDJ", name: "Single Leg Drop Jump",
      show: (v) => { let s = `${v.invRSI ? `RSI - Involved: ${v.invRSI}. ` : ""}${v.uninvRSI ? `RSI - Uninvolved: ${v.uninvRSI}. ` : ""}${v.classification ? v.classification + ". " : ""}${v.clinicalNote || ""}`; return s.trim(); } },
  ].filter(({ k }) => Object.values(d[k] || {}).some(v => v && v !== ""));

  if (valdSect.length > 0) {
    add("FORCE PLATFORM TESTING (VALD FORCEDECKS)");
    valdSect.forEach(({ k, name, show }) => {
      const summary = show(d[k] || {});
      if (summary) add(`${name}: ${summary}`);
    });
    br();
  }

  // Hops
  const hopEntries = [
    ["Single Hop", hopLSIs.single],
    ["Triple Hop", hopLSIs.triple],
    ["Crossover Hop", hopLSIs.cross],
    ["6-Meter Timed Hop", hopLSIs.timed],
  ].filter(([, v]) => v !== null);

  if (hopEntries.length > 0) {
    add("FUNCTIONAL HOP TESTING");
    const hopStr = hopEntries.map(([n, v]) => `${n} LSI ${v}%`).join(", ");
    const allMet = hopEntries.every(([, v]) => parseFloat(v) >= 90);
    const noneMet = hopEntries.every(([, v]) => parseFloat(v) < 80);
    let hLine = `${pt} completed functional hop testing: ${hopStr}. `;
    if (allMet) hLine += "All values meet the 90% LSI return-to-sport benchmark.";
    else if (noneMet) hLine += "All values fall below the 80% threshold, indicating significant functional symmetry deficits.";
    else hLine += "Performance is mixed relative to the 90% LSI benchmark required for return-to-sport clearance.";
    add(hLine); br();
  }

  if (hasVal(d.agilityTime)) {
    add("AGILITY");
    add(`Pro Agility Test (5-10-5) best time: ${d.agilityTime} seconds.`); br();
  }

  add("CLINICAL IMPRESSION");
  add(impression && impression.trim()
    ? impression.trim()
    : "[Please enter your clinical impression above before sending this letter.]");
  br();

  add("Please feel free to reach out with any questions. We value your collaboration in this patient's care and will continue to keep you informed as testing progresses.");
  br();
  add("Sincerely,"); br();
  add(ther); add(cl);

  return lines.join("\n");
}

// ─── TAB 1: TESTING ───────────────────────────────────────────────────────────
function Tab1({ data: d, setData: setD }) {
  const sd = (k, v) => setD(p => ({ ...p, [k]: v }));
  const setP = (k, v) => sd("patient", { ...d.patient, [k]: v });
  const inv = d.patient.involvedSide, invR = inv === "Right", uninv = invR ? "Left" : "Right";

  const gTotR = () => [d.girth.r5, d.girth.r10, d.girth.r15].reduce((a, v) => a + toNum(v), 0);
  const gTotL = () => [d.girth.l5, d.girth.l10, d.girth.l15].reduce((a, v) => a + toNum(v), 0);
  const gPct = () => { const b = Math.max(gTotR(), gTotL()), s = Math.min(gTotR(), gTotL()); return b > 0 ? (((b - s) / b) * 100).toFixed(1) : null; };
  const gSide = () => { const r = gTotR(), l = gTotL(); return r < l ? "Right deficit" : l < r ? "Left deficit" : "Equal"; };

  const torRnm = calcTorqueNm(d.forceR, d.tibLen);
  const torLnm = calcTorqueNm(d.forceL, d.tibLen);
  const normR = calcNorm(torRnm, d.bw);
  const normL = calcNorm(torLnm, d.bw);
  const torLSI = invR ? calcLSI(normR, normL) : calcLSI(normL, normR);
  const keLSI  = invR ? calcLSI(d.keR, d.keL) : calcLSI(d.keL, d.keR);

  const hopAvgSI = avgTrials(d.hops.singleI), hopAvgSU = avgTrials(d.hops.singleU);
  const hopAvgTI = avgTrials(d.hops.tripleI), hopAvgTU = avgTrials(d.hops.tripleU);
  const hopAvgCI = avgTrials(d.hops.crossI),  hopAvgCU = avgTrials(d.hops.crossU);
  const hopAvgdI = avgTimedTrials(d.hops.timedI), hopAvgdU = avgTimedTrials(d.hops.timedU);
  const hopLSIs = {
    single: hopAvgSI !== null && hopAvgSU !== null && hopAvgSU > 0 ? ((hopAvgSI/hopAvgSU)*100).toFixed(1) : null,
    triple: hopAvgTI !== null && hopAvgTU !== null && hopAvgTU > 0 ? ((hopAvgTI/hopAvgTU)*100).toFixed(1) : null,
    cross:  hopAvgCI !== null && hopAvgCU !== null && hopAvgCU > 0 ? ((hopAvgCI/hopAvgCU)*100).toFixed(1) : null,
    timed:  hopAvgdI !== null && hopAvgdU !== null && hopAvgdI > 0 ? ((hopAvgdU/hopAvgdI)*100).toFixed(1) : null,
  };

  // Y-Balance calculations
  const yb = d.yBalance || {};
  const setYB = (k, v) => sd("yBalance", { ...yb, [k]: v });
  const ybCompR = calcYBalance(yb.rAnt, yb.rPM, yb.rPL, d.limbLen);
  const ybCompL = calcYBalance(yb.lAnt, yb.lPM, yb.lPL, d.limbLen);
  const ybCompInv = invR ? ybCompR : ybCompL;
  const ybCompUninv = invR ? ybCompL : ybCompR;
  const antDiff = hasVal(yb.rAnt) && hasVal(yb.lAnt)
    ? Math.abs(toNum(yb.rAnt) - toNum(yb.lAnt)).toFixed(1) : null;

  const agilityNorms = {
    "Male Elite": { mean: 4.22, sd: 0.15 }, "Female Elite": { mean: 4.73, sd: 0.18 },
    "Male Collegiate": { mean: 4.38, sd: 0.20 }, "Female Collegiate": { mean: 4.92, sd: 0.22 },
    "Male HS": { mean: 4.55, sd: 0.25 }, "Female HS": { mean: 5.10, sd: 0.28 },
    "Male General": { mean: 4.80, sd: 0.30 }, "Female General": { mean: 5.40, sd: 0.35 },
  };
  const [normGroup, setNormGroup] = useState("Male Collegiate");
  const norm = agilityNorms[normGroup];
  const agClass = () => {
    if (!hasVal(d.agilityTime) || !norm) return null;
    const t = toNum(d.agilityTime);
    if (t <= norm.mean - norm.sd) return { label: "Above Average", color: LIME };
    if (t <= norm.mean)           return { label: "Average",       color: LIME };
    if (t <= norm.mean + norm.sd) return { label: "Below Average", color: GOLD };
    return { label: "Well Below Average", color: RED_BAD };
  };

  // Vald field definitions — updated per request
  const valdSquatFields = [
    { key: "lsiPct",        label: "LSI",                     unit: "%" },
    { key: "peakForceAsym", label: "Peak Force Asymmetry",    unit: "%" },
    { key: "peakConForce",  label: "Peak Concentric Force",   unit: "N" },
    { key: "copPath",       label: "COP Path Length",         unit: "mm" },
    { key: "classification", label: "Classification", type: "select", options: ["Within Normal Limits","Mild Asymmetry","Moderate Asymmetry","Significant Asymmetry"] },
    { key: "clinicalNote",  label: "Clinical Note" },
  ];
  const valdCMJFields = [
    { key: "jumpHeight",     label: "Jump Height (impulse-derived)", unit: "cm" },
    { key: "propAsym",       label: "Propulsion Asymmetry",          unit: "%" },
    { key: "brakingImpulse", label: "Braking Impulse",               unit: "N·s" },
    { key: "propRFD",        label: "Propulsion RFD",                unit: "N/s" },
    { key: "modRSI",         label: "Modified RSI",                  unit: "" },
    { key: "classification", label: "Classification", type: "select", options: ["Within Normal Limits","Mild Asymmetry","Moderate Asymmetry","Significant Asymmetry"] },
    { key: "clinicalNote",   label: "Clinical Note" },
  ];
  const valdSLDJFields = [
    { key: "invRSI",        label: `RSI — ${inv}`,             unit: "" },
    { key: "uninvRSI",      label: `RSI — ${uninv}`,           unit: "" },
    { key: "peakLandForce", label: "Peak Landing Force",       unit: "N" },
    { key: "propPeakForce", label: "Propulsion Peak Force",    unit: "N" },
    { key: "vertLegStiff",  label: "Vertical Leg Stiffness",   unit: "kN/m" },
    { key: "rsiVariability",label: "RSI Variability",          unit: "" },
    { key: "classification", label: "Classification", type: "select", options: ["Within Normal Limits","Mild Asymmetry","Moderate Asymmetry","Significant Asymmetry"] },
    { key: "clinicalNote",  label: "Clinical Note" },
  ];

  const setVald = (section, key, val) => sd(section, { ...(d[section] || {}), [key]: val });

  const generateNote = () => sd("noteText", buildNote(d));
  const copyNote = () => {
    navigator.clipboard.writeText(d.noteText).then(() => {
      sd("copied", true);
      setTimeout(() => sd("copied", false), 2500);
    });
  };

  return (
    <div>
      {/* Patient — no age field */}
      <Card title="Patient Information" accent>
        <R3>
          <Field label="Date of Testing" type="text" value={d.patient.date} onChange={v => setP("date", v)} placeholder="MM/DD/YYYY" step={null} />
          <Field label="Weeks Post-Op" unit="wks" value={d.patient.weeksPostOp} onChange={v => setP("weeksPostOp", v)} step="1" />
          <Field label="Graft Type" type="text" value={d.patient.graftType} onChange={v => setP("graftType", v)} placeholder="e.g. BPTB, HS, QT" step={null} />
        </R3>
        <R2>
          <Field label="Surgeon" type="text" value={d.patient.surgeon} onChange={v => setP("surgeon", v)} placeholder="Surgeon last name" step={null} />
          <div />
        </R2>
      </Card>

      {/* Body Metrics — now includes limb length */}
      <Card title="Body Metrics">
        <R3>
          <Field label="Body Weight" unit="lbs" value={d.bw} onChange={v => sd("bw", v)} />
          <Field label="Tibial Length" unit="cm" value={d.tibLen} onChange={v => sd("tibLen", v)} placeholder="joint line to HHD pad" />
          <Field label="Limb Length" unit="cm" value={d.limbLen} onChange={v => sd("limbLen", v)} placeholder="ASIS to medial malleolus" />
        </R3>
        <div style={{ fontSize: 11, color: MUTED }}>Tibial length = lateral joint line to HHD pad (for torque). Limb length = ASIS to medial malleolus (for Y-Balance). One measurement used for both sides.</div>
      </Card>

      {/* ROM */}
      <Card title="Knee Range of Motion">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="Flexion Right" unit="°" value={d.flexR} onChange={v => sd("flexR", v)} />
          <Field label="Flexion Left"  unit="°" value={d.flexL} onChange={v => sd("flexL", v)} />
          <Field label="Extension Right" unit="°" value={d.extR} onChange={v => sd("extR", v)} />
          <Field label="Extension Left"  unit="°" value={d.extL} onChange={v => sd("extL", v)} />
        </div>
        <StatBar stats={[
          { label: "Flex Deficit R-L", value: calcDiff(d.flexR, d.flexL) !== null ? calcDiff(d.flexR, d.flexL) + "°" : null, color: WHITE },
          { label: "Ext Deficit R-L",  value: calcDiff(d.extR,  d.extL)  !== null ? calcDiff(d.extR,  d.extL)  + "°" : null, color: WHITE },
        ]} />
      </Card>

      {/* Girth */}
      <Card title="Quad Girth Measurements">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Circumference at 5, 10, 15 cm proximal to superior patella border (cm)</div>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 90px", gap: 8, marginBottom: 8 }}>
          <div />{["5 cm","10 cm","15 cm","Total"].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", textAlign: "center" }}>{h}</div>)}
        </div>
        {[["Right","r"],["Left","l"]].map(([side, k]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 90px", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: WHITE }}>{side}</div>
            {["5","10","15"].map(n => (
              <input key={n} style={inp} type="number" step="0.1" placeholder="—"
                value={d.girth[`${k}${n}`]}
                onChange={e => sd("girth", { ...d.girth, [`${k}${n}`]: e.target.value })} />
            ))}
            <div style={calcBox}>{(k === "r" ? gTotR() : gTotL()).toFixed(1)}</div>
          </div>
        ))}
        <StatBar stats={[
          { label: "Right Total", value: gTotR().toFixed(1) + " cm", color: WHITE },
          { label: "Left Total",  value: gTotL().toFixed(1) + " cm", color: WHITE },
          { label: "Asymmetry",   value: gPct() !== null ? gPct() + "%" : null, color: lsiColor(gPct() !== null ? (100 - parseFloat(gPct())).toString() : null) },
          { label: "Side",        value: gSide(), color: GOLD },
        ]} />
      </Card>

      {/* KE Strength */}
      <Card title="Knee Extension Strength">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Force values automatically populate HHD inputs in the torque section below.</div>
        <R2>
          <Field label="Right" unit="lbs" value={d.keR} onChange={v => { sd("keR", v); sd("forceR", v); }} />
          <Field label="Left"  unit="lbs" value={d.keL} onChange={v => { sd("keL", v); sd("forceL", v); }} />
        </R2>
        <StatBar stats={[
          { label: "Diff (R-L)", value: calcDiff(d.keR, d.keL) !== null ? calcDiff(d.keR, d.keL) + " lbs" : null, color: WHITE },
          { label: `LSI (${inv}/${uninv})`, value: keLSI ? keLSI + "%" : null, color: lsiColor(keLSI) },
        ]} />
      </Card>

      {/* Torque */}
      <Card title="Isometric Quad Torque — 90° Knee Flexion (HHD)">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>
          Force carried from KE Strength above. Torque (Nm) = Force(lbs) × 4.448 × Tibial Length(m). Normalized = Nm / BW(kg).
        </div>
        <R2>
          <Field label="HHD Force — Right (lbs)" value={d.forceR} onChange={v => sd("forceR", v)} placeholder="auto from KE" />
          <Field label="HHD Force — Left (lbs)"  value={d.forceL} onChange={v => sd("forceL", v)} placeholder="auto from KE" />
        </R2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          {[["Torque R (Nm)", torRnm],["Torque L (Nm)", torLnm],["Norm R (Nm/kg)", normR],["Norm L (Nm/kg)", normL]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
              <div style={{ ...calcBox, textAlign: "left" }}>{val || "—"}</div>
            </div>
          ))}
        </div>
        <StatBar stats={[{ label: `Quadriceps Index (${inv}/${uninv})`, value: torLSI ? torLSI + "%" : null, color: lsiColor(torLSI) }]} />
      </Card>

      {/* Vald — Squat */}
      <ValdCard title="Squat Symmetry — Vald ForceDecks" id="ValdSquat"
        fields={valdSquatFields} values={d.valdSquat || {}}
        onChange={(k, v) => setVald("valdSquat", k, v)}
        highlight={(vals) => vals.lsiPct && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ ...lbl, marginBottom: 3 }}>LSI</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: lsiColor(vals.lsiPct) }}>{vals.lsiPct}%</div>
            </div>
            {vals.classification && <div style={{ padding: "6px 14px", borderRadius: 8, background: "#111", border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 700, color: WHITE }}>{vals.classification}</div>}
          </div>
        )} />

      {/* Vald — CMJ */}
      <ValdCard title="Countermovement Jump — Vald ForceDecks" id="ValdCMJ"
        fields={valdCMJFields} values={d.valdCMJ || {}}
        onChange={(k, v) => setVald("valdCMJ", k, v)}
        highlight={(vals) => vals.modRSI && (
          <div style={{ marginTop: 12 }}>
            <div style={{ ...lbl, marginBottom: 3 }}>Modified RSI</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: BLUE }}>{vals.modRSI}</div>
          </div>
        )} />

      {/* Vald — SLDJ */}
      <ValdCard title="Single Leg Drop Jump — Vald ForceDecks" id="ValdSLDJ"
        fields={valdSLDJFields} values={d.valdSLDJ || {}}
        onChange={(k, v) => setVald("valdSLDJ", k, v)}
        highlight={(vals) => (vals.invRSI || vals.uninvRSI) && (
          <div style={{ marginTop: 12, display: "flex", gap: 24 }}>
            {vals.invRSI && <div><div style={{ ...lbl, marginBottom: 3 }}>RSI {inv}</div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: lsiColor(parseFloat(vals.invRSI) >= parseFloat(vals.uninvRSI || 0) ? "90" : "70") }}>{vals.invRSI}</div></div>}
            {vals.uninvRSI && <div><div style={{ ...lbl, marginBottom: 3 }}>RSI {uninv}</div><div style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: LIME }}>{vals.uninvRSI}</div></div>}
          </div>
        )} />

      {/* Y-Balance */}
      <Card title="Y-Balance Test" id="YBalance">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, lineHeight: 1.7 }}>
          Composite score = (Anterior + Posteromedial + Posterolateral) ÷ (Limb Length × 3) × 100. Benchmark: ≥90% composite. Anterior side difference &gt;4 cm is a meaningful asymmetry flag. Limb length carried from Body Metrics above.
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 100px", gap: 8, marginBottom: 8 }}>
          <div />
          {["Anterior (cm)", "Posteromedial (cm)", "Posterolateral (cm)", "Composite"].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>{h}</div>
          ))}
        </div>

        {[
          ["Right", "r", d.limbLen, ybCompR],
          ["Left",  "l", d.limbLen, ybCompL],
        ].map(([side, k, limbLen, comp]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 100px", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: WHITE }}>{side}</div>
              {hasVal(limbLen) && <div style={{ fontSize: 10, color: MUTED }}>{limbLen} cm LL</div>}
            </div>
            {["Ant","PM","PL"].map(dir => (
              <input key={dir} style={inp} type="number" step="0.1" placeholder="—"
                value={yb[`${k}${dir}`] || ""}
                onChange={e => setYB(`${k}${dir}`, e.target.value)} />
            ))}
            <div style={{ ...calcBox, color: comp ? yBalColor(comp) : MUTED }}>
              {comp ? comp + "%" : "—"}
            </div>
          </div>
        ))}

        {/* Per-direction % of limb length breakdown */}
        {hasVal(d.limbLen) && (
          <div style={{ marginTop: 12, background: "#0f0f0f", borderRadius: 8, border: `1px solid ${BORDER}`, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Reach as % of Limb Length</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Right", "r", d.limbLen, [yb.rAnt, yb.rPM, yb.rPL]],
                ["Left",  "l", d.limbLen, [yb.lAnt, yb.lPM, yb.lPL]],
              ].map(([side, k, ll, [ant, pm, pl]]) => (
                hasVal(ll) && (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: WHITE, marginBottom: 6 }}>{side}</div>
                    {[["Anterior", ant], ["Posteromedial", pm], ["Posterolateral", pl]].map(([name, val]) => {
                      const pct = calcYDir(val, ll);
                      return (
                        <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: MUTED }}>{name}</span>
                          <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: pct ? yBalColor(pct) : MUTED }}>
                            {pct ? pct + "%" : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <StatBar stats={[
          { label: `Composite — ${inv} (Involved)`,   value: ybCompInv  ? ybCompInv + "%"  : null, color: ybCompInv  ? yBalColor(ybCompInv)  : MUTED },
          { label: `Composite — ${uninv} (Uninvolved)`, value: ybCompUninv ? ybCompUninv + "%" : null, color: ybCompUninv ? yBalColor(ybCompUninv) : MUTED },
          { label: "Ant Reach Difference", value: antDiff ? antDiff + " cm" : null, color: antDiff && parseFloat(antDiff) > 4 ? RED_BAD : LIME },
        ]} />
        <div style={{ marginTop: 10, padding: "8px 14px", background: "#0f0f0f", borderRadius: 6, border: `1px solid ${BORDER}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["≥90% — Meets Benchmark", LIME],["<90% — Below Benchmark", RED_BAD],["Ant Diff >4 cm — Flag", GOLD]].map(([l,c]) => (
            <span key={l} style={{ fontSize: 11, fontWeight: 700, color: c }}>■ {l}</span>
          ))}
        </div>
      </Card>

      {/* Hops */}
      <Card title="Hop Testing">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>
          Enter up to 3 trials per side in feet + inches. Averages are calculated automatically and used for LSI comparison (in inches).
        </div>
        {[
          { name: "Single Hop", ki: "singleI", ku: "singleU", lsiVal: hopLSIs.single, avgI: hopAvgSI, avgU: hopAvgSU, timed: false },
          { name: "Triple Hop", ki: "tripleI", ku: "tripleU", lsiVal: hopLSIs.triple, avgI: hopAvgTI, avgU: hopAvgTU, timed: false },
          { name: "Crossover Hop", ki: "crossI", ku: "crossU", lsiVal: hopLSIs.cross, avgI: hopAvgCI, avgU: hopAvgCU, timed: false },
          { name: "6m Timed Hop", ki: "timedI", ku: "timedU", lsiVal: hopLSIs.timed, avgI: hopAvgdI, avgU: hopAvgdU, timed: true },
        ].map(({ name, ki, ku, lsiVal, avgI, avgU, timed }) => (
          <div key={name} style={{ marginBottom: 18, padding: "14px 16px", background: "#111", borderRadius: 10, border: `1px solid ${BORDER}` }}>
            {/* Test header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>{name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {avgI !== null && <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 2 }}>Avg {inv}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: LIME }}>{avgI.toFixed(1)} {timed ? "sec" : "in"}</div>
                </div>}
                {avgU !== null && <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 2 }}>Avg {uninv}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: WHITE }}>{avgU.toFixed(1)} {timed ? "sec" : "in"}</div>
                </div>}
                <div style={{ textAlign: "center", padding: "6px 14px", borderRadius: 8, background: lsiVal ? lsiColor(lsiVal) + "22" : "#0f0f0f", border: `1px solid ${lsiVal ? lsiColor(lsiVal) + "55" : BORDER}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", marginBottom: 2 }}>LSI</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: lsiColor(lsiVal) }}>{lsiVal ? lsiVal + "%" : "—"}</div>
                </div>
              </div>
            </div>
            {/* Trial inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", alignSelf: "end", paddingBottom: 6 }}>Trial</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", textAlign: "center" }}>{inv} (Involved)</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", textAlign: "center" }}>{uninv} (Uninvolved)</div>
            </div>
            {[0,1,2].map(t => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginTop: 6, alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>#{t+1}</div>
                {timed ? (
                  <>
                    <input style={inp} type="number" step="0.01" placeholder="sec"
                      value={d.hops[ki][t].sec}
                      onChange={e => { const h = d.hops[ki].map((x,i2)=>i2===t?{...x,sec:e.target.value}:x); sd("hops",{...d.hops,[ki]:h}); }} />
                    <input style={inp} type="number" step="0.01" placeholder="sec"
                      value={d.hops[ku][t].sec}
                      onChange={e => { const h = d.hops[ku].map((x,i2)=>i2===t?{...x,sec:e.target.value}:x); sd("hops",{...d.hops,[ku]:h}); }} />
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      <input style={{...inp, textAlign:"center"}} type="number" step="1" min="0" placeholder="ft"
                        value={d.hops[ki][t].ft}
                        onChange={e => { const h = d.hops[ki].map((x,i2)=>i2===t?{...x,ft:e.target.value}:x); sd("hops",{...d.hops,[ki]:h}); }} />
                      <input style={{...inp, textAlign:"center"}} type="number" step="0.25" min="0" max="11.75" placeholder="in"
                        value={d.hops[ki][t].in}
                        onChange={e => { const h = d.hops[ki].map((x,i2)=>i2===t?{...x,in:e.target.value}:x); sd("hops",{...d.hops,[ki]:h}); }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      <input style={{...inp, textAlign:"center"}} type="number" step="1" min="0" placeholder="ft"
                        value={d.hops[ku][t].ft}
                        onChange={e => { const h = d.hops[ku].map((x,i2)=>i2===t?{...x,ft:e.target.value}:x); sd("hops",{...d.hops,[ku]:h}); }} />
                      <input style={{...inp, textAlign:"center"}} type="number" step="0.25" min="0" max="11.75" placeholder="in"
                        value={d.hops[ku][t].in}
                        onChange={e => { const h = d.hops[ku].map((x,i2)=>i2===t?{...x,in:e.target.value}:x); sd("hops",{...d.hops,[ku]:h}); }} />
                    </div>
                  </>
                )}
              </div>
            ))}
            {!timed && (
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 8, marginTop: 4 }}>
                <div />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textAlign: "center" }}>ft</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textAlign: "center" }}>in</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textAlign: "center" }}>ft</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textAlign: "center" }}>in</div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{ marginTop: 4, padding: "10px 16px", background: "#0f0f0f", borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["≥90% — RTS Met", LIME],["80–89% — Borderline", GOLD],["<80% — Not Met", RED_BAD]].map(([l, c]) => (
            <span key={l} style={{ fontSize: 11, fontWeight: 700, color: c }}>■ {l}</span>
          ))}
        </div>
      </Card>

      {/* Agility */}
      <Card title="Pro Agility Test (5-10-5)">
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Sprints 5 yards, 10 yards, 5 yards. Record best time. Lower is better.</div>
        <R3>
          <div>
            <label style={lbl}>Best Time (sec)</label>
            <input style={inp} type="number" step="0.01" placeholder="e.g. 4.42" value={d.agilityTime} onChange={e => sd("agilityTime", e.target.value)} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={lbl}>Comparison Norm Group</label>
            <select style={inp} value={normGroup} onChange={e => setNormGroup(e.target.value)}>
              {Object.keys(agilityNorms).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </R3>
        {hasVal(d.agilityTime) && norm && (
          <StatBar stats={[
            { label: "Patient Time",   value: d.agilityTime + " sec", color: WHITE },
            { label: "Norm Mean",      value: norm.mean + " sec",     color: MUTED },
            { label: "Diff vs Norm",   value: (toNum(d.agilityTime) - norm.mean).toFixed(2) + " sec", color: toNum(d.agilityTime) <= norm.mean ? LIME : RED_BAD },
            { label: "Classification", value: agClass()?.label, color: agClass()?.color },
          ]} />
        )}
      </Card>

      <button onClick={generateNote} style={{ width: "100%", padding: 16, borderRadius: 12, fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: `linear-gradient(135deg,${LIME},${LIME_DIM})`, color: BLACK, border: "none", boxShadow: `0 8px 32px ${LIME}44`, marginBottom: 20 }}>
        ⬇ Generate SOAP Note Objective
      </button>

      {d.noteText && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${LIME}44`, marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: LIME + "14", borderBottom: `1px solid ${LIME}33` }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: LIME, letterSpacing: "0.15em", textTransform: "uppercase" }}>SOAP Note — Objective Section</span>
            <button onClick={copyNote} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: d.copied ? "#15803d" : LIME, color: BLACK, border: "none" }}>
              {d.copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
          </div>
          <pre style={{ padding: 20, background: "#0a0a0a", color: "#d4faa6", fontSize: 12, fontFamily: "monospace", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0, maxHeight: 500, overflowY: "auto" }}>{d.noteText}</pre>
        </div>
      )}
    </div>
  );
}

// ─── TAB 2: COMPARISON ────────────────────────────────────────────────────────
function Tab2({ currentData: d }) {
  const [oldText, setOldText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseMsg, setParseMsg] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [copiedPara, setCopiedPara] = useState(false);

  const parseOldNote = (text) => {
    const result = {};
    text.split("\n").map(l => l.trim()).filter(Boolean).forEach(line => {
      const m = line.match(/^([^:]+):\s*(.+)$/);
      if (m) result[m[1].trim().toLowerCase()] = m[2].trim();
    });
    return result;
  };

  const invR = d.patient.involvedSide === "Right";
  const inv = d.patient.involvedSide, uninv = invR ? "Left" : "Right";
  const torRnm = calcTorqueNm(d.forceR, d.tibLen);
  const torLnm = calcTorqueNm(d.forceL, d.tibLen);
  const normR = calcNorm(torRnm, d.bw);
  const normL = calcNorm(torLnm, d.bw);
  const torLSI  = invR ? calcLSI(normR, normL) : calcLSI(normL, normR);
  const keLSI   = invR ? calcLSI(d.keR, d.keL) : calcLSI(d.keL, d.keR);
  const hopAvgSI2 = avgTrials(d.hops.singleI), hopAvgSU2 = avgTrials(d.hops.singleU);
  const hopAvgTI2 = avgTrials(d.hops.tripleI), hopAvgTU2 = avgTrials(d.hops.tripleU);
  const hopAvgCI2 = avgTrials(d.hops.crossI),  hopAvgCU2 = avgTrials(d.hops.crossU);
  const hopAvgdI2 = avgTimedTrials(d.hops.timedI), hopAvgdU2 = avgTimedTrials(d.hops.timedU);
  const hopLSIs = {
    single: hopAvgSI2 !== null && hopAvgSU2 !== null && hopAvgSU2 > 0 ? ((hopAvgSI2/hopAvgSU2)*100).toFixed(1) : null,
    triple: hopAvgTI2 !== null && hopAvgTU2 !== null && hopAvgTU2 > 0 ? ((hopAvgTI2/hopAvgTU2)*100).toFixed(1) : null,
    cross:  hopAvgCI2 !== null && hopAvgCU2 !== null && hopAvgCU2 > 0 ? ((hopAvgCI2/hopAvgCU2)*100).toFixed(1) : null,
    timed:  hopAvgdI2 !== null && hopAvgdU2 !== null && hopAvgdI2 > 0 ? ((hopAvgdU2/hopAvgdI2)*100).toFixed(1) : null,
  };
  const yb = d.yBalance || {};
  const ybCompR = calcYBalance(yb.rAnt, yb.rPM, yb.rPL, d.limbLen);
  const ybCompL = calcYBalance(yb.lAnt, yb.lPM, yb.lPL, d.limbLen);

  const rows = [           key: "weeks_postop",         cur: d.patient.weeksPostOp,   u: " wks", h: true },
    { label: `Flex ${inv} (°)`,         key: `knee_flexion_${inv.toLowerCase()}`,   cur: invR ? d.flexR : d.flexL, u: "°", h: true },
    { label: `Flex ${uninv} (°)`,       key: `knee_flexion_${uninv.toLowerCase()}`, cur: invR ? d.flexL : d.flexR, u: "°", h: true },
    { label: `Ext ${inv} (°)`,          key: `knee_extension_${inv.toLowerCase()}`, cur: invR ? d.extR : d.extL,   u: "°", h: null },
    { label: "Girth Asymmetry (%)",     key: "girth_asymmetry",      cur: (() => { const r=[d.girth.r5,d.girth.r10,d.girth.r15].reduce((a,v)=>a+toNum(v),0),l=[d.girth.l5,d.girth.l10,d.girth.l15].reduce((a,v)=>a+toNum(v),0),b=Math.max(r,l),s=Math.min(r,l); return b>0?((b-s)/b*100).toFixed(1):null; })(), u: "%", h: false },
    { label: `KE Strength ${inv} (lbs)`,key: `ke_strength_${inv.toLowerCase()}`,    cur: invR ? d.keR : d.keL,     u: " lbs", h: true },
    { label: "KE LSI (%)",              key: "limb_symmetry_index",  cur: keLSI,      u: "%", h: true },
    { label: "Quadriceps Index (%)",    key: "quadriceps_index",     cur: torLSI,     u: "%", h: true },
    { label: "Squat LSI (%)",           key: "lsi",                  cur: (d.valdSquat||{}).lsiPct, u: "%", h: true },
    { label: "CMJ Jump Height (cm)",    key: "jump_height",          cur: (d.valdCMJ||{}).jumpHeight, u: " cm", h: true },
    { label: `SLDJ RSI ${inv}`,         key: `rsi_${inv.toLowerCase()}`, cur: (d.valdSLDJ||{}).invRSI, u: "", h: true },
    { label: "Y-Balance Composite Right (%)", key: "composite_right", cur: ybCompR, u: "%", h: true },
    { label: "Y-Balance Composite Left (%)",  key: "composite_left",  cur: ybCompL, u: "%", h: true },
    { label: "Single Hop LSI (%)",      key: "lsi_single_hop",       cur: hopLSIs.single, u: "%", h: true },
    { label: "Triple Hop LSI (%)",      key: "lsi_triple_hop",       cur: hopLSIs.triple, u: "%", h: true },
    { label: "Crossover Hop LSI (%)",   key: "lsi_crossover_hop",    cur: hopLSIs.cross,  u: "%", h: true },
    { label: "6m Timed Hop LSI (%)",    key: "lsi_6m_timed_hop",     cur: hopLSIs.timed,  u: "%", h: true },
    { label: "Pro Agility (sec)",       key: "best_time",            cur: d.agilityTime,  u: " sec", h: false },
  ];

  // Map each row to the exact label text written by buildNote
  const parseKeyMap = {
    "Weeks Post-Op": ["weeks post-op"],
    [`Flex ${inv} (°)`]: [`knee flexion - ${inv.toLowerCase()}`],
    [`Flex ${uninv} (°)`]: [`knee flexion - ${uninv.toLowerCase()}`],
    [`Ext ${inv} (°)`]: [`knee extension - ${inv.toLowerCase()}`],
    "Girth Asymmetry (%)": ["girth asymmetry"],
    [`KE Strength ${inv} (lbs)`]: [`ke strength ${inv.toLowerCase()}`, `${inv.toLowerCase()}`],
    "KE LSI (%)": ["limb symmetry index"],
    "Quadriceps Index (%)": ["quadriceps index"],
    "Squat LSI (%)": ["lsi"],
    "CMJ Jump Height (cm)": ["jump height (impulse-derived)"],
    [`SLDJ RSI ${inv}`]: [`rsi - ${inv.toLowerCase()}`],
    "Y-Balance Composite Right (%)": ["composite score", "right composite"],
    "Y-Balance Composite Left (%)": ["composite score", "left composite"],
    "Single Hop LSI (%)": ["single hop for distance", "single hop lsi"],
    "Triple Hop LSI (%)": ["triple hop for distance", "triple hop lsi"],
    "Crossover Hop LSI (%)": ["crossover hop for distance", "crossover hop lsi"],
    "6m Timed Hop LSI (%)": ["6-meter timed hop", "6m timed hop lsi"],
    "Pro Agility (sec)": ["best time", "pro agility"],
  };

  const getOld = (row) => {
    if (!parsed) return null;
    const searchKeys = parseKeyMap[row.label] || [row.label.toLowerCase()];
    for (const [k, v] of Object.entries(parsed)) {
      const kl = k.toLowerCase();
      for (const sk of searchKeys) {
        if (kl.includes(sk)) {
          // extract the numeric part — look for a number in the value
          const match = v.match(/(\d+\.?\d*)/);
          if (match) return match[1];
          return v;
        }
      }
    }
    return null;
  };

  const generateParagraph = () => {
    const rowsWithOld = rows.map(r => ({ ...r, oldVal: getOld(r) }));
    const para = buildCompareParagraph(rowsWithOld, inv, d.patient.weeksPostOp, d.patient.graftType);
    setParagraph(para);
  };

  const copyPara = () => {
    navigator.clipboard.writeText(paragraph).then(() => {
      setCopiedPara(true);
      setTimeout(() => setCopiedPara(false), 2500);
    });
  };

  return (
    <div>
      <Card title="Paste Previous Objective Data" accent>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>Paste a previous SOAP note objective section. Fields are matched automatically by label name.</div>
        <textarea style={{ ...inp, height: 180, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}
          placeholder={"Paste previous objective data here...\n\nExample:\nWeeks Post-Op: 12\nKnee Flexion Right: 118 degrees\nKE Strength Left: 42 lbs\nLimb Symmetry Index: 67%"}
          value={oldText} onChange={e => setOldText(e.target.value)} />
        <button onClick={() => { if (!oldText.trim()) { setParseMsg("Paste data first."); return; } const p = parseOldNote(oldText); setParsed(p); setParseMsg(`✓ Loaded — ${Object.keys(p).length} fields detected`); }}
          style={{ marginTop: 10, padding: "10px 24px", borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", background: LIME, color: BLACK, border: "none" }}>
          Load Previous Data
        </button>
        {parseMsg && <div style={{ color: parseMsg.startsWith("✓") ? LIME : RED_BAD, fontSize: 12, marginTop: 8, fontWeight: 700 }}>{parseMsg}</div>}
      </Card>

      <Card title="Side-by-Side Comparison">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 50px", gap: 8, marginBottom: 10, padding: "0 6px" }}>
          {["Measure","Previous","Current",""].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</div>)}
        </div>
        {rows.map((row, i) => {
          const oldVal = getOld(row), cur = row.cur;
          const higher = row.h;
          const arrow = (oldVal && cur && higher !== null) ? chgArrow(cur, oldVal, higher) : (oldVal && cur ? "~" : "—");
          const arrowColor = (oldVal && cur && higher !== null) ? chgColor(cur, oldVal, higher) : MUTED;
          return (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 50px", gap: 8, alignItems: "center", padding: "8px 6px", borderRadius: 6, background: i % 2 === 0 ? "#111" : "transparent", marginBottom: 2 }}>
              <div style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>{row.label}</div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: MUTED,  textAlign: "center" }}>{oldVal ? oldVal + (row.u || "") : "—"}</div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: WHITE,  textAlign: "center", fontWeight: 700 }}>{cur ? cur + (row.u || "") : "—"}</div>
              <div style={{ textAlign: "center", fontSize: 18, fontWeight: 900, color: arrowColor }}>{arrow}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 12, padding: "10px 16px", background: "#0f0f0f", borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["▲ Improvement",LIME],["= No Change",GOLD],["▼ Regression",RED_BAD],["~ Neutral",MUTED]].map(([l,c]) => (
            <span key={l} style={{ fontSize: 11, fontWeight: 700, color: c }}>■ {l}</span>
          ))}
        </div>
      </Card>

      {/* Rule-based progress paragraph */}
      <Card title="Progress Summary — Copy to Documentation" accent>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>
          Generates a structured clinical paragraph from your comparison data. No AI required — built from the values in the table above. Load previous data first for a full comparison.
        </div>
        <button onClick={generateParagraph} style={{ padding: "12px 32px", borderRadius: 10, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", background: LIME, color: BLACK, border: "none", marginBottom: 14 }}>
          Generate Progress Paragraph
        </button>
        {paragraph && (
          <div style={{ background: "#0f0f0f", borderRadius: 10, border: `1px solid ${LIME}44`, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: LIME + "12", borderBottom: `1px solid ${LIME}22` }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: LIME, letterSpacing: "0.15em", textTransform: "uppercase" }}>Assessment — Progress Note</span>
              <button onClick={copyPara} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", background: copiedPara ? "#15803d" : LIME, color: BLACK, border: "none" }}>
                {copiedPara ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ padding: 20, color: "#d4faa6", fontSize: 13, lineHeight: 1.9 }}>{paragraph}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── TAB 3: PROGRESSION CRITERIA ─────────────────────────────────────────────
function Tab3({ currentData: d }) {
  const invR = d.patient.involvedSide === "Right";
  const torRnm = calcTorqueNm(d.forceR, d.tibLen);
  const torLnm = calcTorqueNm(d.forceL, d.tibLen);
  const normInv = invR ? calcNorm(torRnm, d.bw) : calcNorm(torLnm, d.bw);
  const keLSI = invR ? calcLSI(d.keR, d.keL) : calcLSI(d.keL, d.keR);
  const wks = toNum(d.patient.weeksPostOp);

  const met70  = (v) => v !== null ? parseFloat(v) >= 70  : null;
  const met80  = (v) => v !== null ? parseFloat(v) >= 80  : null;
  const metNm  = (v) => v !== null ? parseFloat(v) >= 1.5 : null;
  const metWks = (n) => wks > 0 ? wks >= n : null;

  const phases = [
    { label: "Return to Running", timeRange: "Weeks 10–14", color: BLUE, logic: "or",
      criteria: [
        { text: "KE LSI ≥ 70%", detail: keLSI !== null ? `Current: ${keLSI}%` : "KE strength not entered", met: met70(keLSI) },
        { text: "OR Normalized torque ≥ 1.5 Nm/kg", detail: normInv !== null ? `Current: ${normInv} Nm/kg` : "Requires BW + tibial length + force", met: metNm(normInv), isOr: true },
      ]},
    { label: "Phase 1 Plyometrics", timeRange: "Weeks 10–14", color: LIME,
      criteria: [
        { text: "KE LSI ≥ 70%", detail: keLSI !== null ? `Current: ${keLSI}%` : "KE strength not entered", met: met70(keLSI) },
        { text: "Weeks post-op ≥ 10", detail: wks > 0 ? `Current: ${wks} weeks` : "Weeks not entered", met: metWks(10) },
      ]},
    { label: "Phase 2 Plyometrics", timeRange: "Weeks 15–18", color: GOLD,
      criteria: [
        { text: "KE LSI ≥ 80%", detail: keLSI !== null ? `Current: ${keLSI}%` : "KE strength not entered", met: met80(keLSI) },
        { text: "Weeks post-op ≥ 15", detail: wks > 0 ? `Current: ${wks} weeks` : "Weeks not entered", met: metWks(15) },
      ]},
    { label: "Phase 3 Plyometrics", timeRange: "Weeks 19–22", color: "#f97316",
      criteria: [
        { text: "All Phase 2 criteria met", detail: "LSI ≥ 80% and ≥ 15 weeks", met: (() => { const a=met80(keLSI), b=metWks(15); return a===null||b===null?null:a&&b; })() },
        { text: "Weeks post-op ≥ 19", detail: wks > 0 ? `Current: ${wks} weeks` : "Weeks not entered", met: metWks(19) },
      ]},
    { label: "Phase 4 Plyometrics", timeRange: "Weeks 23–29", color: RED_BAD,
      criteria: [
        { text: "All Phase 3 criteria met", detail: "Phase 2 criteria + ≥ 19 weeks", met: (() => { const a=met80(keLSI), b=metWks(19); return a===null||b===null?null:a&&b; })() },
        { text: "Weeks post-op ≥ 23", detail: wks > 0 ? `Current: ${wks} weeks` : "Weeks not entered", met: metWks(23) },
      ]},
  ];

  const phaseStatus = (ph) => {
    if (ph.logic === "or") {
      const vals = ph.criteria.map(c => c.met);
      if (vals.every(v => v === null)) return null;
      if (vals.some(v => v === true)) return true;
      return false;
    }
    if (ph.criteria.every(c => c.met === null)) return null;
    return ph.criteria.every(c => c.met === true);
  };

  const Icon = ({ met }) => (
    <span style={{ fontSize: 20, color: met === null ? MUTED : met ? LIME : RED_BAD, flexShrink: 0 }}>
      {met === null ? "○" : met ? "✓" : "✗"}
    </span>
  );

  return (
    <div>
      <Card title="Rehabilitation Progression Criteria" accent>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 20, lineHeight: 1.7 }}>
          Evaluates progression readiness based on data from the Testing tab. ✓ = criteria met. ✗ = not yet met. ○ = data not entered.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 24 }}>
          {phases.map(ph => {
            const s = phaseStatus(ph);
            return (
              <div key={ph.label} style={{ textAlign: "center", padding: "14px 6px", borderRadius: 10, background: s === true ? ph.color + "18" : "#111", border: `2px solid ${s === true ? ph.color : s === false ? RED_BAD + "55" : BORDER}` }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s === null ? "○" : s ? "✓" : "✗"}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: s === true ? ph.color : s === false ? RED_BAD : MUTED, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.3 }}>{ph.label}</div>
              </div>
            );
          })}
        </div>
        {phases.map(ph => {
          const s = phaseStatus(ph);
          return (
            <div key={ph.label} style={{ marginBottom: 12, borderRadius: 10, overflow: "hidden", border: `1px solid ${s === true ? ph.color + "55" : BORDER}`, background: s === true ? ph.color + "08" : "#111" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: ph.color }}>{ph.label}</span>
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 10 }}>{ph.timeRange}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s === true ? LIME : s === false ? RED_BAD : MUTED }}>{s === true ? "CRITERIA MET" : s === false ? "NOT YET MET" : "DATA NEEDED"}</span>
                  <Icon met={s} />
                </div>
              </div>
              {ph.criteria.map((c, ci) => (
                <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", borderBottom: ci < ph.criteria.length - 1 ? `1px solid ${BORDER}33` : "none" }}>
                  <Icon met={c.met} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.isOr ? BLUE : WHITE }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ padding: "12px 16px", background: "#0f0f0f", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
          These thresholds guide clinical decision-making. Time ranges are approximate. Final progression decisions should be made by the treating therapist in coordination with the surgeon.
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 4: PHYSICIAN LETTER ──────────────────────────────────────────────────
function Tab4({ currentData: d }) {
  const [ptName,       setPtName]     = useState("");
  const [therapistName,setTherapist]  = useState("");
  const [clinic,       setClinic]     = useState("Train Recover Move");
  const [impression,   setImpression] = useState("");
  const [letter,       setLetter]     = useState("");
  const [copied,       setCopied]     = useState(false);

  const generate = () => setLetter(buildLetter(d, ptName, therapistName, clinic, impression));
  const copy = () => {
    navigator.clipboard.writeText(letter).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <div>
      <Card title="Letter Settings" accent>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>
          All testing data is pulled from Tab 1 automatically. Only sections with entered data will appear. Fill in your clinical impression below — that is the only section requiring manual input.
        </div>
        <R3>
          <Field label="Patient Name"                type="text" value={ptName}         onChange={setPtName}    placeholder="Full name"           step={null} />
          <Field label="Therapist Name + Credentials" type="text" value={therapistName}  onChange={setTherapist} placeholder="Jane Smith, DPT, SCS" step={null} />
          <Field label="Clinic / Organization"       type="text" value={clinic}         onChange={setClinic}    placeholder="Train Recover Move"   step={null} />
        </R3>
        <div style={{ fontSize: 11, color: MUTED, marginTop: -4 }}>Surgeon name is carried automatically from the Testing tab.</div>
      </Card>

      <Card title="Clinical Impression">
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>
          Write 2–4 sentences summarizing your clinical interpretation: overall trajectory, specific deficits that remain, and your recommendation regarding return-to-sport readiness. This is the only manual section.
        </div>
        <textarea
          style={{ ...inp, height: 130, resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
          placeholder="e.g. Patient continues to demonstrate meaningful progress in quadriceps strength symmetry, with KE LSI improving from 67% to 81% over the past 6 weeks. However, strength values remain below the 90% LSI threshold required for return-to-sport clearance, and functional hop testing reflects persistent asymmetry on the involved limb. We plan to advance through Phase 3 plyometric training and repeat formal testing in 6 weeks prior to sport-specific clearance consideration."
          value={impression}
          onChange={e => setImpression(e.target.value)}
        />
      </Card>

      <button onClick={generate} style={{ width: "100%", padding: 16, borderRadius: 12, fontSize: 13, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: `linear-gradient(135deg,${LIME},${LIME_DIM})`, color: BLACK, border: "none", boxShadow: `0 8px 32px ${LIME}44`, marginBottom: 20 }}>
        ⬇ Build Physician Letter
      </button>

      {letter && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${LIME}44`, marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: LIME + "14", borderBottom: `1px solid ${LIME}33` }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: LIME, letterSpacing: "0.15em", textTransform: "uppercase" }}>Physician Communication Letter</span>
            <button onClick={copy} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: copied ? "#15803d" : LIME, color: BLACK, border: "none" }}>
              {copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
          </div>
          <pre style={{ padding: 24, background: "#0a0a0a", color: "#d4faa6", fontSize: 13, fontFamily: "inherit", lineHeight: 1.9, whiteSpace: "pre-wrap", margin: 0, maxHeight: 600, overflowY: "auto" }}>{letter}</pre>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    patient: { date: "", surgeon: "", graftType: "", weeksPostOp: "", involvedSide: "Left" },
    bw: "", tibLen: "", limbLen: "",
    flexR: "", flexL: "", extR: "", extL: "",
    girth: { r5: "", r10: "", r15: "", l5: "", l10: "", l15: "" },
    keR: "", keL: "", forceR: "", forceL: "",
    valdSquat: {}, valdCMJ: {}, valdSLDJ: {},
    yBalance: { rAnt: "", rPM: "", rPL: "", lAnt: "", lPM: "", lPL: "" },
    hops: {
      singleI: [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      singleU: [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      tripleI: [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      tripleU: [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      crossI:  [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      crossU:  [{ft:"",in:""},{ft:"",in:""},{ft:"",in:""}],
      timedI:  [{sec:""},{sec:""},{sec:""}],
      timedU:  [{sec:""},{sec:""},{sec:""}],
    },
    agilityTime: "",
    noteText: "", copied: false,
  });

  const tabs = [
    { label: "Testing",     sub: "Outcome Measures" },
    { label: "Comparison",  sub: "Progress Tracking" },
    { label: "Progression", sub: "Phase Criteria" },
    { label: "Letter",      sub: "Physician Communication" },
  ];

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: WHITE, fontFamily: "'Inter','Helvetica Neue',sans-serif" }}>
      <div style={{ background: DARK, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "'Arial Black',Impact,sans-serif", fontSize: 28, fontWeight: 900, color: WHITE, letterSpacing: "-1px" }}>TRM</span>
              <span style={{ color: BORDER, fontSize: 18 }}>|</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#777", letterSpacing: "0.08em", textTransform: "uppercase" }}>ACL Testing & Outcome Measures</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>Involved:</span>
              <SideToggle value={data.patient.involvedSide} onChange={v => setData(p => ({ ...p, patient: { ...p.patient, involvedSide: v } }))} />
            </div>
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${BORDER}` }}>
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{ padding: "10px 22px", background: "transparent", border: "none", borderBottom: `3px solid ${activeTab === i ? LIME : "transparent"}`, cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: activeTab === i ? LIME : "#666" }}>{t.label}</div>
                <div style={{ fontSize: 9, color: activeTab === i ? LIME + "88" : "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {activeTab === 0 && <Tab1 data={data} setData={setData} />}
        {activeTab === 1 && <Tab2 currentData={data} />}
        {activeTab === 2 && <Tab3 currentData={data} />}
        {activeTab === 3 && <Tab4 currentData={data} />}
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 20px", textAlign: "center" }}>
        <span style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, color: WHITE, fontSize: 13 }}>TRM</span>
        <span style={{ color: MUTED, fontSize: 11, marginLeft: 10 }}>ACL Rehabilitation Testing Tool — Not a substitute for clinical judgment</span>
      </div>
    </div>
  );
}
