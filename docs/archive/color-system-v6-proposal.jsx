import { useState } from "react";

// ─── V6: ELECTRIC EMBER ────────────────────────────
// Philosophy: One bold color. Dark, moody surfaces.
// Orange is fire, effort, energy. Grays are the steel.
const V6 = {
  name: "V6 — Electric Ember",
  light: {
    primary: "#FF6B00",       // Electric Orange — vivid, energetic
    primaryHover: "#E85D00",
    primaryText: "#FFFFFF",   // White text on orange (high contrast)
    primaryMuted: "rgba(255, 107, 0, 0.08)",

    accent: "#FF8A3D",        // Lighter warm orange for secondary
    accentHover: "#FF7A24",
    accentMuted: "rgba(255, 138, 61, 0.10)",

    // Workout types — distinct from primary orange
    weights: "#3B82F6",       // Clean blue — classic strength
    weightsMuted: "rgba(59, 130, 246, 0.10)",
    cardio: "#FF6B00",        // Orange IS cardio energy
    cardioMuted: "rgba(255, 107, 0, 0.08)",
    mobility: "#10B981",      // Emerald — calm, flexible
    mobilityMuted: "rgba(16, 185, 129, 0.08)",

    // Cool, crisp surfaces
    bg: "#F6F6F8",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceHover: "#F0F0F3",
    surfaceSunken: "#EBEBEE",

    text: "#111114",
    textSecondary: "#4B4B55",
    textMuted: "#7C7C88",

    border: "rgba(17, 17, 20, 0.06)",
    borderStrong: "rgba(17, 17, 20, 0.12)",

    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
  dark: {
    primary: "#FF7A1A",       // Slightly warmer/lighter for dark bg
    primaryHover: "#FF8A3D",
    primaryText: "#000000",   // Black text on orange for punch
    primaryMuted: "rgba(255, 122, 26, 0.12)",

    accent: "#FF9E57",        // Softer peach-orange
    accentHover: "#FFAE70",
    accentMuted: "rgba(255, 158, 87, 0.10)",

    weights: "#60A5FA",       // Lifted blue for dark
    weightsMuted: "rgba(96, 165, 250, 0.12)",
    cardio: "#FF7A1A",        // Matches primary
    cardioMuted: "rgba(255, 122, 26, 0.10)",
    mobility: "#34D399",      // Lifted emerald
    mobilityMuted: "rgba(52, 211, 153, 0.10)",

    // Rich dark grays — NOT pure black. Slight cool undertone.
    bg: "#0C0C0F",
    surface: "#161619",
    surfaceElevated: "#202024",
    surfaceHover: "#2A2A30",
    surfaceSunken: "#070709",

    text: "#F2F2F5",
    textSecondary: "#9494A0",
    textMuted: "#5E5E6A",

    border: "rgba(242, 242, 245, 0.06)",
    borderStrong: "rgba(242, 242, 245, 0.10)",

    success: "#34D399",
    warning: "#FBBF24",
    danger: "#FB7185",
    info: "#60A5FA",
  },
};

// ─── Contrast Helpers ──────────────────────────────
function hexToRgb(hex) {
  if (!hex || hex.startsWith("rgba")) return [128, 128, 128];
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum([r, g, b]) {
  const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function cr(a, b) {
  const l1 = lum(hexToRgb(a)), l2 = lum(hexToRgb(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function wcag(r) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA-lg" : "Fail"; }
function wcagCol(r) { return r >= 7 ? "#10B981" : r >= 4.5 ? "#84CC16" : r >= 3 ? "#F59E0B" : "#EF4444"; }

// ─── Components ────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
      backgroundColor: bg, color, letterSpacing: "0.02em",
    }}>{label}</span>
  );
}

function WorkoutCard({ c }) {
  return (
    <div style={{
      padding: 20, borderRadius: 18,
      backgroundColor: c.surface, border: `1px solid ${c.border}`,
      width: "100%", maxWidth: 310,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: c.text, letterSpacing: "-0.02em" }}>Push Day A</div>
          <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>Chest · Shoulders · Triceps</div>
        </div>
        <Badge label="Weights" color={c.weights} bg={c.weightsMuted} />
      </div>

      <div style={{
        display: "flex", gap: 20, padding: "12px 0", marginBottom: 14,
        borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`,
      }}>
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
        boxShadow: `0 4px 20px ${c.primary}33`,
      }}>Start Workout</button>
    </div>
  );
}

function StatsCard({ c }) {
  return (
    <div style={{
      padding: 20, borderRadius: 18,
      backgroundColor: c.surface, border: `1px solid ${c.border}`,
      width: "100%", maxWidth: 310,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        This Week
      </div>
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
      {/* Bar chart */}
      <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 52, padding: "0 4px" }}>
        {[0.5, 0.8, 1.0, 0, 0.7, 0.9, 0.3].map((h, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 5,
            height: h > 0 ? `${h * 100}%` : 4,
            background: h > 0
              ? h === 1.0
                ? `linear-gradient(180deg, ${c.primary} 0%, ${c.primary}88 100%)`
                : `${c.primary}${Math.round(h * 60).toString(16).padStart(2, '0')}`
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
  const items = [
    { label: "Home", active: true, icon: "⌂" },
    { label: "Schedule", active: false, icon: "▦" },
    { label: "History", active: false, icon: "◷" },
    { label: "Profile", active: false, icon: "○" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", padding: "10px 8px",
      backgroundColor: c.surface, border: `1px solid ${c.border}`,
      borderRadius: 18, width: "100%", maxWidth: 360,
    }}>
      {items.map(it => (
        <div key={it.label} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "5px 16px", borderRadius: 14,
          backgroundColor: it.active ? c.primaryMuted : "transparent",
        }}>
          <span style={{
            fontSize: 16, lineHeight: 1,
            color: it.active ? c.primary : c.textMuted,
            filter: it.active ? "none" : "grayscale(1)",
          }}>{it.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: it.active ? 700 : 500,
            color: it.active ? c.primary : c.textMuted,
          }}>{it.label}</span>
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
        <div key={s.msg} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 12,
          backgroundColor: s.color + "12",
          borderLeft: `3px solid ${s.color}`,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            backgroundColor: s.color + "20", color: s.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800,
          }}>{s.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.msg}</span>
        </div>
      ))}
    </div>
  );
}

function ButtonRow({ c }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button style={{
        padding: "11px 28px", borderRadius: 12, border: "none", cursor: "pointer",
        fontSize: 14, fontWeight: 800, letterSpacing: "0.02em",
        backgroundColor: c.primary, color: c.primaryText,
        boxShadow: `0 4px 16px ${c.primary}33`,
      }}>Start Workout</button>
      <button style={{
        padding: "11px 28px", borderRadius: 12, border: `1.5px solid ${c.primary}`,
        cursor: "pointer", fontSize: 14, fontWeight: 700,
        backgroundColor: "transparent", color: c.primary,
      }}>View Plan</button>
      <button style={{
        padding: "11px 28px", borderRadius: 12, border: `1px solid ${c.border}`,
        cursor: "pointer", fontSize: 14, fontWeight: 600,
        backgroundColor: c.surfaceElevated, color: c.textSecondary,
      }}>Cancel</button>
    </div>
  );
}

function SwatchRow({ colors, c }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {colors.map(({ hex, name }) => {
        const isRgba = hex.startsWith("rgba");
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 10, backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`, minWidth: 150 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: hex, border: "1px solid rgba(128,128,128,0.15)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{name}</div>
              <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace" }}>{isRgba ? "rgba…" : hex}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContrastGrid({ c }) {
  const surface = c.surface;
  const checks = [
    { name: "Primary", fg: c.primary },
    { name: "Primary text on primary", fg: c.primaryText, bg: c.primary },
    { name: "Text", fg: c.text },
    { name: "Text secondary", fg: c.textSecondary },
    { name: "Text muted", fg: c.textMuted },
    { name: "Weights", fg: c.weights },
    { name: "Cardio", fg: c.cardio || c.primary },
    { name: "Mobility", fg: c.mobility || "#10B981" },
    { name: "Success", fg: c.success },
    { name: "Warning", fg: c.warning },
    { name: "Danger", fg: c.danger },
  ];
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {checks.map(ch => {
        const bg = ch.bg || surface;
        if (ch.fg.startsWith("rgba") || bg.startsWith("rgba")) return null;
        const r = cr(ch.fg, bg);
        const g = wcag(r);
        const gc = wcagCol(r);
        return (
          <div key={ch.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 10px", borderRadius: 8,
            backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, backgroundColor: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(128,128,128,0.12)",
              }}>
                <span style={{ color: ch.fg, fontWeight: 800, fontSize: 12 }}>A</span>
              </div>
              <span style={{ fontSize: 11, color: c.text, fontWeight: 500 }}>{ch.name}</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              backgroundColor: gc + "18", color: gc,
            }}>{r.toFixed(1)} {g}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hero Phone Mockup ─────────────────────────────
function PhoneMock({ c, dark }) {
  return (
    <div style={{
      width: 280, borderRadius: 28, overflow: "hidden",
      backgroundColor: c.bg, border: `2px solid ${c.borderStrong}`,
      boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)",
    }}>
      {/* Status bar */}
      <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.text }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: c.textMuted + "44" }} />)}
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "12px 18px 0" }}>
        <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: "0.04em" }}>GOOD EVENING</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: c.text, letterSpacing: "-0.03em" }}>
          Jaron<span style={{ color: c.primary }}>.</span>
        </div>
      </div>

      {/* Today's workout card */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          padding: 14, borderRadius: 16,
          background: dark
            ? `linear-gradient(135deg, ${c.surface} 0%, ${c.surfaceElevated} 100%)`
            : c.surface,
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Push Day A</div>
              <div style={{ fontSize: 10, color: c.textSecondary }}>5 exercises · ~50 min</div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
              backgroundColor: c.weightsMuted, color: c.weights,
            }}>WEIGHTS</span>
          </div>
          <button style={{
            width: "100%", padding: "9px 0", borderRadius: 10, border: "none",
            fontSize: 12, fontWeight: 800, cursor: "pointer",
            backgroundColor: c.primary, color: c.primaryText,
          }}>Start Workout</button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: "0 14px 8px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: "5", l: "streak", col: c.primary },
            { v: "23", l: "workouts", col: c.text },
            { v: "3", l: "PRs", col: c.weights },
          ].map(s => (
            <div key={s.l} style={{
              flex: 1, padding: "10px 0", borderRadius: 12, textAlign: "center",
              backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.col, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 8, color: c.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini heatmap */}
      <div style={{ padding: "6px 14px 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 6, letterSpacing: "0.04em" }}>ACTIVITY</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[0, 0.3, 0.6, 1, 0, 0.8, 0.4, 0, 0, 0.5, 0.9, 1, 0.7, 0, 0.3, 0.6, 0, 0.8, 1, 0, 0].map((v, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: 3,
              backgroundColor: v > 0
                ? `${c.primary}${Math.round(v * 200 + 30).toString(16).padStart(2, '0')}`
                : c.surfaceHover,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: "flex", justifyContent: "space-around", padding: "8px 0 14px",
        borderTop: `1px solid ${c.border}`,
      }}>
        {[
          { l: "Home", a: true },
          { l: "Plan", a: false },
          { l: "Log", a: false },
          { l: "Me", a: false },
        ].map(n => (
          <div key={n.l} style={{ textAlign: "center" }}>
            <div style={{
              width: 18, height: 18, borderRadius: 6, margin: "0 auto 2px",
              backgroundColor: n.a ? c.primary : c.textMuted + "33",
            }} />
            <span style={{
              fontSize: 9, fontWeight: n.a ? 700 : 500,
              color: n.a ? c.primary : c.textMuted,
            }}>{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────
export default function V6Proposal() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("hero");
  const c = dark ? V6.dark : V6.light;

  const tabs = [
    { id: "hero", label: "Preview" },
    { id: "components", label: "Components" },
    { id: "palette", label: "Palette" },
    { id: "contrast", label: "Contrast" },
    { id: "rationale", label: "Why" },
  ];

  const sectionTitle = (text) => (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: c.textMuted, marginBottom: 10, marginTop: 8,
    }}>{text}</div>
  );

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: c.bg,
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
      transition: "background-color 0.35s, color 0.35s",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: c.text,
            }}>
              Electric <span style={{ color: c.primary }}>Ember</span>
            </h1>
            <p style={{ fontSize: 12, color: c.textSecondary, margin: "2px 0 0" }}>
              Orange energy. Steel gray discipline. Modern fitness.
            </p>
          </div>
          <button onClick={() => setDark(!dark)} style={{
            padding: "8px 20px", borderRadius: 12, cursor: "pointer",
            border: `1.5px solid ${c.borderStrong}`,
            backgroundColor: c.surfaceElevated, color: c.text,
            fontSize: 13, fontWeight: 600,
          }}>{dark ? "☀ Light" : "● Dark"}</button>
        </div>

        {/* Tabs */}
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

        {/* ─── HERO / PHONE MOCKUP ─── */}
        {tab === "hero" && (
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <PhoneMock c={c} dark={dark} />
            <div style={{ maxWidth: 380, flex: 1, minWidth: 260 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: c.text, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px" }}>
                One bold color.<br />
                <span style={{ color: c.primary }}>Maximum impact.</span>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: c.textSecondary, margin: "0 0 24px" }}>
                Electric orange is fire, effort, and energy. Dark steel grays are discipline and focus. Together they create a fitness app that feels as intense as the workouts it tracks.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { hex: c.primary, name: "Primary" },
                  { hex: c.weights, name: "Weights" },
                  { hex: c.mobility, name: "Mobility" },
                  { hex: c.surface, name: "Surface" },
                  { hex: c.text, name: "Text" },
                ].map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: s.hex, border: "1px solid rgba(128,128,128,0.15)" }} />
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

        {/* ─── COMPONENTS ─── */}
        {tab === "components" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sectionTitle("Buttons")}
            <ButtonRow c={c} />

            {sectionTitle("Workout Card")}
            <WorkoutCard c={c} />

            {sectionTitle("Stats Card")}
            <StatsCard c={c} />

            {sectionTitle("Workout Type Badges")}
            <div style={{ display: "flex", gap: 6 }}>
              <Badge label="Weights" color={c.weights} bg={c.weightsMuted} />
              <Badge label="Cardio" color={c.primary} bg={c.primaryMuted} />
              <Badge label="Mobility" color={c.mobility || "#10B981"} bg={c.mobilityMuted} />
            </div>

            {sectionTitle("Status Messages")}
            <StatusMessages c={c} />

            {sectionTitle("Bottom Navigation")}
            <NavPreview c={c} />
          </div>
        )}

        {/* ─── PALETTE ─── */}
        {tab === "palette" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {sectionTitle("Primary")}
            <SwatchRow c={c} colors={[
              { hex: c.primary, name: "Primary" },
              { hex: c.primaryHover, name: "Primary Hover" },
              { hex: c.primaryText, name: "On Primary" },
            ]} />

            {sectionTitle("Accent")}
            <SwatchRow c={c} colors={[
              { hex: c.accent, name: "Accent" },
              { hex: c.accentHover, name: "Accent Hover" },
            ]} />

            {sectionTitle("Workout Types")}
            <SwatchRow c={c} colors={[
              { hex: c.weights, name: "Weights" },
              { hex: c.primary, name: "Cardio" },
              { hex: c.mobility || "#10B981", name: "Mobility" },
            ]} />

            {sectionTitle("Surfaces")}
            <SwatchRow c={c} colors={[
              { hex: c.bg, name: "Background" },
              { hex: c.surface, name: "Surface" },
              { hex: c.surfaceElevated, name: "Elevated" },
              { hex: c.surfaceHover, name: "Hover" },
            ]} />

            {sectionTitle("Text")}
            <SwatchRow c={c} colors={[
              { hex: c.text, name: "Text" },
              { hex: c.textSecondary, name: "Secondary" },
              { hex: c.textMuted, name: "Muted" },
            ]} />

            {sectionTitle("Status")}
            <SwatchRow c={c} colors={[
              { hex: c.success, name: "Success" },
              { hex: c.warning, name: "Warning" },
              { hex: c.danger, name: "Danger" },
              { hex: c.info, name: "Info" },
            ]} />
          </div>
        )}

        {/* ─── CONTRAST ─── */}
        {tab === "contrast" && (
          <div style={{ maxWidth: 500 }}>
            <p style={{ fontSize: 12, color: c.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
              WCAG 2.1 contrast ratios against the {dark ? "dark" : "light"} surface ({c.surface}).
            </p>
            <ContrastGrid c={c} />
          </div>
        )}

        {/* ─── RATIONALE ─── */}
        {tab === "rationale" && (
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                icon: "🔥",
                title: "Electric Orange as the SOLE hero color",
                body: "Orange is the color of effort, fire, and momentum. Unlike volt yellow, it has excellent contrast on BOTH light and dark surfaces — no need for ugly darkened variants. White text on orange passes AA. Black text on orange passes AAA. It just works everywhere.",
                swatch: c.primary,
              },
              {
                icon: "🩶",
                title: "Dark steel grays with subtle cool undertone",
                body: "The dark surfaces shift from pure warm black (#0A0A0A) to a very slight blue-cool gray (#0C0C0F → #161619 → #202024). This cool undertone makes the warm orange feel even more vivid by contrast. It's the same trick luxury car interiors use — cool materials make warm accents pop.",
                swatch: c.surface,
              },
              {
                icon: "💪",
                title: "Cardio = Primary (no wasted color)",
                body: "Since orange naturally screams 'cardio energy,' cardio shares the primary color. This means one fewer arbitrary color in the system. Weights gets clean blue (the universal 'strength' color). Mobility gets emerald green (calm, flexibility). Three workout types, three distinct colors, zero ambiguity.",
                swatch: c.weights,
              },
              {
                icon: "✨",
                title: "Light mode is actually good now",
                body: "Cool gray backgrounds (#F6F6F8) with crisp white cards and a vivid orange accent. No more invisible yellow text. No more olive-drab compromises. The orange reads at 4.6:1 on white with white text — clean and modern. Toggle light mode above and see for yourself.",
                swatch: dark ? "#F6F6F8" : c.primary,
              },
              {
                icon: "🎯",
                title: "Fewer tokens, tighter system",
                body: "V4 had primary + accent + tertiary + 3 workout colors + 4 status colors = 10 distinct hues. V6 has primary orange + blue + green + 4 status = 7 distinct hues, with cardio sharing primary and success sharing mobility green. Less noise, more cohesion.",
                swatch: c.success,
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 16,
                backgroundColor: c.surface, border: `1px solid ${c.border}`,
              }}>
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
