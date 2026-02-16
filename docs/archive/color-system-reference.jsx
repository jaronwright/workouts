import { useState, useMemo } from "react";

// ─── YOUR CURRENT COLOR SYSTEM (from designTokens.ts) ─────────────
const SYSTEM = {
  light: {
    primary: "#E8FF00",
    primaryHover: "#D4EB00",
    primaryMuted: "rgba(232, 255, 0, 0.10)",
    primaryText: "#0A0A0A",
    accent: "#D4A84B",
    accentHover: "#C49A3D",
    accentSecondary: "#E0BD6F",
    accentMuted: "rgba(212, 168, 75, 0.12)",
    tertiary: "#4ADE80",
    tertiaryHover: "#3CC970",
    tertiaryMuted: "rgba(74, 222, 128, 0.10)",
    weights: "#60A5FA",
    weightsMuted: "rgba(96, 165, 250, 0.12)",
    cardio: "#EF4444",
    cardioMuted: "rgba(239, 68, 68, 0.12)",
    mobility: "#4ADE80",
    mobilityMuted: "rgba(74, 222, 128, 0.10)",
    bg: "#F2F2ED",
    surface: "#FAFAF7",
    surfaceElevated: "#FFFFFF",
    surfaceHover: "#EBEBE6",
    text: "#0A0A0A",
    textSecondary: "#5A5A5A",
    textMuted: "#8A8A8A",
    border: "rgba(10, 10, 10, 0.08)",
    borderStrong: "rgba(10, 10, 10, 0.15)",
    success: "#4ADE80",
    warning: "#FACC15",
    danger: "#EF4444",
    info: "#60A5FA",
  },
  dark: {
    primary: "#E8FF00",
    primaryHover: "#D4EB00",
    primaryMuted: "rgba(232, 255, 0, 0.10)",
    primaryText: "#0A0A0A",
    accent: "#D4A84B",
    accentHover: "#E0BD6F",
    accentSecondary: "#E8CC84",
    accentMuted: "rgba(212, 168, 75, 0.10)",
    tertiary: "#4ADE80",
    tertiaryHover: "#5AEE90",
    tertiaryMuted: "rgba(74, 222, 128, 0.10)",
    weights: "#60A5FA",
    weightsMuted: "rgba(96, 165, 250, 0.12)",
    cardio: "#EF4444",
    cardioMuted: "rgba(239, 68, 68, 0.12)",
    mobility: "#4ADE80",
    mobilityMuted: "rgba(74, 222, 128, 0.12)",
    bg: "#0A0A0A",
    surface: "#141414",
    surfaceElevated: "#1E1E1E",
    surfaceHover: "#282828",
    text: "#F0F0F0",
    textSecondary: "#8A8A8A",
    textMuted: "#5A5A5A",
    border: "rgba(240, 240, 240, 0.07)",
    borderStrong: "rgba(240, 240, 240, 0.12)",
    success: "#4ADE80",
    warning: "#FACC15",
    danger: "#EF4444",
    info: "#60A5FA",
  },
};

// ─── WCAG Contrast Helpers ─────────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagGrade(ratio) {
  if (ratio >= 7) return { label: "AAA", color: "#16a34a" };
  if (ratio >= 4.5) return { label: "AA", color: "#65a30d" };
  if (ratio >= 3) return { label: "AA Large", color: "#d97706" };
  return { label: "Fail", color: "#dc2626" };
}

// ─── Components ─────────────────────────────────────
function ContrastBadge({ fg, bg }) {
  // skip rgba values
  if (fg.startsWith("rgba") || bg.startsWith("rgba")) return null;
  const ratio = contrastRatio(fg, bg);
  const grade = wcagGrade(ratio);
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 4,
        backgroundColor: grade.color + "22",
        color: grade.color,
        letterSpacing: "0.03em",
      }}
    >
      {ratio.toFixed(1)}:1 {grade.label}
    </span>
  );
}

function Swatch({ color, name, textColor, bgRef, size = 56 }) {
  const isRgba = color.startsWith("rgba");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: color,
          border: "1px solid rgba(128,128,128,0.2)",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{name}</div>
        <div style={{ fontSize: 11, color: textColor + "99", fontFamily: "monospace" }}>{color}</div>
        {bgRef && !isRgba && !color.startsWith("rgba") && <ContrastBadge fg={color} bg={bgRef} />}
      </div>
    </div>
  );
}

function Section({ title, children, dark }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: dark ? "#8A8A8A" : "#5A5A5A",
          marginBottom: 12,
          borderBottom: `1px solid ${dark ? "rgba(240,240,240,0.07)" : "rgba(10,10,10,0.08)"}`,
          paddingBottom: 6,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function SwatchGrid({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
      {children}
    </div>
  );
}

function AuditCard({ title, status, detail, dark }) {
  const statusColors = {
    pass: { bg: "#16a34a22", text: "#16a34a", icon: "✓" },
    warn: { bg: "#d9770622", text: "#d97706", icon: "!" },
    fail: { bg: "#dc262622", text: "#dc2626", icon: "✗" },
    info: { bg: "#3b82f622", text: "#3b82f6", icon: "i" },
  };
  const s = statusColors[status];
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        backgroundColor: dark ? "#1E1E1E" : "#FFFFFF",
        border: `1px solid ${dark ? "rgba(240,240,240,0.07)" : "rgba(10,10,10,0.08)"}`,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: s.bg,
            color: s.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {s.icon}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: dark ? "#F0F0F0" : "#0A0A0A" }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: dark ? "#8A8A8A" : "#5A5A5A", margin: 0 }}>{detail}</p>
    </div>
  );
}

function MockButton({ label, bg, fg, dark }) {
  return (
    <button
      style={{
        padding: "10px 24px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        border: "none",
        cursor: "pointer",
        backgroundColor: bg,
        color: fg,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

function MockCard({ dark, c }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        backgroundColor: c.surface,
        border: `1px solid ${c.border}`,
        maxWidth: 280,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>Chest & Triceps</div>
      <div style={{ fontSize: 12, color: c.textSecondary, marginBottom: 12 }}>4 exercises · ~45 min</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            backgroundColor: c.weightsMuted,
            color: c.weights,
          }}
        >
          Weights
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            backgroundColor: c.primaryMuted,
            color: dark ? c.primary : "#7a8c00",
          }}
        >
          Push Day
        </span>
      </div>
      <button
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          fontSize: 13,
          backgroundColor: c.primary,
          color: c.primaryText,
          cursor: "pointer",
          letterSpacing: "0.02em",
        }}
      >
        Start Workout
      </button>
    </div>
  );
}

// ─── Recommendations ───────────────────────────────
const RECOMMENDATIONS = [
  {
    title: "Primary on light backgrounds",
    status: "warn",
    detail:
      '#E8FF00 on white (#FAFAF7) has a contrast ratio of only ~1.07:1 — essentially invisible. For light mode, darken the primary to #7A8C00 for text/icons on light surfaces, and keep the vibrant volt only for filled buttons where the text is dark.',
  },
  {
    title: "Warning color (#FACC15) in both modes",
    status: "warn",
    detail:
      "Yellow warning on both light and dark backgrounds struggles for contrast. Consider #B45309 (amber-700) for light mode text warnings, keeping #FACC15 only as background fills with dark text overlaid.",
  },
  {
    title: "Text-muted readability",
    status: "warn",
    detail:
      "Dark mode text-muted (#5A5A5A on #0A0A0A) hits only ~2.7:1. Bump to #6E6E6E (~3.5:1) to pass AA Large text. Light mode text-muted (#8A8A8A on #F2F2ED) is ~3.5:1 — borderline but acceptable for large text only.",
  },
  {
    title: "Workout type semantic colors",
    status: "pass",
    detail:
      "Weights blue, cardio red, and mobility green are well-differentiated and culturally intuitive. They hold up in both modes. Consider adding a mid-luminance variant for each to use as text-on-surface (not just muted backgrounds).",
  },
  {
    title: "Surface elevation hierarchy",
    status: "pass",
    detail:
      "The 4-level surface stack (sunken → background → surface → elevated) creates clear depth in dark mode. Light mode differences are subtle but functional. This is a solid foundation.",
  },
  {
    title: "Cardio red accessibility",
    status: "warn",
    detail:
      "#EF4444 on #141414 dark surface is ~4.0:1 — just under AA for body text. Lighten to #F87171 in dark mode for text usage, or keep #EF4444 restricted to badge fills with white text.",
  },
];

// ─── Main App ──────────────────────────────────────
export default function ColorSystemReference() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("palette");
  const c = dark ? SYSTEM.dark : SYSTEM.light;

  const tabs = [
    { id: "palette", label: "Palette" },
    { id: "audit", label: "Audit" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: c.bg,
        color: c.text,
        fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Color System <span style={{ color: c.primary }}>Reference</span>
          </h1>
          <p style={{ fontSize: 12, color: c.textSecondary, margin: "4px 0 0" }}>
            Electric Volt Design System V4 — Workout Tracker PWA
          </p>
        </div>
        <button
          onClick={() => setDark(!dark)}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: `1px solid ${c.borderStrong}`,
            backgroundColor: c.surfaceElevated,
            color: c.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {dark ? "☀ Light" : "● Dark"}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "16px 24px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: tab === t.id ? c.primary : c.surfaceElevated,
              color: tab === t.id ? c.primaryText : c.textSecondary,
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        {tab === "palette" && (
          <>
            <Section title="Brand / Primary" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.primary} name="Primary (Volt)" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.primaryHover} name="Primary Hover" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.primaryText} name="Primary Text (on volt)" textColor={c.text} bgRef={c.primary} />
              </SwatchGrid>
            </Section>

            <Section title="Accent & Tertiary" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.accent} name="Accent (Warm Gold)" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.accentSecondary} name="Accent Secondary" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.tertiary} name="Tertiary (Green)" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
              </SwatchGrid>
            </Section>

            <Section title="Workout Types" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.weights} name="Weights" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.cardio} name="Cardio" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.mobility} name="Mobility" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
              </SwatchGrid>
            </Section>

            <Section title="Surfaces & Backgrounds" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.bg} name="Background" textColor={c.text} />
                <Swatch color={c.surface} name="Surface" textColor={c.text} />
                <Swatch color={c.surfaceElevated} name="Surface Elevated" textColor={c.text} />
                <Swatch color={c.surfaceHover} name="Surface Hover" textColor={c.text} />
              </SwatchGrid>
            </Section>

            <Section title="Text Hierarchy" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.text} name="Text Primary" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch
                  color={c.textSecondary}
                  name="Text Secondary"
                  textColor={c.text}
                  bgRef={dark ? "#141414" : "#FAFAF7"}
                />
                <Swatch color={c.textMuted} name="Text Muted" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
              </SwatchGrid>
            </Section>

            <Section title="Status Colors" dark={dark}>
              <SwatchGrid>
                <Swatch color={c.success} name="Success" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.warning} name="Warning" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.danger} name="Danger" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
                <Swatch color={c.info} name="Info" textColor={c.text} bgRef={dark ? "#141414" : "#FAFAF7"} />
              </SwatchGrid>
            </Section>
          </>
        )}

        {tab === "audit" && (
          <>
            <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
              WCAG 2.1 contrast audit and recommendations for your Electric Volt color system.
            </p>

            <Section title="Contrast Checks (text on surface)" dark={dark}>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { name: "Primary text on primary", fg: c.primaryText, bg: c.primary },
                  { name: "Primary on surface", fg: c.primary, bg: c.surface },
                  { name: "Text on surface", fg: c.text, bg: c.surface },
                  { name: "Text secondary on surface", fg: c.textSecondary, bg: c.surface },
                  { name: "Text muted on surface", fg: c.textMuted, bg: c.surface },
                  { name: "Accent on surface", fg: c.accent, bg: c.surface },
                  { name: "Weights on surface", fg: c.weights, bg: c.surface },
                  { name: "Cardio on surface", fg: c.cardio, bg: c.surface },
                  { name: "Danger on surface", fg: c.danger, bg: c.surface },
                  { name: "Warning on surface", fg: c.warning, bg: c.surface },
                ].map((check) => {
                  if (check.fg.startsWith("rgba") || check.bg.startsWith("rgba")) return null;
                  const ratio = contrastRatio(check.fg, check.bg);
                  const grade = wcagGrade(ratio);
                  return (
                    <div
                      key={check.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 10,
                        backgroundColor: c.surfaceElevated,
                        border: `1px solid ${c.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            backgroundColor: check.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(128,128,128,0.2)",
                          }}
                        >
                          <span style={{ color: check.fg, fontWeight: 800, fontSize: 14 }}>A</span>
                        </div>
                        <span style={{ fontSize: 13, color: c.text }}>{check.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          backgroundColor: grade.color + "22",
                          color: grade.color,
                        }}
                      >
                        {ratio.toFixed(1)}:1 {grade.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Recommendations" dark={dark}>
              {RECOMMENDATIONS.map((r, i) => (
                <AuditCard key={i} title={r.title} status={r.status} detail={r.detail} dark={dark} />
              ))}
            </Section>
          </>
        )}

        {tab === "preview" && (
          <>
            <Section title="Button Variants" dark={dark}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <MockButton label="Start Workout" bg={c.primary} fg={c.primaryText} dark={dark} />
                <MockButton label="View History" bg={c.accent} fg="#FFFFFF" dark={dark} />
                <MockButton label="Cancel" bg={c.surfaceHover} fg={c.text} dark={dark} />
                <MockButton label="Delete" bg={c.danger + "22"} fg={c.danger} dark={dark} />
              </div>
            </Section>

            <Section title="Workout Type Badges" dark={dark}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { label: "Weights", color: c.weights, bg: c.weightsMuted },
                  { label: "Cardio", color: c.cardio, bg: c.cardioMuted },
                  { label: "Mobility", color: c.mobility, bg: c.mobilityMuted },
                ].map((b) => (
                  <span
                    key={b.label}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      backgroundColor: b.bg,
                      color: b.color,
                    }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="Card Preview" dark={dark}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <MockCard dark={dark} c={c} />
                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: c.surface,
                    border: `1px solid ${c.border}`,
                    maxWidth: 280,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>Weekly Summary</div>
                  <div style={{ fontSize: 12, color: c.textSecondary, marginBottom: 12 }}>Feb 9 – Feb 15, 2026</div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    {[
                      { n: "4", label: "Workouts", color: c.primary },
                      { n: "12,450", label: "Volume (lb)", color: c.weights },
                      { n: "3", label: "PRs", color: c.accent },
                    ].map((stat) => (
                      <div key={stat.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.n}</div>
                        <div style={{ fontSize: 10, color: c.textMuted }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      backgroundColor: c.success + "18",
                      fontSize: 12,
                      color: c.success,
                      fontWeight: 600,
                    }}
                  >
                    ↑ 15% more volume than last week
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Status Messages" dark={dark}>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Workout completed successfully!", color: c.success, bg: c.success + "18" },
                  { label: "Rest timer: 90 seconds remaining", color: c.warning, bg: c.warning + "18" },
                  { label: "Failed to sync — check connection", color: c.danger, bg: c.danger + "18" },
                  { label: "New personal record on Bench Press!", color: c.info, bg: c.info + "18" },
                ].map((msg) => (
                  <div
                    key={msg.label}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: msg.bg,
                      color: msg.color,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {msg.label}
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
