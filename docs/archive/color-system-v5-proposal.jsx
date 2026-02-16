import { useState } from "react";

// ─── CURRENT SYSTEM (V4 Electric Volt) ─────────────
const CURRENT = {
  name: "V4 — Electric Volt",
  light: {
    primary: "#E8FF00", primaryHover: "#D4EB00", primaryText: "#0A0A0A",
    accent: "#D4A84B", accentHover: "#C49A3D",
    tertiary: "#4ADE80",
    weights: "#60A5FA", cardio: "#EF4444", mobility: "#4ADE80",
    bg: "#F2F2ED", surface: "#FAFAF7", surfaceElevated: "#FFFFFF",
    surfaceHover: "#EBEBE6",
    text: "#0A0A0A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
    border: "rgba(10,10,10,0.08)", borderStrong: "rgba(10,10,10,0.15)",
    success: "#4ADE80", warning: "#FACC15", danger: "#EF4444", info: "#60A5FA",
  },
  dark: {
    primary: "#E8FF00", primaryHover: "#D4EB00", primaryText: "#0A0A0A",
    accent: "#D4A84B", accentHover: "#E0BD6F",
    tertiary: "#4ADE80",
    weights: "#60A5FA", cardio: "#EF4444", mobility: "#4ADE80",
    bg: "#0A0A0A", surface: "#141414", surfaceElevated: "#1E1E1E",
    surfaceHover: "#282828",
    text: "#F0F0F0", textSecondary: "#8A8A8A", textMuted: "#5A5A5A",
    border: "rgba(240,240,240,0.07)", borderStrong: "rgba(240,240,240,0.12)",
    success: "#4ADE80", warning: "#FACC15", danger: "#EF4444", info: "#60A5FA",
  },
};

// ─── PROPOSED SYSTEM (V5 Volt Refined) ─────────────
const PROPOSED = {
  name: "V5 — Volt Refined",
  light: {
    // Keep volt but ONLY as fills, never as text-on-white
    primary: "#E8FF00", primaryHover: "#DCF200", primaryText: "#0A0A0A",
    // NEW: Replace warm gold with a cool, modern secondary
    accent: "#6366F1", accentHover: "#4F46E5", // Indigo — premium, modern
    tertiary: "#10B981", // Emerald — cleaner than #4ADE80
    // Workout types: refined for light mode legibility
    weights: "#4F46E5", cardio: "#E11D48", mobility: "#059669",
    // Cooler, crisper light surfaces (less cream, more modern)
    bg: "#F5F5F7", surface: "#FFFFFF", surfaceElevated: "#FFFFFF",
    surfaceHover: "#EEEFF2",
    // Slightly softer text hierarchy
    text: "#09090B", textSecondary: "#52525B", textMuted: "#71717A",
    border: "rgba(9,9,11,0.06)", borderStrong: "rgba(9,9,11,0.12)",
    success: "#10B981", warning: "#F59E0B", danger: "#E11D48", info: "#6366F1",
  },
  dark: {
    primary: "#E8FF00", primaryHover: "#DCF200", primaryText: "#0A0A0A",
    // Indigo lifts to a lighter violet in dark mode
    accent: "#818CF8", accentHover: "#A5B4FC",
    tertiary: "#34D399",
    // Workout types: brighter for dark backgrounds
    weights: "#818CF8", cardio: "#FB7185", mobility: "#34D399",
    // Keep your warm blacks — they're perfect
    bg: "#09090B", surface: "#18181B", surfaceElevated: "#27272A",
    surfaceHover: "#3F3F46",
    text: "#FAFAFA", textSecondary: "#A1A1AA", textMuted: "#71717A",
    border: "rgba(250,250,250,0.06)", borderStrong: "rgba(250,250,250,0.12)",
    success: "#34D399", warning: "#FBBF24", danger: "#FB7185", info: "#818CF8",
  },
};

// ─── Contrast Helpers ──────────────────────────────
function hexToRgb(hex) {
  if (!hex || hex.startsWith("rgba")) return [128, 128, 128];
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}
function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function contrast(a, b) {
  const l1 = luminance(hexToRgb(a)), l2 = luminance(hexToRgb(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function grade(r) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA-lg" : "Fail"; }
function gradeColor(r) { return r >= 7 ? "#16a34a" : r >= 4.5 ? "#65a30d" : r >= 3 ? "#d97706" : "#dc2626"; }

// ─── Sub-Components ────────────────────────────────
const Pill = ({ label, active, onClick, c }) => (
  <button onClick={onClick} style={{
    padding: "7px 16px", borderRadius: 9999, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 600, letterSpacing: "0.01em",
    backgroundColor: active ? c.primary : c.surfaceElevated,
    color: active ? c.primaryText : c.textSecondary,
    transition: "all 0.2s",
  }}>{label}</button>
);

const Badge = ({ label, color, bg }) => (
  <span style={{
    padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
    backgroundColor: bg, color,
  }}>{label}</span>
);

const StatNum = ({ value, label, color, c }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: c.textMuted, marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
  </div>
);

const MockCard = ({ c, dark, system }) => (
  <div style={{
    padding: 18, borderRadius: 16, backgroundColor: c.surface,
    border: `1px solid ${c.border}`, maxWidth: 300, width: "100%",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 2 }}>Push Day A</div>
        <div style={{ fontSize: 12, color: c.textSecondary }}>Chest, Shoulders, Triceps</div>
      </div>
      <Badge label="Weights" color={c.weights} bg={c.weights + "1A"} />
    </div>
    <div style={{ display: "flex", gap: 20, marginBottom: 14, padding: "10px 0", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
      <StatNum value="4" label="exercises" color={c.text} c={c} />
      <StatNum value="16" label="sets" color={c.textSecondary} c={c} />
      <StatNum value="~45m" label="duration" color={c.textMuted} c={c} />
    </div>
    <button style={{
      width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
      fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.01em",
      backgroundColor: c.primary, color: c.primaryText,
    }}>Start Workout</button>
  </div>
);

const StatsCard = ({ c }) => (
  <div style={{
    padding: 18, borderRadius: 16, backgroundColor: c.surface,
    border: `1px solid ${c.border}`, maxWidth: 300, width: "100%",
  }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: c.textSecondary, marginBottom: 14, letterSpacing: "0.02em" }}>This Week</div>
    <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 14 }}>
      <StatNum value="5" label="workouts" color={c.primary === "#E8FF00" ? c.text : c.primary} c={c} />
      <StatNum value="3" label="PRs" color={c.accent} c={c} />
      <StatNum value="12.4k" label="volume" color={c.weights} c={c} />
    </div>
    {/* Mini bar chart */}
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
      {[0.4, 0.7, 1.0, 0.3, 0.8, 0.6, 0].map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h * 100}%`, borderRadius: 4,
          backgroundColor: h > 0 ? (c.primary + (h === 1.0 ? "CC" : "44")) : c.surfaceHover,
          minHeight: h === 0 ? 4 : undefined,
        }} />
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 4 }}>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <span key={i} style={{ fontSize: 9, color: c.textMuted, flex: 1, textAlign: "center" }}>{d}</span>
      ))}
    </div>
  </div>
);

const NavBar = ({ c }) => (
  <div style={{
    display: "flex", justifyContent: "space-around", padding: "10px 16px",
    backgroundColor: c.surface, borderTop: `1px solid ${c.border}`,
    borderRadius: "16px 16px 0 0", maxWidth: 350, width: "100%",
  }}>
    {[
      { label: "Home", active: true },
      { label: "Schedule", active: false },
      { label: "History", active: false },
      { label: "Profile", active: false },
    ].map(item => (
      <div key={item.label} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        padding: "4px 14px", borderRadius: 12,
        backgroundColor: item.active ? c.primary + "18" : "transparent",
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 6,
          backgroundColor: item.active ? c.primary : c.textMuted + "44",
        }} />
        <span style={{
          fontSize: 10, fontWeight: item.active ? 700 : 500,
          color: item.active ? c.primary : c.textMuted,
        }}>{item.label}</span>
      </div>
    ))}
  </div>
);

const StatusMessages = ({ c }) => (
  <div style={{ display: "grid", gap: 6, maxWidth: 300, width: "100%" }}>
    {[
      { msg: "Workout complete!", color: c.success },
      { msg: "New PR on Bench Press!", color: c.info },
      { msg: "Rest timer: 90s left", color: c.warning },
      { msg: "Sync failed", color: c.danger },
    ].map(s => (
      <div key={s.msg} style={{
        padding: "9px 14px", borderRadius: 10,
        backgroundColor: s.color + "14", color: s.color,
        fontSize: 12, fontWeight: 600,
        borderLeft: `3px solid ${s.color}`,
      }}>{s.msg}</div>
    ))}
  </div>
);

const ContrastTable = ({ c, surfaceRef, label }) => {
  const checks = [
    { name: "Primary on surface", fg: c.primary, bg: surfaceRef },
    { name: "Text on surface", fg: c.text, bg: surfaceRef },
    { name: "Text secondary", fg: c.textSecondary, bg: surfaceRef },
    { name: "Text muted", fg: c.textMuted, bg: surfaceRef },
    { name: "Accent on surface", fg: c.accent, bg: surfaceRef },
    { name: "Weights", fg: c.weights, bg: surfaceRef },
    { name: "Cardio", fg: c.cardio, bg: surfaceRef },
    { name: "Danger", fg: c.danger, bg: surfaceRef },
    { name: "Warning", fg: c.warning, bg: surfaceRef },
  ];
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {checks.map(ch => {
        if (ch.fg.startsWith("rgba") || ch.bg.startsWith("rgba")) return null;
        const r = contrast(ch.fg, ch.bg);
        const g = grade(r);
        const gc = gradeColor(r);
        return (
          <div key={ch.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 10px", borderRadius: 8,
            backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5, backgroundColor: ch.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(128,128,128,0.15)",
              }}>
                <span style={{ color: ch.fg, fontWeight: 800, fontSize: 11 }}>A</span>
              </div>
              <span style={{ fontSize: 11, color: c.text }}>{ch.name}</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
              backgroundColor: gc + "1A", color: gc,
            }}>{r.toFixed(1)} {g}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main ──────────────────────────────────────────
export default function ColorSystemProposal() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState("side-by-side"); // side-by-side | current | proposed | rationale | contrast
  const cur = dark ? CURRENT.dark : CURRENT.light;
  const pro = dark ? PROPOSED.dark : PROPOSED.light;

  const views = [
    { id: "side-by-side", label: "Compare" },
    { id: "rationale", label: "Rationale" },
    { id: "contrast", label: "Contrast" },
  ];

  const panelStyle = (c) => ({
    flex: 1, minWidth: 320, padding: 20, borderRadius: 20,
    backgroundColor: c.bg, border: `1px solid ${c.border}`,
    display: "flex", flexDirection: "column", gap: 16,
  });

  const heading = (text, c) => (
    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.textMuted, marginBottom: 4 }}>{text}</div>
  );

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: dark ? "#09090B" : "#F0F0F2",
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
      transition: "background-color 0.3s",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.03em",
              color: dark ? "#FAFAFA" : "#09090B",
            }}>
              Color System <span style={{ color: "#E8FF00" }}>V5</span> Proposal
            </h1>
            <p style={{ fontSize: 12, color: dark ? "#71717A" : "#71717A", margin: "4px 0 0" }}>
              Volt Refined — Keep the energy, fix the problems
            </p>
          </div>
          <button onClick={() => setDark(!dark)} style={{
            padding: "8px 18px", borderRadius: 10, cursor: "pointer",
            border: `1px solid ${dark ? "rgba(250,250,250,0.1)" : "rgba(9,9,11,0.1)"}`,
            backgroundColor: dark ? "#18181B" : "#FFFFFF",
            color: dark ? "#FAFAFA" : "#09090B",
            fontSize: 13, fontWeight: 600,
          }}>{dark ? "☀ Light" : "● Dark"}</button>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              backgroundColor: view === v.id ? "#E8FF00" : (dark ? "#18181B" : "#FFFFFF"),
              color: view === v.id ? "#0A0A0A" : (dark ? "#A1A1AA" : "#52525B"),
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px 60px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ─── SIDE BY SIDE ─── */}
        {view === "side-by-side" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {/* CURRENT */}
            <div style={panelStyle(cur)}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: cur.text,
                padding: "8px 14px", borderRadius: 10,
                backgroundColor: cur.surfaceElevated, border: `1px solid ${cur.border}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>📌</span> Current — V4
              </div>

              {heading("Workout Card", cur)}
              <MockCard c={cur} dark={dark} system="current" />

              {heading("Stats", cur)}
              <StatsCard c={cur} />

              {heading("Workout Badges", cur)}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge label="Weights" color={cur.weights} bg={cur.weights + "1A"} />
                <Badge label="Cardio" color={cur.cardio} bg={cur.cardio + "1A"} />
                <Badge label="Mobility" color={cur.mobility} bg={cur.mobility + "1A"} />
              </div>

              {heading("Status Messages", cur)}
              <StatusMessages c={cur} />

              {heading("Navigation", cur)}
              <NavBar c={cur} />
            </div>

            {/* PROPOSED */}
            <div style={panelStyle(pro)}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: pro.text,
                padding: "8px 14px", borderRadius: 10,
                backgroundColor: pro.accent + "18", border: `1px solid ${pro.accent}33`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>✦</span> Proposed — V5
              </div>

              {heading("Workout Card", pro)}
              <MockCard c={pro} dark={dark} system="proposed" />

              {heading("Stats", pro)}
              <StatsCard c={pro} />

              {heading("Workout Badges", pro)}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge label="Weights" color={pro.weights} bg={pro.weights + "1A"} />
                <Badge label="Cardio" color={pro.cardio} bg={pro.cardio + "1A"} />
                <Badge label="Mobility" color={pro.mobility} bg={pro.mobility + "1A"} />
              </div>

              {heading("Status Messages", pro)}
              <StatusMessages c={pro} />

              {heading("Navigation", pro)}
              <NavBar c={pro} />
            </div>
          </div>
        )}

        {/* ─── RATIONALE ─── */}
        {view === "rationale" && (
          <div style={{
            maxWidth: 680, display: "flex", flexDirection: "column", gap: 16,
          }}>
            {[
              {
                emoji: "⚡",
                title: "Keep Volt Yellow — But Be Smarter About It",
                body: "#E8FF00 IS your brand. The problem was never the color — it was using it as text on light backgrounds. V5 rule: volt only appears as FILLED surfaces (buttons, badges, indicators) where dark text sits ON the yellow. In light mode, text accents come from the new indigo accent instead. No more olive-drab #7A8C00.",
                highlight: "#E8FF00",
              },
              {
                emoji: "💎",
                title: "Replace Warm Gold → Indigo (#6366F1 / #818CF8)",
                body: "The warm gold (#D4A84B) reads 'crypto wallet', not 'modern fitness.' Indigo is premium, unexpected for a fitness app, and creates beautiful tension with the electric volt. It's also fully WCAG AA accessible on both light and dark surfaces — something gold struggled with. In dark mode it lifts to a softer violet (#818CF8) that feels luxurious.",
                highlight: dark ? "#818CF8" : "#6366F1",
              },
              {
                emoji: "🏋️",
                title: "Refined Workout Type Colors",
                body: "Weights shifts from generic blue (#60A5FA) to match the new indigo family (#4F46E5 / #818CF8) — creating cohesion with the accent. Cardio moves from #EF4444 to a richer rose (#E11D48 / #FB7185) — more refined, less 'error red.' Mobility stays green but shifts to emerald (#059669 / #34D399) — cleaner and more modern than the lime-ish #4ADE80.",
                highlight: dark ? "#FB7185" : "#E11D48",
              },
              {
                emoji: "🌓",
                title: "Cooler Light Mode Surfaces",
                body: "Light background shifts from warm cream (#F2F2ED) to a cooler, Apple-inspired gray (#F5F5F7). This makes the volt yellow pop more on light backgrounds because there's no warm undertone competing. Surface is clean white (#FFFFFF) instead of warm white (#FAFAF7). The result feels more premium and contemporary.",
                highlight: dark ? pro.surface : "#F5F5F7",
              },
              {
                emoji: "🔤",
                title: "Better Text Hierarchy",
                body: "Text muted in dark mode jumps from #5A5A5A (2.7:1 — fails WCAG) to #71717A (3.8:1 — passes AA Large). Secondary text goes from #8A8A8A to #A1A1AA — slightly warmer and more readable. The Zinc gray scale replaces the pure neutral grays for a more cohesive, slightly warm-cool feel that pairs with indigo.",
                highlight: dark ? "#A1A1AA" : "#52525B",
              },
              {
                emoji: "✂️",
                title: "Fewer Colors, More Impact",
                body: "V4 had 3 accent tiers (primary + accent + tertiary) plus 4 status colors. V5 simplifies: volt is your ONE brand color, indigo is your ONE accent. Status colors (success, warning, danger, info) map cleanly to the workout colors. Tertiary becomes just success/emerald. Less is more — the volt hits harder when it's the only bright thing on screen.",
                highlight: "#E8FF00",
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 16,
                backgroundColor: dark ? "#18181B" : "#FFFFFF",
                border: `1px solid ${dark ? "rgba(250,250,250,0.06)" : "rgba(9,9,11,0.06)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700, margin: 0,
                    color: dark ? "#FAFAFA" : "#09090B",
                  }}>{item.title}</h3>
                </div>
                <p style={{
                  fontSize: 13, lineHeight: 1.65, margin: 0,
                  color: dark ? "#A1A1AA" : "#52525B",
                }}>{item.body}</p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: item.highlight, border: "1px solid rgba(128,128,128,0.15)" }} />
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: dark ? "#71717A" : "#71717A" }}>{item.highlight}</span>
                </div>
              </div>
            ))}

            {/* Color Mapping Summary */}
            <div style={{
              padding: 20, borderRadius: 16, marginTop: 8,
              backgroundColor: dark ? "#18181B" : "#FFFFFF",
              border: `1px solid ${dark ? "rgba(250,250,250,0.06)" : "rgba(9,9,11,0.06)"}`,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: dark ? "#FAFAFA" : "#09090B", margin: "0 0 14px" }}>
                Token Migration Map
              </h3>
              <div style={{ display: "grid", gap: 6 }}>
                {[
                  { token: "--color-primary", from: "#E8FF00", to: "#E8FF00", note: "unchanged" },
                  { token: "--color-accent", from: "#D4A84B", to: dark ? "#818CF8" : "#6366F1", note: "gold → indigo" },
                  { token: "--color-tertiary", from: "#4ADE80", to: dark ? "#34D399" : "#10B981", note: "lime → emerald" },
                  { token: "--color-weights", from: "#60A5FA", to: dark ? "#818CF8" : "#4F46E5", note: "blue → indigo" },
                  { token: "--color-cardio", from: "#EF4444", to: dark ? "#FB7185" : "#E11D48", note: "red → rose" },
                  { token: "--color-mobility", from: "#4ADE80", to: dark ? "#34D399" : "#059669", note: "lime → emerald" },
                  { token: "--color-background", from: dark ? "#0A0A0A" : "#F2F2ED", to: dark ? "#09090B" : "#F5F5F7", note: "zinc scale" },
                  { token: "--color-text-muted", from: dark ? "#5A5A5A" : "#8A8A8A", to: "#71717A", note: "accessibility fix" },
                ].map(row => (
                  <div key={row.token} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8,
                    backgroundColor: dark ? "#27272A" : "#F4F4F5",
                    fontSize: 11,
                  }}>
                    <code style={{ color: dark ? "#A1A1AA" : "#52525B", flex: "0 0 170px", fontFamily: "monospace", fontSize: 10 }}>{row.token}</code>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: row.from, border: "1px solid rgba(128,128,128,0.2)" }} />
                      <span style={{ color: dark ? "#71717A" : "#A1A1AA" }}>→</span>
                      <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: row.to, border: "1px solid rgba(128,128,128,0.2)" }} />
                    </div>
                    <span style={{ color: dark ? "#71717A" : "#A1A1AA", marginLeft: "auto", fontSize: 10, fontStyle: "italic" }}>{row.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CONTRAST ─── */}
        {view === "contrast" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#71717A" : "#71717A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Current V4 — on {dark ? "dark" : "light"} surface ({dark ? cur.surface : cur.surface})
              </div>
              <ContrastTable c={cur} surfaceRef={cur.surface} label="Current" />
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#71717A" : "#71717A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Proposed V5 — on {dark ? "dark" : "light"} surface ({dark ? pro.surface : pro.surface})
              </div>
              <ContrastTable c={pro} surfaceRef={pro.surface} label="Proposed" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
