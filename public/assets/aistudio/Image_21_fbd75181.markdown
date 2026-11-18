---
name: Institutional Yield Engine
colors:
  surface: '#fbf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#eae8e2'
  surface-container-highest: '#e4e2dc'
  on-surface: '#1b1c18'
  on-surface-variant: '#444934'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f1ea'
  outline: '#747962'
  outline-variant: '#c4c9ae'
  surface-tint: '#506600'
  primary: '#506600'
  on-primary: '#ffffff'
  primary-container: '#c6f432'
  on-primary-container: '#566d00'
  inverse-primary: '#aad600'
  secondary: '#5b5f63'
  on-secondary: '#ffffff'
  secondary-container: '#dde0e5'
  on-secondary-container: '#5f6368'
  tertiary: '#565f6b'
  on-tertiary: '#ffffff'
  tertiary-container: '#dbe4f2'
  on-tertiary-container: '#5d6671'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5f331'
  primary-fixed-dim: '#aad600'
  on-primary-fixed: '#161f00'
  on-primary-fixed-variant: '#3b4d00'
  secondary-fixed: '#e0e3e8'
  secondary-fixed-dim: '#c3c7cc'
  on-secondary-fixed: '#181c20'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#dae3f1'
  tertiary-fixed-dim: '#bec7d5'
  on-tertiary-fixed: '#131c26'
  on-tertiary-fixed-variant: '#3f4853'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e2dc'
typography:
  display:
    fontFamily: Oswald
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Oswald
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Oswald
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-md:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Oswald
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.04em
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.03em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for institutional treasury managers, fund directors, and sophisticated liquidity allocators who manage high-yield cash equivalents and institutional fixed-income instruments. The brand personality is unapologetically engineered, utilitarian, and exact. It blends Swiss typographic rigor with neo-brutalist financial instrumentation—rejecting decorative consumer-fintech softness in favor of dense, high-signal data interfaces.

Key characteristics:
- **Zero Illusion:** No simulated physical depth, skeuomorphic gloss, or fuzzy atmospheric drop shadows. Structural hierarchy is asserted solely through hairline dividers, contrasting tone blocks, and distinct typographic density.
- **Architectural Precision:** Every container, data cell, and interactive trigger is strictly aligned to a calibrated modular grid, communicating terminal-grade stability.
- **Calculated Energy:** A high-visibility acid lime accent breaks through an otherwise muted palette of pale stone and deep graphite, spotlighting yield deltas, terminal liquidity states, and definitive execution pathways.

## Colors

The palette operates under a high-contrast industrial logic built upon a tactile stone substrate:

- **Primary Accent (`#C6F432`):** Acid Lime. Reserved exclusively for key value-creation drivers: APY/yield metrics, active transaction triggers, liquidity call-to-actions, and positive state differentials. Primary elements always pair Acid Lime with high-contrast `#23272B` ink.
- **Structural Graphite (`#23272B`):** Deep carbon utilized for dense display headings, primary body copy, inverted institutional stat cards, and structural grid rules.
- **Support Steel (`#6B7480`):** Neutralized mid-tone dedicated to ledger metadata, secondary axis labels, timestamps, counterparty identifiers, and disabled states.
- **Canvas Pale Stone (`#E4E2DC`):** The foundational substrate, evoking archival paper and architectural concrete rather than generic display white.
- **Elevated Surface Light (`#ECEAE4`):** Secondary container surface providing baseline tonal separation without introducing border clutter or elevation blur.
- **Border Rules:** Structured using solid 1px `#23272B` on major sectional boundaries and high-density panels, with subtle `#23272B20` (12% graphite) for inner modular cell dividers.

## Typography

The typography system relies on a functional tri-font engine:

1. **Oswald (Condensed Display Sans):** Delivers muscular, architectural headlines reminiscent of physical exchange trading boards and sovereign bond prospectuses. Always displayed in uppercase or strict title case for section titles, major balance totals, and modal headers.
2. **Inter (Interface & Editorial Core):** Neutral, highly legible geometric workhorse handling documentation, risk disclosures, form inputs, and transactional logs.
3. **JetBrains Mono (Quantitative & Tabular Data):** Enforces strict tabular alignment (`font-variant-numeric: tabular-nums`) across currency amounts, transaction IDs, APY badges, basis point tables, and balance changes. Monospaced rendering ensures numerical precision without horizontal jitter across streaming updates.

## Layout & Spacing

The layout employs an analytical 12-column grid prioritizing density, scan speed, and zero wasted margins:

- **Desktop (1280px+):** 12-column structure with `gutter-lg` (1.5rem) and `margin-lg` (2.5rem). High-level dashboard layouts split into asymmetric splits (e.g., 8-column ledger/charts vs. 4-column liquidity allocation & yield actions).
- **Tablet (768px - 1279px):** 8-column layout with `gutter` (1rem) and `margin-md` (1.5rem). Secondary action panels collapse into tabbed segments beneath the primary yield curve.
- **Mobile (<768px):** 4-column layout with `gutter` (1rem) and `margin` (1rem). Ledger tables convert to high-density tabular cards with sticky transaction trigger bars.
- **Rhythm:** Modular increments of 4px and 8px govern internal padding, enforcing sharp vertical cadence between data rows, metadata labels, and metric readouts.

## Elevation & Depth

This system operates without synthetic ambient shadows or fuzzy blur overlays. Depth is flat and purely structural:

- **Tonal Stepping:** The baseline begins at Pale Stone (`#E4E2DC`). Active modular blocks step up to Surface Light (`#ECEAE4`), while high-priority liquidity monitors or summary vaults drop into inverted Structural Graphite (`#23272B`).
- **Crisp Structural Borders:** Surfaces are delineated by razor-sharp 1px hairline rules. Section containers feature 1px `#23272B` borders, while inner cell matrices use 1px `#23272B20`.
- **Zero Diffused Shadows:** No `box-shadow` blurs are permitted. Hover or selection feedback is conveyed via 1px solid offset strokes, fill color shifts, or inverse background fills (e.g., transitioning from Pale Stone to pure Acid Lime `#C6F432`).
- **Overlays & Drawers:** Critical transaction dialogs and deposit execution modals use a solid 1px `#23272B` outline against a `#23272B60` tinted flat backdrop, maintaining crisp edges without blurred drop-shadows.

## Shapes

The interface is defined by calibrated, mechanical micro-radii:

- **Standard Radius:** All interactive buttons, metric panels, data cells, inputs, and badges consistently enforce a strict 6px radius (`0.375rem`).
- **No Pill Shapes:** Fully rounded / pill-shaped buttons are explicitly disallowed, preserving the architectural, terminal-like aesthetic.
- **Embedded Dividers:** Nested metric cells inside parent containers snap cleanly together with shared internal 1px hairpins, creating monolithic data clusters without floating pill artifacts.

## Components

### Buttons
- **Primary Execution (Yield / Deposit):** Solid Acid Lime (`#C6F432`) background, crisp `#23272B` text, 6px border-radius, font-family Oswald or Inter Semi-Bold uppercase, letter-spacing +0.02em. Hover: `#D4F758`. Active: 1px inset `#23272B`.
- **Secondary (Institutional Allocation / Export):** Structural Graphite (`#23272B`) background with Pale Stone (`#E4E2DC`) text. Hover: `#33393F`.
- **Outline / Utility:** Surface light (`#ECEAE4`) background, 1px solid `#23272B`, text `#23272B`. Hover: `#23272B` background with `#E4E2DC` text (instant inversion).

### Yield & Metric Badges
- High-yield indicators display prominently in JetBrains Mono, enclosed in a 1px `#23272B` bordered chip with an Acid Lime (`#C6F432`) background and `#23272B` text.
- Secondary status badges (settled, pending, locked) use Surface Light (`#ECEAE4`) with Steel (`#6B7480`) typography.

### Data Tables & Ledger Rows
- Table headers utilize Oswald or JetBrains Mono uppercase, 10px-12px, tracking +0.06em, text Steel (`#6B7480`), anchored by a 1px solid `#23272B` bottom border.
- Rows feature 1px `#23272B15` horizontal rules, padding of 12px vertical.
- Numerical values strictly enforce `JetBrains Mono` and `font-variant-numeric: tabular-nums` to guarantee vertical decimal alignment across multi-million institutional balances.

### Input Fields
- Background: Surface Light (`#ECEAE4`), 1px solid `#23272B20` border, 6px radius.
- Focus state: 1px solid `#23272B` outline (no soft halo or glow).
- Currency affix (e.g., "USD", "EUR", "bps") rendered in JetBrains Mono Steel (`#6B7480`).

### Cards & Institutional Vault Panels
- Structural cards feature Surface Light (`#ECEAE4`) or inverted Structural Graphite (`#23272B`), bounded by a 1px border.
- Cards contain dedicated "Kicker" headers (Oswald, uppercase, 12px, Steel) positioned directly above the main tabular numerical outputs.
- Inverted graphite cards display Acid Lime (`#C6F432`) APY figures and Pale Stone (`#E4E2DC`) secondary labels to emphasize high-yield accounts.

### Checkboxes & Segmented Controls
- Segmented switches feature an outer 1px `#23272B` border box with 6px radius. Active segment flips instantly to `#23272B` with `#C6F432` or `#E4E2DC` text; inactive segment remains `#ECEAE4` with `#6B7480` text.
- Checkboxes are 16x16px squares with 2px corner radius and a 1px `#23272B` stroke; checked state fills with `#23272B` displaying an Acid Lime checkmark.