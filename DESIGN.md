---
name: Omar Mohamed Portfolio
description: Full-stack developer portfolio engineered for technical precision and hiring-manager legibility.
colors:
  signal-cyan: "#00d4ff"
  signal-cyan-contrast: "#0891b2"
  deep-system: "#070d1a"
  surface-panel: "#0f172a"
  surface-hover: "#1e293b"
  ink-bright: "#e2e8f0"
  ink-muted: "#94a3b8"
  ink-deep: "#0c1a29"
  ink-body: "#334155"
  light-base: "#f0f9ff"
  light-surface: "#e0f2fe"
  state-success: "#22c55e"
  state-error: "#ef4444"
typography:
  display:
    fontFamily: "Sora, Inter, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, Inter, sans-serif"
    fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Sora, Inter, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 600
    letterSpacing: "0.01em"
rounded:
  icon: "12px"
  input: "12px"
  card: "16px"
  modal: "24px"
  chip: "20px"
  pill: "50px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.9rem"
  button-primary-hover:
    backgroundColor: "#00e5ff"
  button-ghost:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.ink-bright}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.9rem"
  button-ghost-hover:
    backgroundColor: "rgba(0, 212, 255, 0.10)"
    textColor: "{colors.ink-bright}"
  tech-tag:
    backgroundColor: "rgba(0, 212, 255, 0.10)"
    textColor: "#a5f3fc"
    rounded: "{rounded.chip}"
    padding: "0.25rem 0.75rem"
  input:
    backgroundColor: "{colors.deep-system}"
    textColor: "{colors.ink-bright}"
    rounded: "{rounded.input}"
    padding: "0.95rem 1.15rem"
  input-focus:
    backgroundColor: "{colors.deep-system}"
    textColor: "{colors.ink-bright}"
---

# Design System: Omar Mohamed Portfolio

## 1. Overview

**Creative North Star: "The Instrument Panel"**

This design system is built around one commitment: every pixel justifies its existence as information or structure. Like a well-designed instrument panel — a cockpit, a server monitoring UI, a circuit board — the visual language communicates state and hierarchy through precise geometry, 1px borders, and a single functional accent color. Nothing decorates; everything reads.

The system runs dark by default. The deep navy substrate (`#070d1a`) is not a stylistic choice — it's the natural environment for a technical surface that needs to disappear and let content take precedence. The Signal Cyan (`#00d4ff`) functions the way a status LED does: it signals, confirms, and focuses. It is never painted across large surfaces. Its rarity is the point.

This is a brand surface whose primary audience is technical evaluators — recruiters, hiring managers, senior engineers — reviewing work quickly and skeptically. The system rejects decoration that performs competence. Instead, the design itself demonstrates the same architectural thinking found in the projects it showcases: clear separation of concerns, hierarchy that scales, components that compose without clutter.

**Key Characteristics:**
- Dark-first substrate; light mode is structurally identical, not an afterthought
- Signal Cyan is a functional signal, not a brand paint — used on interactive state, focus, and CTA anchors only
- Depth through 1px border geometry and color stratification, not decorative shadows or blur
- Two-family typography: Sora (display authority) + Inter (body legibility); no third family
- Components are taut — tight padding, controlled radii, every pixel justified

## 2. Colors: The Instrument Palette

A two-temperature system: neutral-dark for surfaces, Signal Cyan for state and interaction.

### Primary
- **Signal Cyan** (`#00d4ff`, light mode: `#0891b2`): The sole interactive accent. Used on focus rings, active nav indicators, CTA button fills, hover border transitions, and link highlights. Never as a background fill for non-interactive elements.

### Neutral
- **Deep System** (`#070d1a`): Body background in dark mode. Ultra-deep navy — not true black, not slate. The zero-elevation surface.
- **Surface Panel** (`#0f172a`): Cards, form containers, elevated surfaces. One step above Deep System. The UI layer on which content rests.
- **Surface Hover** (`#1e293b`): Interactive surface state — hover backgrounds, tertiary fills, skeleton loaders.
- **Ink Bright** (`#e2e8f0`): Primary text on dark. High-contrast slate-200.
- **Ink Muted** (`#94a3b8`): Secondary text, captions, disabled states. Slate-400.
- **Light Base** (`#f0f9ff`): Body background in light mode. A barely-there cyan tint — not warm, not cream.
- **Light Surface** (`#e0f2fe`): Card and secondary background in light mode.
- **Ink Deep** (`#0c1a29`): Primary text on light. Rich dark navy.
- **Ink Body** (`#334155`): Secondary text on light. Slate-700.

### Status
- **State Success** (`#22c55e`): Available status indicator, form success. Used with restraint.
- **State Error** (`#ef4444`): Form validation errors. Full red; no ambiguity.

### Named Rules
**The Signal Rule.** Signal Cyan appears on ≤15% of any given screen surface. Its rarity is what makes it work as a focus indicator. An interface where cyan is everywhere is an interface where cyan means nothing.

**The No-Warmth Rule.** No warm-tinted neutrals. No cream, sand, or beige. The neutral band is cool navy-slate from `#070d1a` to `#f0f9ff`. Warmth is carried by copy and project imagery, never by background color.

## 3. Typography

**Display Font:** Sora (with Inter, -apple-system as fallback)
**Body Font:** Inter (with -apple-system, BlinkMacSystemFont, Segoe UI as fallback)

**Character:** Sora brings geometric authority to headings — its high x-height and tight letter forms read as engineered, not expressive. Inter handles everything below headline scale; its optical sizing and legibility metrics are designed for exactly this information density. The pairing works on a contrast axis: Sora commands, Inter delivers.

### Hierarchy
- **Display** (800w, `clamp(2rem, 5vw, 3.8rem)`, line-height 1.08, tracking −0.03em): Hero heading only. One per page.
- **Headline** (800w, `clamp(1.9rem, 3.5vw, 2.5rem)`, line-height 1.18, tracking −0.025em): Section titles. Sora.
- **Title** (700w, `1.75rem`, line-height 1.25, tracking −0.01em): Card titles, form headers, modal headings. Sora.
- **Body** (400w, `1rem`, line-height 1.6): All prose. Inter. Max line length 65–75ch. On dark backgrounds: line-height 1.7.
- **Label** (600–700w, `0.88rem`, letter-spacing 0.01em): Form labels, metadata, UI captions. Inter. Never uppercase-tracked across large spans.

### Named Rules
**The Two-Family Rule.** Sora and Inter only. No third family for code, captions, or emphasis. Monospace is a costume; this is a portfolio, not a terminal emulator.

**The Tracking Floor Rule.** Display letter-spacing floor is −0.03em. Never tighter. Tighter tracking makes letters touch and reads as cramped, not designed.

## 4. Elevation

This system uses **functional layering**, not decorative shadows. Depth is expressed through color stratification (Deep System → Surface Panel → Surface Hover) and defined by 1px borders. Shadows appear only in two contexts: state transitions (hover lifts a card) and functional overlays (navbar, modal backdrops).

The navbar and modals/dialogs are the only components that use `backdrop-filter: blur()`. This is intentional — blur communicates "I float above the page" in a system that is otherwise flat. Applying blur to cards or section backgrounds dilutes this signal into decorative glassmorphism.

### Shadow Vocabulary
- **Ambient Low** (`0 1px 2px rgba(0,0,0,0.30)` dark / `0 1px 2px rgba(12,26,41,0.05)` light): Barely-there structural lift. Rarely used directly.
- **Ambient Mid** (`0 4px 12px rgba(0,0,0,0.40)` dark): Cards at rest.
- **Hover Lift** (`0 8px 28px rgba(0,0,0,0.45)` dark): Applied on card hover. Maximum blur 28px.
- **Cyan Glow** (`0 4px 16px rgba(0,212,255,0.32)`): CTA buttons only. One per viewport.

### Named Rules
**The Glass Boundary Rule.** `backdrop-filter: blur()` is used in exactly two contexts: the sticky navbar and full-screen modal overlays. Any other use is prohibited. Blur carries the meaning "elevated overlay"; diluting it to cards makes it meaningless.

**The Flat-By-Default Rule.** Card surfaces are flat at rest, defined by their `1px solid` boundary. The shadow appears on hover as a state transition — communicating "lifting toward you" in response to interaction, not as ambient decoration.

## 5. Components

All components share the "taut and purposeful" character: tight padding, controlled radii, no decorative slack.

### Buttons
- **Shape:** Pill (50px radius) for primary and ghost CTAs. Gently rounded (14px) for inline/submit actions within forms.
- **Primary:** Signal Cyan gradient fill (`linear-gradient(135deg, #0891b2, #00d4ff)`), white text, 700w. Padding: 0.9rem 1.9rem. Resting shadow: `0 4px 16px rgba(0,212,255,0.32)`.
- **Hover:** Translate up 3px, shadow expands. Reversed gradient cross-fades via `::before` opacity — gradient is never re-declared on hover.
- **Active:** Returns to 0 translate, scale 0.98.
- **Ghost:** Surface Panel background, `1.5px solid {border}`, Ink Bright text. Hover: background → `rgba(0,212,255,0.10)`, border → Signal Cyan. No lift transform.
- **Focus visible:** `outline: 2px solid #00d4ff; outline-offset: 2px`. Outline only — no box-shadow on focus.

### Tech Tags / Chips
The system's signature dense-metadata component. Displays technology names (MERN, Next.js, OpenCV, Blender) without cluttering.

- **Dark mode:** `rgba(0,212,255,0.10)` background, `#a5f3fc` (cyan-200) text, `1px solid rgba(0,212,255,0.25)` border, 20px radius, padding `0.25rem 0.75rem`, 0.78rem/700w.
- **Light mode:** `rgba(8,145,178,0.10)` background, `#0a4f63` text, `1px solid rgba(8,145,178,0.28)` border.
- **Hover:** Background to `rgba(0,212,255,0.18)`, border opacity increases. No transform — tags don't lift.
- **Density rule:** Tags wrap naturally at their compact default size. Never increase padding to add visual weight in a dense tag list — compactness is the point.
- **Large variant (`tech-tag-lg`):** 0.5rem/1.1rem padding, 0.88rem size. For project detail modals only.

### Cards / Project Containers
- **Corner Style:** Gently curved (16px radius). Hard cap at 20px. Never 24px+ on a card.
- **Background dark:** `rgba(15, 23, 42, 0.65)` flat at rest. No blur on card surfaces.
- **Background light:** `#ffffff` or `rgba(255,255,255,0.75)` in hero context only.
- **Border:** `1px solid rgba(0,212,255,0.08)` dark / `1px solid rgba(203,213,225,0.80)` light. Always present. The border IS the card geometry.
- **Shadow:** Light ambient at rest (`0 4px 20px rgba(0,0,0,0.35)`). Hover: directional lift only. **Never pair a wide box-shadow (blur ≥16px) with the 1px border at rest** — this is the ghost-card anti-pattern.
- **Hover:** `translateY(-6px)` max. Border shifts to `rgba(0,212,255,0.30)`.
- **Internal Padding:** 1.5rem (24px).

### Inputs / Fields
- **Style:** `1.5px solid {border}` stroke, 12px radius, padding `0.95rem 1.15rem`. Flat background.
- **Focus:** Border → Signal Cyan (`#00d4ff`). Shadow: `0 0 0 3px rgba(0,212,255,0.18)`. The most important single use of cyan outside CTA buttons — it should read as precise machine confirmation.
- **Light mode focus:** Border `#0891b2`, shadow `0 0 0 3px rgba(8,145,178,0.16)`, background → `#f0f9ff`.
- **Error:** Border `#ef4444`, shadow `0 0 0 3px rgba(239,68,68,0.12)`.
- **Disabled:** Opacity 0.5 only.

### Navigation
- **Style:** Fixed, 76px height. Glassmorphism (`backdrop-filter: blur(24px)`) on `var(--glass-bg)` — one of the two sanctioned blur uses.
- **Links:** Ink Muted (`#94a3b8`) default, 0.93rem/500w. Hover → Ink Bright. Signal Cyan underline slides in via `width` transition (2px height, glow `0 0 8px rgba(0,212,255,0.5)`).
- **Active route:** Ink Bright, underline fully extended.
- **Mobile:** Hamburger → slide-down panel. `translateY` + opacity transition, `cubic-bezier(0.4, 0, 0.2, 1)`.

## 6. Do's and Don'ts

### Do:
- **Do** reserve Signal Cyan exclusively for interactive state, focus rings, active indicators, and primary CTA fills. Its rarity is the mechanism.
- **Do** define card geometry with `1px solid` border. The border is the card — not a shadow, not blur.
- **Do** use hover shadows as state transitions: flat at rest, lifted on hover. One directional lift shadow per interactive card.
- **Do** apply `backdrop-filter: blur()` only to the sticky navbar and full-screen modal overlays. Two contexts, no more.
- **Do** use `text-wrap: balance` on h1–h2 and `text-wrap: pretty` on body paragraphs.
- **Do** write focus states with `outline: 2px solid #00d4ff; outline-offset: 2px` on every interactive element.
- **Do** keep tech tags at compact default sizing (0.78rem, 0.25rem/0.75rem padding) even in dense lists. Compactness is a feature.
- **Do** provide `@media (prefers-reduced-motion: reduce)` alternatives for every transform and animation — instant state transitions, not removed feedback.

### Don't:
- **Don't** use `background-clip: text` with a gradient (`-webkit-text-fill-color: transparent`). Gradient text is an absolute ban. Emphasis through weight or size only. *(Existing violations on `.name`, `.role`, `.statNumber` are known technical debt to be resolved.)*
- **Don't** pair a wide box-shadow (blur ≥16px) with a `1px solid` border on the same element at rest. This is the ghost-card anti-pattern.
- **Don't** apply `backdrop-filter: blur()` to cards, tooltips, section backgrounds, or any surface other than navbar and modals.
- **Don't** use bounce or elastic easing (`cubic-bezier(0.34, 1.56, 0.64, 1)` or any overshoot curve). Ease-out only: `cubic-bezier(0.4, 0, 0.2, 1)` standard.
- **Don't** add cartoony illustrations, floating emojis, or decorative oversized elements. The portfolio is evidence of engineering discipline; the design must be too.
- **Don't** use warm-tinted neutrals (cream, sand, beige, `oklch(L>0.84, C<0.06, H 40–100)`) for any background surface.
- **Don't** use `border-radius` above 20px on card surfaces, or above 16px on input fields.
- **Don't** introduce a third typeface. Sora + Inter only.
