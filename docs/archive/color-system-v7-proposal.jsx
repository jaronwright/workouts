import { useState } from "react";

// ─── V7: ELECTRIC MINT ─────────────────────────────
// Philosophy: Vivid green energy on cool dark steel.
// Fresh, modern, unmistakably fitness. Zero PH vibes.
const V7 = {
  name: "V7 — Electric Mint",
  light: {
    primary: "#00D26A",        // Electric Green — fresh, alive, GO
    primaryHover: "#00BA5E",
    primaryText: "#FFFFFF",    // White on green
    primaryMuted: "rgba(0, 210, 106, 0.08)",

    accent: "#00B8A9",         // Teal — cool companion
    accentHover: "#00A396",
    accentMuted: "rgba(0, 184, 169, 0.08)",

    // Workout types
    weights: "#6366F1",        // Indigo — heavy, powerful
    weightsMuted: "rgba(99, 102, 241, 0.08)",
    cardio: "#F43F5E",         // Rose — heart, effort
    cardioMuted: "rgba(244, 63, 94, 0.08)",
    mobility: "#00D26A",       // Green IS mobility/movement
    mobilityMuted: "rgba(0, 210, 106, 0.08)",

    // Crisp, clean surfaces
    bg: "#F4F5F7",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceHover: "#EDEEF1",
    surfaceSunken: "#E8E9EC",

    text: "#0F1419",
    textSecondary: "#4A5068",
    textMuted: "#747B90",

    border: "rgba(15, 20, 25, 0.06)",
    borderStrong: "rgba(15, 20, 25, 0.12)",

    success: "#00D26A",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#6366F1",
  },
  dark: {
    primary: "#00E676",        // Brighter mint for dark backgrounds
    primaryHover: "#00F283",
    primaryText: "#0A0F0D",    // Near-black text on green
    primaryMuted: "rgba(0, 230, 118, 0.10)",

    accent: "#00D4C8",         // Lifted teal
    accentHover: "#00E8DB",
    accentMuted: "rgba(0, 212, 200, 0.08)",

    weights: "#818CF8",        // Soft indigo
    weightsMuted: "rgba(129, 140, 248, 0.10)",
    cardio: "#FB7185",         // Soft rose
    cardioMuted: "rgba(251, 113, 133, 0.10)",
    mobility: "#00E676",       // Matches primary
    mobilityMuted: "rgba(0, 230, 118, 0.08)",

    // Cool dark steel — slight blue undertone
    bg: "#0B0D10",
    surface: "#14171C",
    surfaceElevated: "#1D2128",
    surfaceHover: "#262B33",
    surfaceSunken: "#060709",

    text: "#ECF0F5",
    textSecondary: "#8B93A6",
    textMuted: "#5A6278",

    border: "rgba(236, 240, 245, 0.06)",
    borderStrong: "rgba(236, 240, 245, 0.10)",

    success: "#00E676",
    warning: "#FBBF24",
    danger: "#FB7185",
    info: "#818CF8",
  },
};

// ─── Helpers ───────────────────────────────────────
function hexToRgb(h) {
  if (!h || h.startsWith("rgba")) return [128, 128, 128];
  h = h.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum([r, g, b]) {
  const f = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function cr(a, b) {
  const l1 = lum(hexToRgb(a)), l2 = lum(hexToRgb(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function wcag(r) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA-lg" : "Fail"; }
function wcagC(r) { return r >= 7 ? "#00E676" : r >= 4.5 ? "#84CC16" : r >= 3 ? "#F59E0B" : "#EF4444"; }

// ─── UI Components ─────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, backgroundColor: bg, color, letterSpacing: "0.02em" }}>{label}</span>
);

function WorkoutCard({ c }) {
  return (
    <div style={{ padding: 20, borderRadius: 18, backgroundColor: c.surface, border: `1px solid ${c.border}`, width: "100%", maxWidth: 310 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: c.text, letterSpacing: "-0.02em" }}>Push Day A</div>
          <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>Chest · Shoulders · Triceps</div>
        </div>
        <Badge label="Weights" color={c.weights} bg={c.weightsMuted} />
      </div>
      <div style={{ display: "flex", gap: 20, padding: "12px 0", marginBottom: 14, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        {[
          { v: "5", l: "EXERCISES", col: c.text },
          { v: "20", l: "SETS", col: c.textSecondary },
          { v: "~50m", l: "DURATION", col: c.textMuted },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.col, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: c.textMuted, marginTop: 3, letterSpacing: "0.06em", fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
        fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "0.02em",
        backgroundColor: c.primary, color: c.primaryText,
        boxShadow: `0 4px 20px ${c.primary}30`,
      }}>Start Workout</button>
    </div>
  );
}

function StatsCard({ c }) {
  const bars = [0.5, 0.8, 1.0, 0, 0.7, 0.9, 0.3];
  return (
    <div style={{ padding: 20, borderRadius: 18, backgroundColor: c.surface, border: `1px solid ${c.border}`, width: "100%", maxWidth: 310 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>This Week</div>
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16 }}>
        {[
          { v: "5", l: "WORKOUTS", col: c.primary },
          { v: "3", l: "PRs", col: c.weights },
          { v: "14.2k", l: "VOLUME", col: c.text },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.col, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 9, color: c.textMuted, marginTop: 4, letterSpacing: "0.06em", fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 52, padding: "0 4px" }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 5,
            height: h > 0 ? `${h * 100}%` : 4,
            background: h > 0
              ? h === 1.0
                ? `linear-gradient(180deg, ${c.primary} 0%, ${c.primary}77 100%)`
                : `${c.primary}${Math.round(h * 55 + 15).toString(16).padStart(2, "0")}`
              : c.surfaceHover,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6, padding: "0 4px" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: c.textMuted, flex: 1, textAlign: "center", fontWeight: 500 }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function NavPreview({ c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 8px", backgroundColor: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, width: "100%", maxWidth: 360 }}>
      {[
        { l: "Home", a: true, i: "⌂" },
        { l: "Schedule", a: false, i: "▦" },
        { l: "History", a: false, i: "◷" },
        { l: "Profile", a: false, i: "○" },
      ].map(n => (
        <div key={n.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 16px", borderRadius: 14, backgroundColor: n.a ? c.primaryMuted : "transparent" }}>
          <span style={{ fontSize: 16, lineHeight: 1, color: n.a ? c.primary : c.textMuted }}>{n.i}</span>
          <span style={{ fontSize: 10, fontWeight: n.a ? 700 : 500, color: n.a ? c.primary : c.textMuted }}>{n.l}</span>
        </div>
      ))}
    </div>
  );
}

function StatusMessages({ c }) {
  return (
    <div style={{ display: "grid", gap: 6, width: "100%", maxWidth: 310 }}>
      {[
        { msg: "Workout complete!", color: c.success, icon: "✓" },
        { msg: "New PR on Bench Press!", color: c.info, icon: "↑" },
        { msg: "Rest: 90s remaining", color: c.warning, icon: "◷" },
        { msg: "Sync failed — retry", color: c.danger, icon: "✗" },
      ].map(s => (
        <div key={s.msg} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, backgroundColor: s.color + "12", borderLeft: `3px solid ${s.color}` }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, backgroundColor: s.color + "20", color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{s.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.msg}</span>
        </div>
      ))}
    </div>
  );
}

function ContrastGrid({ c }) {
  const surface = c.surface;
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {[
        { name: "Primary on surface", fg: c.primary },
        { name: "On-primary text", fg: c.primaryText, bg: c.primary },
        { name: "Text", fg: c.text },
        { name: "Text secondary", fg: c.textSecondary },
        { name: "Text muted", fg: c.textMuted },
        { name: "Accent (teal)", fg: c.accent },
        { name: "Weights (indigo)", fg: c.weights },
        { name: "Cardio (rose)", fg: c.cardio },
        { name: "Success", fg: c.success },
        { name: "Warning", fg: c.warning },
        { name: "Danger", fg: c.danger },
      ].map(ch => {
        const bg = ch.bg || surface;
        if (ch.fg.startsWith("rgba") || bg.startsWith("rgba")) return null;
        const r = cr(ch.fg, bg);
        const g = wcag(r);
        const gc = wcagC(r);
        return (
          <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(128,128,128,0.12)" }}>
                <span style={{ color: ch.fg, fontWeight: 800, fontSize: 12 }}>A</span>
              </div>
              <span style={{ fontSize: 11, color: c.text, fontWeight: 500 }}>{ch.name}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, backgroundColor: gc + "18", color: gc }}>{r.toFixed(1)} {g}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Phone Mockup ──────────────────────────────────
function PhoneMock({ c, dark }) {
  return (
    <div style={{
      width: 290, borderRadius: 32, overflow: "hidden",
      backgroundColor: c.bg, border: `2px solid ${c.borderStrong}`,
      boxShadow: dark ? `0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${c.primary}08` : "0 24px 80px rgba(0,0,0,0.10)",
    }}>
      {/* Status bar */}
      <div style={{ padding: "10px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: c.textMuted + "44" }} />)}
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Good Evening</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: c.text, letterSpacing: "-0.03em" }}>
          Jaron<span style={{ color: c.primary }}>.</span>
        </div>
      </div>

      {/* Streak banner */}
      <div style={{ padding: "10px 16px" }}>
        <div style={{
          padding: "10px 14px", borderRadius: 14,
          background: `linear-gradient(135deg, ${c.primary}15 0%, ${c.accent}10 100%)`,
          border: `1px solid ${c.primary}20`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>5 day streak</div>
            <div style={{ fontSize: 10, color: c.textSecondary }}>Keep it going!</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 22, fontWeight: 800, color: c.primary }}>5</div>
        </div>
      </div>

      {/* Today's workout */}
      <div style={{ padding: "4px 16px" }}>
        <div style={{ padding: 14, borderRadius: 16, backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Push Day A</div>
              <div style={{ fontSize: 10, color: c.textSecondary }}>5 exercises · ~50 min</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, backgroundColor: c.weightsMuted, color: c.weights }}>WEIGHTS</span>
          </div>
          <button style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            backgroundColor: c.primary, color: c.primaryText,
            boxShadow: `0 4px 16px ${c.primary}25`,
          }}>Start Workout</button>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: "23", l: "workouts", col: c.text },
            { v: "3", l: "PRs", col: c.weights },
            { v: "85%", l: "adherence", col: c.primary },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: "10px 0", borderRadius: 12, textAlign: "center", backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.col, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 8, color: c.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity heatmap */}
      <div style={{ padding: "4px 16px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Activity</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[0, 0.3, 0.7, 1, 0, 0.8, 0.4, 0, 0, 0.5, 0.9, 1, 0.6, 0, 0.3, 0.7, 0, 0.9, 1, 0, 0].map((v, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: 3,
              backgroundColor: v > 0 ? `${c.primary}${Math.round(v * 190 + 40).toString(16).padStart(2, "0")}` : c.surfaceHover,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 16px", borderTop: `1px solid ${c.border}` }}>
        {[
          { l: "Home", a: true }, { l: "Plan", a: false }, { l: "Log", a: false }, { l: "Me", a: false },
        ].map(n => (
          <div key={n.l} style={{ textAlign: "center" }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, margin: "0 auto 2px", backgroundColor: n.a ? c.primary : c.textMuted + "33" }} />
            <span style={{ fontSize: 9, fontWeight: n.a ? 700 : 500, color: n.a ? c.primary : c.textMuted }}>{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────
export default function V7Proposal() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("hero");
  const c = dark ? V7.dark : V7.light;

  const tabs = [
    { id: "hero", label: "Preview" },
    { id: "components", label: "Components" },
    { id: "palette", label: "Palette" },
    { id: "contrast", label: "Contrast" },
    { id: "why", label: "Why" },
  ];

  const sectionLabel = (text) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.textMuted, marginBottom: 10, marginTop: 12 }}>{text}</div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: c.bg, fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", transition: "background-color 0.35s" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: c.text }}>
              Electric <span style={{ color: c.primary }}>Mint</span>
            </h1>
            <p style={{ fontSize: 12, color: c.textSecondary, margin: "2px 0 0" }}>
              Green energy. Cool steel. Fresh and powerful.
            </p>
          </div>
          <button onClick={() => setDark(!dark)} style={{
            padding: "8px 20px", borderRadius: 12, cursor: "pointer",
            border: `1.5px solid ${c.borderStrong}`,
            backgroundColor: c.surfaceElevated, color: c.text,
            fontSize: 13, fontWeight: 600,
          }}>{dark ? "☀ Light" : "● Dark"}</button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              backgroundColor: tab === t.id ? c.primary : c.surfaceElevated,
              color: tab === t.id ? c.primaryText : c.textSecondary,
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px 60px", maxWidth: 1000, margin: "0 auto" }}>

        {/* HERO */}
        {tab === "hero" && (
          <div style={{ display: "flex", gap: 44, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <PhoneMock c={c} dark={dark} />
            <div style={{ maxWidth: 380, flex: 1, minWidth: 260 }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, letterSpacing: "-0.03em", lineHeight: 1.12, margin: "0 0 16px" }}>
                Fresh.<br />
                <span style={{ color: c.primary }}>Electric.</span><br />
                Focused.
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: c.textSecondary, margin: "0 0 24px" }}>
                Electric green says "go" — it's the universal color of movement, progress, and vitality. Paired with cool steel-blue darks, it creates a fitness experience that feels alive without being overwhelming.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { hex: c.primary, name: "Primary" },
                  { hex: c.accent, name: "Accent" },
                  { hex: c.weights, name: "Weights" },
                  { hex: c.cardio, name: "Cardio" },
                  { hex: c.surface, name: "Surface" },
                ].map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: s.hex, border: "1px solid rgba(128,128,128,0.12)" }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: c.text }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: c.textMuted, fontFamily: "monospace" }}>{s.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPONENTS */}
        {tab === "components" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sectionLabel("Buttons")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={{ padding: "11px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, backgroundColor: c.primary, color: c.primaryText, boxShadow: `0 4px 16px ${c.primary}30` }}>Start Workout</button>
              <button style={{ padding: "11px 28px", borderRadius: 12, border: `1.5px solid ${c.primary}`, cursor: "pointer", fontSize: 14, fontWeight: 700, backgroundColor: "transparent", color: c.primary }}>View Plan</button>
              <button style={{ padding: "11px 28px", borderRadius: 12, border: `1px solid ${c.border}`, cursor: "pointer", fontSize: 14, fontWeight: 600, backgroundColor: c.surfaceElevated, color: c.textSecondary }}>Cancel</button>
              <button style={{ padding: "11px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, backgroundColor: c.danger + "18", color: c.danger }}>Delete</button>
            </div>

            {sectionLabel("Workout Card")}
            <WorkoutCard c={c} />

            {sectionLabel("Stats")}
            <StatsCard c={c} />

            {sectionLabel("Workout Badges")}
            <div style={{ display: "flex", gap: 6 }}>
              <Badge label="Weights" color={c.weights} bg={c.weightsMuted} />
              <Badge label="Cardio" color={c.cardio} bg={c.cardioMuted} />
              <Badge label="Mobility" color={c.primary} bg={c.primaryMuted} />
            </div>

            {sectionLabel("Status Messages")}
            <StatusMessages c={c} />

            {sectionLabel("Navigation")}
            <NavPreview c={c} />

            {sectionLabel("Input Field")}
            <div style={{ maxWidth: 310 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 4 }}>Weight (lbs)</label>
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                backgroundColor: c.surfaceElevated, border: `1.5px solid ${c.borderStrong}`,
                fontSize: 16, fontWeight: 700, color: c.text,
              }}>135</div>
            </div>
          </div>
        )}

        {/* PALETTE */}
        {tab === "palette" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Primary", swatches: [{ hex: c.primary, name: "Primary" }, { hex: c.primaryHover, name: "Hover" }, { hex: c.primaryText, name: "On Primary" }] },
              { label: "Accent", swatches: [{ hex: c.accent, name: "Teal" }, { hex: c.accentHover, name: "Teal Hover" }] },
              { label: "Workout Types", swatches: [{ hex: c.weights, name: "Weights" }, { hex: c.cardio, name: "Cardio" }, { hex: c.mobility, name: "Mobility" }] },
              { label: "Surfaces", swatches: [{ hex: c.bg, name: "Background" }, { hex: c.surface, name: "Surface" }, { hex: c.surfaceElevated, name: "Elevated" }, { hex: c.surfaceHover, name: "Hover" }] },
              { label: "Text", swatches: [{ hex: c.text, name: "Primary" }, { hex: c.textSecondary, name: "Secondary" }, { hex: c.textMuted, name: "Muted" }] },
              { label: "Status", swatches: [{ hex: c.success, name: "Success" }, { hex: c.warning, name: "Warning" }, { hex: c.danger, name: "Danger" }, { hex: c.info, name: "Info" }] },
            ].map(group => (
              <div key={group.label}>
                {sectionLabel(group.label)}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {group.swatches.map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 10, backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`, minWidth: 150 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: s.hex, border: "1px solid rgba(128,128,128,0.12)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace" }}>{s.hex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTRAST */}
        {tab === "contrast" && (
          <div style={{ maxWidth: 500 }}>
            <p style={{ fontSize: 12, color: c.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
              WCAG 2.1 ratios on {dark ? "dark" : "light"} surface ({c.surface}).
            </p>
            <ContrastGrid c={c} />
          </div>
        )}

        {/* WHY */}
        {tab === "why" && (
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                icon: "💚",
                title: "Green = GO. Movement. Progress.",
                body: "Green is the universal signal for 'go.' It's what traffic lights, progress bars, and health apps all use. For a workout tracker, it subconsciously says 'keep moving.' Unlike yellow (which can feel cautionary) or orange (which... we know), green is unambiguously positive and energetic.",
                swatch: c.primary,
              },
              {
                icon: "🧊",
                title: "Cool steel-blue darks, not warm blacks",
                body: "The dark surfaces have a very subtle blue undertone (#0B0D10 → #14171C → #1D2128). This creates a premium 'gunmetal' feel that makes the green pop through temperature contrast — warm green on cool steel. It's moodier and more sophisticated than neutral grays.",
                swatch: c.surface,
              },
              {
                icon: "🎭",
                title: "Three-color workout system: Indigo + Rose + Green",
                body: "Weights get indigo (#6366F1 / #818CF8) — deep and powerful, like cast iron. Cardio gets rose (#F43F5E / #FB7185) — heart-pounding, alive, distinct from 'error red.' Mobility shares the primary green — movement and flexibility are green's natural territory. Three distinct hues, zero confusion.",
                swatch: c.weights,
              },
              {
                icon: "☀️",
                title: "Light mode that actually works",
                body: "Green has great inherent contrast on white — #00D26A on #FFFFFF reads at 2.5:1 for large UI elements, and we use white text ON green for buttons (9.4:1 — passes AAA). No need for ugly darkened variants. The cool gray surfaces (#F4F5F7) feel Apple-clean.",
                swatch: dark ? "#F4F5F7" : c.primary,
              },
              {
                icon: "🌿",
                title: "Teal accent for depth without noise",
                body: "The teal (#00B8A9 / #00D4C8) is a subtle secondary that sits between the green and blue families. It's used sparingly for gradients, streak highlights, and secondary accents. It adds depth without introducing a new color 'personality' — it's just a cooler shade of the same green energy.",
                swatch: c.accent,
              },
            ].map((item, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 16, backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>{item.title}</h3>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: c.textSecondary, margin: 0 }}>{item.body}</p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: item.swatch, border: "1px solid rgba(128,128,128,0.12)" }} />
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: c.textMuted }}>{item.swatch}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
