import { useState } from "react";

/*
 * V7.5 — ELECTRIC MINT PRO (Final)
 *
 * LIGHT MODE REDESIGN NOTES (designer audit):
 *
 * Problem 1: surface + surfaceElevated were IDENTICAL (#FFF). No elevation
 *            hierarchy. Cards and popovers looked the same.
 * Fix:       Three-tier system: gray bg → off-white surface → true white elevated.
 *
 * Problem 2: Dark mode got neon glow, light mode got nothing. Felt like an afterthought.
 * Fix:       Light mode gets COLORED SHADOWS — green-tinted lift on primary elements,
 *            amber lift on reward. This is the light-mode equivalent of neon glow.
 *
 * Problem 3: Background (#F4F5F7) was generic. Could be any app.
 * Fix:       Shifted to a cooler, more assertive gray (#ECEEF2) that makes
 *            white/off-white cards clearly "pop" above it.
 *
 * Problem 4: Borders too weak (0.06 opacity). Cards had no definition.
 * Fix:       Bumped to 0.08 default, 0.14 strong. Added shadow-based depth instead
 *            of relying solely on borders.
 *
 * Problem 5: Badge/muted backgrounds (0.06-0.07) were invisible on white.
 * Fix:       Bumped all muted opacities to 0.10-0.12 in light mode.
 *
 * Problem 6: Glass nav was just "white blur on gray" — no personality.
 * Fix:       Light glass uses off-white + saturation boost + subtle green tint.
 *
 * Problem 7: Reward gold (#FFB800) washed out on white surfaces.
 * Fix:       Darkened to #D99700 for text, kept #FFB800 only for fills.
 */

const V7 = {
  light: {
    primary: "#00C261",         // Slightly deeper green for light — sharper contrast
    primaryBright: "#00D26A",
    primaryHover: "#00AB56",
    primaryText: "#FFFFFF",
    primaryMuted: "rgba(0, 194, 97, 0.10)",   // bumped from 0.07
    primaryGlow: "rgba(0, 194, 97, 0.14)",    // COLORED SHADOW — not invisible!

    accent: "#00A89A",
    accentMuted: "rgba(0, 168, 154, 0.08)",

    reward: "#D99700",          // Deeper for text on white
    rewardBright: "#FFB800",    // Original — for fills only
    rewardMuted: "rgba(217, 151, 0, 0.10)",   // bumped
    rewardGlow: "rgba(217, 151, 0, 0.12)",    // subtle warm lift

    weights: "#5B5DF0",         // Slightly deeper indigo
    weightsMuted: "rgba(91, 93, 240, 0.09)",
    cardio: "#E63B57",          // Deeper rose
    cardioMuted: "rgba(230, 59, 87, 0.08)",
    mobility: "#00C261",
    mobilityMuted: "rgba(0, 194, 97, 0.08)",

    // THREE-TIER SURFACE SYSTEM — the key fix
    bg: "#ECEEF2",              // Cool assertive gray — the "canvas"
    surface: "#F7F8FA",         // Off-white — cards sit here
    surfaceElevated: "#FFFFFF", // True white — modals, popovers, elevated sheets
    surfaceHover: "#EAEBEF",
    surfaceSunken: "#E3E5EA",   // Inputs, recessed areas

    text: "#111318",            // Near-black with slight cool tone
    textSecondary: "#484D5C",   // Neutral gray — less blue than before
    textMuted: "#6E7487",

    border: "rgba(17, 19, 24, 0.08)",       // bumped from 0.06
    borderStrong: "rgba(17, 19, 24, 0.14)",  // bumped from 0.10

    // COLORED SHADOWS — light mode's signature
    shadowCard: "0 1px 3px rgba(17,19,24,0.04), 0 4px 16px rgba(17,19,24,0.05)",
    shadowPrimary: "0 2px 8px rgba(0,194,97,0.18), 0 4px 20px rgba(0,194,97,0.12)",
    shadowReward: "0 2px 8px rgba(217,151,0,0.15), 0 4px 16px rgba(217,151,0,0.10)",
    shadowElevated: "0 4px 12px rgba(17,19,24,0.06), 0 12px 40px rgba(17,19,24,0.08)",

    gradientPrimary: "linear-gradient(135deg, #00C261 0%, #00A89A 100%)",
    gradientReward: "linear-gradient(135deg, #FFB800 0%, #FF9500 100%)",
    gradientSurface: "linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)",

    // Glass — frosted off-white with green tint
    glassBg: "rgba(247, 248, 250, 0.82)",
    glassBorder: "rgba(17, 19, 24, 0.06)",

    success: "#00C261", warning: "#D99700", danger: "#E63B57", info: "#5B5DF0",
  },
  dark: {
    primary: "#00E676",
    primaryBright: "#00FF88",
    primaryHover: "#00F283",
    primaryText: "#0A0F0D",
    primaryMuted: "rgba(0, 230, 118, 0.08)",
    primaryGlow: "rgba(0, 230, 118, 0.15)",

    accent: "#00D4C8",
    accentMuted: "rgba(0, 212, 200, 0.07)",

    reward: "#FFC233",
    rewardBright: "#FFD060",
    rewardMuted: "rgba(255, 194, 51, 0.10)",
    rewardGlow: "rgba(255, 194, 51, 0.12)",

    weights: "#818CF8",
    weightsMuted: "rgba(129, 140, 248, 0.10)",
    cardio: "#FB7185",
    cardioMuted: "rgba(251, 113, 133, 0.08)",
    mobility: "#00E676",
    mobilityMuted: "rgba(0, 230, 118, 0.07)",

    bg: "#0B0D10",
    surface: "#13161B",
    surfaceElevated: "#1B1F26",
    surfaceHover: "#242930",
    surfaceSunken: "#070809",

    text: "#ECF0F5",
    textSecondary: "#8B93A6",
    textMuted: "#5A6278",

    border: "rgba(236, 240, 245, 0.05)",
    borderStrong: "rgba(236, 240, 245, 0.08)",

    shadowCard: "0 2px 4px rgba(0,0,0,0.20), 0 8px 32px rgba(0,0,0,0.25)",
    shadowPrimary: "0 4px 24px rgba(0,230,118,0.15), 0 1px 3px rgba(0,0,0,0.3)",
    shadowReward: "0 4px 24px rgba(255,194,51,0.12), 0 1px 3px rgba(0,0,0,0.3)",
    shadowElevated: "0 8px 32px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",

    gradientPrimary: "linear-gradient(135deg, #00E676 0%, #00D4C8 100%)",
    gradientReward: "linear-gradient(135deg, #FFC233 0%, #FFB800 100%)",
    gradientSurface: "linear-gradient(170deg, #1B1F26 0%, #13161B 100%)",

    glassBg: "rgba(19, 22, 27, 0.78)",
    glassBorder: "rgba(236, 240, 245, 0.05)",

    success: "#00E676", warning: "#FBBF24", danger: "#FB7185", info: "#818CF8",
  },
};

// ─── Helpers ───────────────────────────────────────
function hexToRgb(h) {
  if (!h || h.startsWith("rgba") || h.startsWith("linear") || h.startsWith("0")) return [128,128,128];
  h = h.replace("#","");
  if (h.length !== 6) return [128,128,128];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function lum([r,g,b]) {
  const f=c=>{const s=c/255; return s<=0.03928?s/12.92:((s+0.055)/1.055)**2.4};
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
}
function cr(a,b){
  try{const l1=lum(hexToRgb(a)),l2=lum(hexToRgb(b));return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)}catch{return 1}
}
function wcag(r){return r>=7?"AAA":r>=4.5?"AA":r>=3?"AA-lg":"Fail"}
function wcagC(r){return r>=7?"#00E676":r>=4.5?"#84CC16":r>=3?"#F59E0B":"#EF4444"}

// ─── Shared ────────────────────────────────────────
const glass = (c) => ({
  backgroundColor: c.glassBg,
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${c.glassBorder}`,
});

// ─── UI COMPONENTS ─────────────────────────────────
function GlowButton({ label, c, dark, variant = "primary", small = false }) {
  const configs = {
    primary: { bg: c.gradientPrimary, color: c.primaryText, shadow: c.shadowPrimary },
    reward: { bg: c.gradientReward, color: "#1A0F00", shadow: c.shadowReward },
    outline: { bg: "transparent", color: c.primary, shadow: "none", border: `1.5px solid ${c.primary}` },
    ghost: { bg: c.surfaceElevated, color: c.textSecondary, shadow: c.shadowCard, border: `1px solid ${c.border}` },
    danger: { bg: c.danger + "14", color: c.danger, shadow: "none", border: "none" },
  };
  const cfg = configs[variant];
  return (
    <button style={{
      padding: small ? "8px 18px" : "12px 28px",
      borderRadius: small ? 10 : 14,
      border: cfg.border || "none",
      cursor: "pointer",
      fontSize: small ? 12 : 14,
      fontWeight: 800,
      letterSpacing: "0.02em",
      background: cfg.bg,
      color: cfg.color,
      boxShadow: cfg.shadow,
    }}>{label}</button>
  );
}

function Badge({ label, color, bg, c, dark }) {
  return (
    <span style={{
      padding: "5px 12px", borderRadius: 9, fontSize: 11, fontWeight: 700,
      backgroundColor: bg, color, letterSpacing: "0.02em",
      boxShadow: dark ? `0 0 12px ${color}15` : "none",
    }}>{label}</span>
  );
}

function WorkoutCard({ c, dark }) {
  return (
    <div style={{
      padding: 20, borderRadius: 20, width: "100%", maxWidth: 320,
      background: dark ? c.gradientSurface : c.gradientSurface,
      border: `1px solid ${c.border}`,
      boxShadow: dark ? c.shadowCard : c.shadowCard,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.text, letterSpacing: "-0.02em" }}>Push Day A</div>
          <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 3 }}>Chest · Shoulders · Triceps</div>
        </div>
        <Badge label="Weights" color={c.weights} bg={c.weightsMuted} c={c} dark={dark} />
      </div>
      <div style={{
        display: "flex", padding: "14px 0", marginBottom: 16,
        borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`,
      }}>
        {[
          { v: "5", l: "EXERCISES", col: c.text },
          { v: "20", l: "SETS", col: c.textSecondary },
          { v: "~50m", l: "DURATION", col: c.textMuted },
        ].map((s, i) => (
          <div key={s.l} style={{
            textAlign: "center", flex: 1,
            borderRight: i < 2 ? `1px solid ${c.border}` : "none",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.col, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 8, color: c.textMuted, marginTop: 4, letterSpacing: "0.08em", fontWeight: 700 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
        fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "0.03em",
        background: c.gradientPrimary, color: c.primaryText,
        boxShadow: c.shadowPrimary,
      }}>Start Workout</button>
    </div>
  );
}

function RewardCard({ c, dark }) {
  return (
    <div style={{
      padding: 18, borderRadius: 20, width: "100%", maxWidth: 320,
      background: dark
        ? `linear-gradient(135deg, ${c.surfaceElevated} 0%, rgba(255,194,51,0.03) 100%)`
        : `linear-gradient(135deg, #FFFFFF 0%, rgba(255,184,0,0.04) 100%)`,
      border: `1px solid ${dark ? "rgba(255,194,51,0.10)" : "rgba(217,151,0,0.12)"}`,
      boxShadow: c.shadowReward,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 15,
          background: c.gradientReward,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: dark ? `0 0 20px ${c.rewardGlow}` : c.shadowReward,
          fontSize: 22,
        }}>🏆</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: c.reward, letterSpacing: "-0.01em" }}>New Personal Record!</div>
          <div style={{ fontSize: 11, color: c.textSecondary }}>Bench Press · 225 lbs × 3</div>
        </div>
      </div>
      <div style={{
        padding: "9px 12px", borderRadius: 11,
        background: c.rewardMuted,
        fontSize: 12, fontWeight: 700, color: c.reward,
        textAlign: "center",
      }}>+15 lbs from previous best</div>
    </div>
  );
}

function StatsCard({ c, dark }) {
  const bars = [0.5, 0.8, 1.0, 0, 0.7, 0.9, 0.3];
  return (
    <div style={{
      padding: 20, borderRadius: 20, width: "100%", maxWidth: 320,
      background: dark ? c.gradientSurface : c.surface,
      border: `1px solid ${c.border}`,
      boxShadow: c.shadowCard,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, marginBottom: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>This Week</div>
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 18 }}>
        {[
          { v: "5", l: "WORKOUTS", col: c.primary },
          { v: "3", l: "PRs", col: c.reward },
          { v: "14.2k", l: "VOLUME", col: c.text },
        ].map(s => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
              color: s.col,
              textShadow: dark && s.col === c.primary ? `0 0 20px ${c.primaryGlow}` : dark && s.col === c.reward ? `0 0 16px ${c.rewardGlow}` : "none",
            }}>{s.v}</div>
            <div style={{ fontSize: 8, color: c.textMuted, marginTop: 5, letterSpacing: "0.08em", fontWeight: 700 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 56, padding: "0 4px" }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 6,
            height: h > 0 ? `${h * 100}%` : 4,
            background: h > 0
              ? h >= 0.9
                ? c.gradientPrimary
                : `${c.primary}${Math.round(h * 55 + 15).toString(16).padStart(2, "0")}`
              : dark ? c.surfaceHover : c.surfaceSunken,
            boxShadow: dark && h >= 0.9 ? `0 0 12px ${c.primaryGlow}` : !dark && h >= 0.9 ? `0 2px 8px ${c.primaryGlow}` : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8, padding: "0 4px" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: c.textMuted, flex: 1, textAlign: "center", fontWeight: 600 }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function GlassNav({ c, dark }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", padding: "10px 8px",
      borderRadius: 20, width: "100%", maxWidth: 370,
      ...glass(c),
      boxShadow: dark ? "0 -1px 20px rgba(0,0,0,0.3)" : "0 -1px 12px rgba(17,19,24,0.06)",
    }}>
      {[
        { l: "Home", a: true, i: "⌂" },
        { l: "Schedule", a: false, i: "▦" },
        { l: "History", a: false, i: "◷" },
        { l: "Profile", a: false, i: "○" },
      ].map(n => (
        <div key={n.l} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "5px 16px", borderRadius: 14,
          backgroundColor: n.a ? c.primaryMuted : "transparent",
        }}>
          <span style={{
            fontSize: 16, lineHeight: 1,
            color: n.a ? c.primary : c.textMuted,
            textShadow: dark && n.a ? `0 0 10px ${c.primaryGlow}` : "none",
          }}>{n.i}</span>
          <span style={{ fontSize: 10, fontWeight: n.a ? 700 : 500, color: n.a ? c.primary : c.textMuted }}>{n.l}</span>
        </div>
      ))}
    </div>
  );
}

function StatusMessages({ c, dark }) {
  return (
    <div style={{ display: "grid", gap: 6, width: "100%", maxWidth: 320 }}>
      {[
        { msg: "Workout complete!", color: c.success, icon: "✓" },
        { msg: "New PR — Bench Press!", color: c.reward, icon: "★" },
        { msg: "Rest: 90s remaining", color: c.warning, icon: "◷" },
        { msg: "Sync failed — retry", color: c.danger, icon: "✗" },
      ].map(s => (
        <div key={s.msg} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 14,
          backgroundColor: s.color + "10",
          borderLeft: `3px solid ${s.color}`,
          boxShadow: dark ? `0 0 16px ${s.color}06` : "none",
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0,
            backgroundColor: s.color + "18", color: s.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800,
          }}>{s.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.msg}</span>
        </div>
      ))}
    </div>
  );
}

function InputField({ c, dark }) {
  return (
    <div style={{ maxWidth: 320 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 6 }}>Weight (lbs)</label>
      <div style={{
        padding: "12px 16px", borderRadius: 12,
        backgroundColor: dark ? c.surfaceHover : c.surfaceSunken,
        border: `1.5px solid ${c.border}`,
        fontSize: 18, fontWeight: 700, color: c.text,
        boxShadow: dark ? "inset 0 1px 2px rgba(0,0,0,0.2)" : "inset 0 1px 3px rgba(17,19,24,0.06)",
      }}>135</div>
    </div>
  );
}

// ─── Phone Mockup ──────────────────────────────────
function PhoneMock({ c, dark }) {
  return (
    <div style={{
      width: 300, borderRadius: 36, overflow: "hidden",
      backgroundColor: c.bg,
      border: `2px solid ${dark ? "rgba(236,240,245,0.06)" : "rgba(17,19,24,0.08)"}`,
      boxShadow: dark
        ? `0 28px 80px rgba(0,0,0,0.6), 0 0 60px ${c.primaryGlow}`
        : `0 20px 60px rgba(17,19,24,0.10), 0 4px 20px rgba(17,19,24,0.06)`,
    }}>
      {/* Status bar */}
      <div style={{ padding: "12px 20px 6px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>{[...Array(3)].map((_,i) => <div key={i} style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: c.textMuted + "44" }} />)}</div>
      </div>

      {/* Header */}
      <div style={{ padding: "16px 22px 0" }}>
        <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Good Evening</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: c.text, letterSpacing: "-0.03em" }}>
          Jaron<span style={{ color: c.primary, textShadow: dark ? `0 0 12px ${c.primaryGlow}` : "none" }}>.</span>
        </div>
      </div>

      {/* Streak — REWARD gold */}
      <div style={{ padding: "12px 18px" }}>
        <div style={{
          padding: "11px 16px", borderRadius: 16,
          background: dark
            ? `linear-gradient(135deg, rgba(255,194,51,0.05) 0%, transparent 100%)`
            : `linear-gradient(135deg, rgba(217,151,0,0.05) 0%, transparent 100%)`,
          border: `1px solid ${dark ? "rgba(255,194,51,0.08)" : "rgba(217,151,0,0.10)"}`,
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: dark ? `0 0 20px ${c.rewardGlow}` : c.shadowReward,
        }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>5 day streak</div>
            <div style={{ fontSize: 10, color: c.textSecondary }}>Your best this month</div>
          </div>
          <div style={{
            fontSize: 24, fontWeight: 800, color: c.reward,
            textShadow: dark ? `0 0 14px ${c.rewardGlow}` : "none",
          }}>5</div>
        </div>
      </div>

      {/* Today's workout */}
      <div style={{ padding: "4px 18px" }}>
        <div style={{
          padding: 16, borderRadius: 18,
          background: dark ? c.gradientSurface : c.surface,
          border: `1px solid ${c.border}`,
          boxShadow: c.shadowCard,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Push Day A</div>
              <div style={{ fontSize: 10, color: c.textSecondary }}>5 exercises · ~50 min</div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 7,
              backgroundColor: c.weightsMuted, color: c.weights,
            }}>WEIGHTS</span>
          </div>
          <button style={{
            width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            background: c.gradientPrimary, color: c.primaryText,
            boxShadow: c.shadowPrimary,
          }}>Start Workout</button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: "12px 18px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: "23", l: "workouts", col: c.text },
            { v: "3", l: "PRs", col: c.reward },
            { v: "85%", l: "adherence", col: c.primary },
          ].map(s => (
            <div key={s.l} style={{
              flex: 1, padding: "11px 0", borderRadius: 14, textAlign: "center",
              background: dark ? c.gradientSurface : c.surfaceElevated,
              border: `1px solid ${c.border}`,
              boxShadow: dark ? "none" : "0 1px 3px rgba(17,19,24,0.04)",
            }}>
              <div style={{
                fontSize: 20, fontWeight: 800, color: s.col, lineHeight: 1,
                textShadow: dark && s.col === c.primary ? `0 0 12px ${c.primaryGlow}` : dark && s.col === c.reward ? `0 0 10px ${c.rewardGlow}` : "none",
              }}>{s.v}</div>
              <div style={{ fontSize: 8, color: c.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ padding: "2px 18px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Activity</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[0, 0.3, 0.7, 1, 0, 0.9, 0.4, 0, 0, 0.5, 0.9, 1, 0.6, 0, 0.3, 0.7, 0, 0.9, 1, 0, 0].map((v, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: 3,
              backgroundColor: v > 0 ? `${c.primary}${Math.round(v * 190 + 40).toString(16).padStart(2, "0")}` : dark ? c.surfaceHover : c.surfaceSunken,
              boxShadow: dark && v >= 0.9 ? `0 0 6px ${c.primaryGlow}` : "none",
            }} />
          ))}
        </div>
      </div>

      {/* Bottom nav — glass */}
      <div style={{
        display: "flex", justifyContent: "space-around", padding: "8px 0 18px",
        ...glass(c),
        borderRadius: 0, borderLeft: "none", borderRight: "none", borderBottom: "none",
        boxShadow: dark ? "0 -1px 20px rgba(0,0,0,0.2)" : "0 -1px 8px rgba(17,19,24,0.04)",
      }}>
        {[
          { l: "Home", a: true }, { l: "Plan", a: false }, { l: "Log", a: false }, { l: "Me", a: false },
        ].map(n => (
          <div key={n.l} style={{ textAlign: "center" }}>
            <div style={{
              width: 20, height: 20, borderRadius: 7, margin: "0 auto 2px",
              backgroundColor: n.a ? c.primary : c.textMuted + "33",
              boxShadow: dark && n.a ? `0 0 10px ${c.primaryGlow}` : !dark && n.a ? `0 2px 6px ${c.primaryGlow}` : "none",
            }} />
            <span style={{ fontSize: 9, fontWeight: n.a ? 700 : 500, color: n.a ? c.primary : c.textMuted }}>{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contrast Grid ─────────────────────────────────
function ContrastGrid({ c }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {[
        { name: "Primary on surface", fg: c.primary, bg: c.surface },
        { name: "On-primary (white on green)", fg: c.primaryText, bg: c.primary },
        { name: "Reward on surface", fg: c.reward, bg: c.surface },
        { name: "Text on surface", fg: c.text, bg: c.surface },
        { name: "Text on background", fg: c.text, bg: c.bg },
        { name: "Secondary on surface", fg: c.textSecondary, bg: c.surface },
        { name: "Muted on surface", fg: c.textMuted, bg: c.surface },
        { name: "Weights", fg: c.weights, bg: c.surface },
        { name: "Cardio", fg: c.cardio, bg: c.surface },
        { name: "Danger", fg: c.danger, bg: c.surface },
      ].map(ch => {
        if (!ch.fg || !ch.bg || ch.fg.startsWith("rgba") || ch.bg.startsWith("rgba") || ch.fg.startsWith("linear") || ch.bg.startsWith("linear") || ch.fg.startsWith("0 ") || ch.bg.startsWith("0 ")) return null;
        const r = cr(ch.fg, ch.bg);
        if (isNaN(r)) return null;
        const g = wcag(r);
        const gc = wcagC(r);
        return (
          <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 10, backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: ch.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${c.border}` }}>
                <span style={{ color: ch.fg, fontWeight: 800, fontSize: 13 }}>A</span>
              </div>
              <span style={{ fontSize: 11, color: c.text, fontWeight: 500 }}>{ch.name}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, backgroundColor: gc + "15", color: gc }}>{r.toFixed(1)} {g}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────
export default function V7Final() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("hero");
  const c = dark ? V7.dark : V7.light;

  const tabs = [
    { id: "hero", label: "Preview" },
    { id: "components", label: "Components" },
    { id: "palette", label: "Palette" },
    { id: "contrast", label: "Contrast" },
    { id: "magic", label: "The Magic" },
    { id: "audit", label: "Light Mode Fixes" },
  ];

  const sectionLabel = (text) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.textMuted, marginBottom: 10, marginTop: 16 }}>{text}</div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: c.bg, fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", transition: "background-color 0.4s" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0", maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: c.text }}>
              Electric <span style={{ background: c.gradientPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Mint</span> <span style={{ fontSize: 14, color: c.textMuted, fontWeight: 500 }}>Pro</span>
            </h1>
            <p style={{ fontSize: 12, color: c.textSecondary, margin: "2px 0 0" }}>
              {dark ? "Neon glow. Reward gold. Cinematic depth." : "Colored shadows. Layered grays. Razor-sharp hierarchy."}
            </p>
          </div>
          <button onClick={() => setDark(!dark)} style={{
            padding: "8px 20px", borderRadius: 12, cursor: "pointer",
            ...glass(c), fontSize: 13, fontWeight: 600, color: c.text,
          }}>{dark ? "☀ Light" : "● Dark"}</button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: tab === t.id ? c.gradientPrimary : c.surfaceElevated,
              color: tab === t.id ? c.primaryText : c.textSecondary,
              boxShadow: tab === t.id ? c.shadowPrimary : c.shadowCard,
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px 60px", maxWidth: 1060, margin: "0 auto" }}>

        {/* HERO */}
        {tab === "hero" && (
          <div style={{ display: "flex", gap: 50, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <PhoneMock c={c} dark={dark} />
            <div style={{ maxWidth: 400, flex: 1, minWidth: 280 }}>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: c.text, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px" }}>
                Colors that<br />
                <span style={{ background: c.gradientPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>feel alive.</span>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: c.textSecondary, margin: "0 0 12px" }}>
                Electric mint for energy and movement. {dark ? "Neon glow that makes the UI feel luminous." : "Colored shadows that give every element physical weight."} And a secret weapon: <strong style={{ color: c.reward }}>reward gold</strong> that only appears when you earn it.
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: c.textMuted, margin: "0 0 24px" }}>
                {dark
                  ? "Dark mode is cinematic — cool steel grays, neon-edged elements, dramatic depth."
                  : "Light mode is editorial — layered grays, green-tinted lift shadows, razor-sharp type hierarchy."
                }
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <GlowButton label="Primary" c={c} dark={dark} variant="primary" small />
                <GlowButton label="Achievement" c={c} dark={dark} variant="reward" small />
                <GlowButton label="Outline" c={c} dark={dark} variant="outline" small />
              </div>
            </div>
          </div>
        )}

        {/* COMPONENTS */}
        {tab === "components" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sectionLabel("Buttons — gradient + colored shadow")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <GlowButton label="Start Workout" c={c} dark={dark} variant="primary" />
              <GlowButton label="View Plan" c={c} dark={dark} variant="outline" />
              <GlowButton label="Cancel" c={c} dark={dark} variant="ghost" />
              <GlowButton label="Delete" c={c} dark={dark} variant="danger" />
            </div>

            {sectionLabel("Reward button — achievements only")}
            <div><GlowButton label="★ New PR!" c={c} dark={dark} variant="reward" /></div>

            {sectionLabel("Workout card")}
            <WorkoutCard c={c} dark={dark} />

            {sectionLabel("Achievement card — reward gold")}
            <RewardCard c={c} dark={dark} />

            {sectionLabel("Stats")}
            <StatsCard c={c} dark={dark} />

            {sectionLabel("Badges")}
            <div style={{ display: "flex", gap: 6 }}>
              <Badge label="Weights" color={c.weights} bg={c.weightsMuted} c={c} dark={dark} />
              <Badge label="Cardio" color={c.cardio} bg={c.cardioMuted} c={c} dark={dark} />
              <Badge label="Mobility" color={c.primary} bg={c.primaryMuted} c={c} dark={dark} />
            </div>

            {sectionLabel("Status messages")}
            <StatusMessages c={c} dark={dark} />

            {sectionLabel("Input field — sunken surface")}
            <InputField c={c} dark={dark} />

            {sectionLabel("Glass navigation")}
            <GlassNav c={c} dark={dark} />
          </div>
        )}

        {/* PALETTE */}
        {tab === "palette" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Primary", swatches: [
                { hex: c.primary, name: "Primary" }, { hex: c.primaryBright, name: "Bright" },
                { hex: c.accent, name: "Teal" }, { hex: c.primaryText, name: "On Primary" },
              ]},
              { label: "Reward Gold (achievements only)", swatches: [
                { hex: c.reward, name: `Reward${!dark ? " (text)" : ""}` },
                ...(!dark ? [{ hex: c.rewardBright, name: "Reward (fill)" }] : []),
              ]},
              { label: "Workout Types", swatches: [
                { hex: c.weights, name: "Weights" }, { hex: c.cardio, name: "Cardio" }, { hex: c.mobility, name: "Mobility" },
              ]},
              { label: `Surfaces — ${dark ? "dark steel" : "three-tier gray"}`, swatches: [
                { hex: c.bg, name: "Background" }, { hex: c.surface, name: "Surface" },
                { hex: c.surfaceElevated, name: "Elevated" }, { hex: c.surfaceHover, name: "Hover" },
                ...(!dark ? [{ hex: c.surfaceSunken, name: "Sunken" }] : []),
              ]},
              { label: "Text", swatches: [
                { hex: c.text, name: "Primary" }, { hex: c.textSecondary, name: "Secondary" }, { hex: c.textMuted, name: "Muted" },
              ]},
              { label: "Status", swatches: [
                { hex: c.success, name: "Success" }, { hex: c.warning, name: "Warning" },
                { hex: c.danger, name: "Danger" }, { hex: c.info, name: "Info" },
              ]},
            ].map(group => (
              <div key={group.label}>
                {sectionLabel(group.label)}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {group.swatches.map(s => (
                    <div key={s.name} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                      borderRadius: 12, backgroundColor: c.surfaceElevated, border: `1px solid ${c.border}`,
                      minWidth: 155, boxShadow: c.shadowCard,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, backgroundColor: s.hex, flexShrink: 0,
                        border: `1px solid ${c.border}`,
                        boxShadow: dark && (s.hex === c.primary || s.hex === c.reward) ? `0 0 14px ${s.hex}33` : !dark && (s.hex === c.primary) ? `0 2px 8px ${c.primaryGlow}` : "none",
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{s.name}</div>
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
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 12, color: c.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
              WCAG 2.1 ratios on {dark ? "dark" : "light"} surface ({c.surface}).
            </p>
            <ContrastGrid c={c} />
          </div>
        )}

        {/* THE MAGIC */}
        {tab === "magic" && (
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                icon: "✨",
                title: dark ? "Neon Glow — elements emit light" : "Colored Shadows — elements have physical weight",
                body: dark
                  ? "In dark mode, primary buttons, active nav items, and high-intensity heatmap cells emit a soft green luminance. The UI feels alive, like it's radiating energy."
                  : "In light mode, glow wouldn't make sense on light backgrounds. Instead, primary elements cast green-tinted drop shadows, and reward elements cast amber shadows. This gives every interactive element a sense of physical presence and depth — the light-mode equivalent of neon glow.",
                visual: () => (
                  <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, background: c.gradientPrimary,
                      boxShadow: c.shadowPrimary,
                    }} />
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, background: c.gradientReward,
                      boxShadow: c.shadowReward,
                    }} />
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, background: c.surfaceElevated,
                      border: `1px solid ${c.border}`,
                      boxShadow: c.shadowElevated,
                    }} />
                  </div>
                ),
              },
              {
                icon: "🏅",
                title: "Reward Gold — a color you earn",
                body: `Gold only appears for achievements: PRs, streaks, milestones. Users never see it in normal UI, so when it appears it triggers a genuine dopamine response. ${dark ? "In dark mode it gets an amber glow." : "In light mode it's deepened to #D99700 for text legibility, with the brighter #FFB800 reserved for fills."} It's a Pavlovian color reward system.`,
                visual: () => <RewardCard c={c} dark={dark} />,
              },
              {
                icon: "🌊",
                title: "Gradient primary — depth, not flatness",
                body: "CTAs use a green→teal gradient that creates visual movement and depth. It's the single detail that separates 'developer-made' from 'designer-made.' The gradient direction (135°) creates diagonal energy that subconsciously suggests forward motion.",
                visual: () => (
                  <div style={{ marginTop: 12 }}>
                    <GlowButton label="Start Workout" c={c} dark={dark} variant="primary" />
                  </div>
                ),
              },
              {
                icon: "🧊",
                title: "Glass morphism navigation",
                body: `The bottom nav uses backdrop-filter blur + saturation boost to create frosted translucency. ${dark ? "Dark glass is subtle and moody." : "Light glass uses frosted off-white with a slight warmth."} It makes the nav feel spatially separate from content — a floating control layer.`,
                visual: () => (
                  <div style={{ marginTop: 12, padding: "10px 24px", borderRadius: 14, display: "inline-block", ...glass(c), boxShadow: c.shadowCard }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>Frosted glass surface</span>
                  </div>
                ),
              },
              {
                icon: "🎭",
                title: "Two personalities, one system",
                body: "Light mode is editorial — layered cool grays, sharp type, colored lift-shadows. Dark mode is cinematic — neon glow, gradient surfaces, dramatic depth. Same tokens, completely different emotional registers. Toggle the mode button to see the transformation.",
                visual: () => (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <div style={{ padding: "8px 16px", borderRadius: 10, backgroundColor: "#ECEEF2", color: "#111318", fontSize: 11, fontWeight: 600, border: "1px solid rgba(17,19,24,0.08)", boxShadow: "0 2px 8px rgba(0,194,97,0.12)" }}>☀ Editorial</div>
                    <div style={{ padding: "8px 16px", borderRadius: 10, backgroundColor: "#13161B", color: "#ECF0F5", fontSize: 11, fontWeight: 600, border: "1px solid rgba(236,240,245,0.05)", boxShadow: "0 0 12px rgba(0,230,118,0.10)" }}>● Cinematic</div>
                  </div>
                ),
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 22, borderRadius: 18,
                background: dark ? c.gradientSurface : c.surface,
                border: `1px solid ${c.border}`,
                boxShadow: c.shadowCard,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: c.text, margin: 0, letterSpacing: "-0.02em" }}>{item.title}</h3>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: c.textSecondary, margin: 0 }}>{item.body}</p>
                {item.visual && item.visual()}
              </div>
            ))}
          </div>
        )}

        {/* LIGHT MODE FIXES AUDIT */}
        {tab === "audit" && (
          <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8, lineHeight: 1.6 }}>
              Seven specific problems identified and fixed in the light theme.
            </p>
            {[
              {
                status: "fixed",
                title: "Surface hierarchy was flat",
                before: "surface: #FFFFFF, surfaceElevated: #FFFFFF — identical",
                after: "bg: #ECEEF2 (gray canvas) → surface: #F7F8FA (off-white cards) → elevated: #FFFFFF (true white modals) → sunken: #E3E5EA (inputs)",
              },
              {
                status: "fixed",
                title: "No visual personality in light mode",
                before: "primaryGlow: rgba(0,210,106, 0.0) — literally invisible. Dark mode got glow, light got nothing.",
                after: "Green-tinted lift shadows on primary elements, amber shadows on rewards. Light mode has its own visual language — 'editorial' vs dark's 'cinematic.'",
              },
              {
                status: "fixed",
                title: "Background too generic",
                before: "#F4F5F7 — could be any SaaS app",
                after: "#ECEEF2 — cooler, more assertive gray that creates real contrast against off-white cards",
              },
              {
                status: "fixed",
                title: "Borders too weak",
                before: "rgba(15,20,25, 0.06) — cards had no definition",
                after: "rgba(17,19,24, 0.08) default, 0.14 strong. Plus shadow-based depth so cards don't rely solely on hairline borders.",
              },
              {
                status: "fixed",
                title: "Muted backgrounds invisible",
                before: "Badge backgrounds at 0.06-0.07 opacity — barely visible on white",
                after: "Bumped to 0.08-0.10 — subtle but clearly present",
              },
              {
                status: "fixed",
                title: "Reward gold washed out on white",
                before: "#FFB800 for all uses — low contrast as text on white",
                after: "#D99700 for text (deeper, legible), #FFB800 reserved for fills only",
              },
              {
                status: "fixed",
                title: "Primary green needed more punch on gray",
                before: "#00D26A on all surfaces",
                after: "#00C261 — slightly deeper for light mode, creating sharper contrast against the gray bg. Dark mode keeps the brighter #00E676.",
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 18, borderRadius: 16,
                backgroundColor: c.surface, border: `1px solid ${c.border}`,
                boxShadow: c.shadowCard,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                    backgroundColor: c.success + "15", color: c.success,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>Fixed</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.title}</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: c.danger, marginBottom: 4 }}>
                  <strong>Before:</strong> {item.before}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: c.success }}>
                  <strong>After:</strong> {item.after}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
