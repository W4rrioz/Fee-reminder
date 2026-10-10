---
name: Ledger Calm
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#464553'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#777584'
  outline-variant: '#c8c4d5'
  surface-tint: '#544fc0'
  primary: '#1f108e'
  on-primary: '#ffffff'
  primary-container: '#3730a3'
  on-primary-container: '#a9a7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#003514'
  on-tertiary: '#ffffff'
  tertiary-container: '#004e20'
  on-tertiary-container: '#62c378'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3b35a7'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#95f8a7'
  tertiary-fixed-dim: '#79db8d'
  on-tertiary-fixed: '#00210a'
  on-tertiary-fixed-variant: '#005323'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-currency:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  touch-min: 48px
  gutter-mobile: 16px
  card-padding: 16px
  stack-gap-sm: 8px
  stack-gap-md: 12px
  stack-gap-lg: 16px
  section-gap: 24px
---

## Brand & Style

This design system is engineered specifically for administrators, tutors, and operators of small coaching centers and private schools. The emotional register is calm, orderly, and deeply trustworthy—eliminating the anxiety typically associated with fee collection, chasing payments, and bookkeeping. It mirrors the uncluttered simplicity of a focused daily to-do list rather than an intimidating enterprise accounting platform.

Visually, the system adopts a high-legibility, flat tactile style optimized for budget Android devices viewed outdoors under direct Indian sunlight. There are no gimmicks: no frosted glass blurs, no ambient multi-layer shadows, and no decorative gradients that wash out on low-nit IPS screens. Hierarchy is asserted through crisp surface boundaries, thick functional status rails, high contrast ratios (exceeding WCAG AAA standards for core data), and immediate visual feedback.

## Colors

The color palette pairs deep ink tones with purposeful utilitarian accents. Every hue has a functional financial meaning to support scanning in fast-paced environments:

- **Primary (`#3730A3` - Deep Indigo):** Anchors the interface. Applied to the top app bar, primary navigational anchors, active filter chips, and primary completion buttons.
- **Remind / Accent (`#D97706` - Marigold Amber):** Denotes action required, payment reminders, impending due dates, and WhatsApp trigger buttons.
- **Success (`#15803D` - Saturated Green):** Denotes settled balances, completed receipts, and positive reconciliation states.
- **Danger (`#DC2626` - Saturated Red):** Signals overdue accounts, defaulted installments, and irreversible destructive actions.
- **Canvas (`#FAFAF9` - Warm Stone Off-White):** Reduces eye strain compared to harsh blue-white backdrops, giving warmth and tactile paper quality.
- **Surface (`#FFFFFF` - Pure White):** Reserved for actionable cards, bottom sheets, and form groups, sharply separated from the canvas by a `#E5E7EB` border.
- **Typography Solids:** Text strictly uses `#111827` (slate black) for headers and currency figures, and `#1F2937` (slate dark gray) for metadata and body copy. No text falls below `#4B5563`.

## Typography

The design system uses Inter exclusively for its exceptional clarity on low-DPI mobile screens, tall x-height, and robust tabular numeric figures.

To ensure instant readability on moving commuter buses, low-brightness screens, or in bright outdoor sunlight:
- No body or interactive text is permitted below `16px`.
- Status pill badges are the sole exception, set at `12px` but rendered in all-caps bold (`font-weight: 700`) with high-contrast foreground-to-background pairings.
- Currency amounts (₹) must use font variants with tabular lining figures (`font-variant-numeric: tabular-nums`) to allow seamless vertical scanning across ledger lists.

## Layout & Spacing

The layout philosophy is mobile-first, single-column fluid. It accounts for one-handed thumb interaction on compact and standard Android hardware (360px to 412px viewports).

- **Grid & Margins:** Screen gutters are fixed at `16px` on mobile screens, expanding to `24px` on tablets. The content area is locked to a single column max-width of `640px` on larger screens to preserve immediate thumb reachability and avoid gaze dispersion.
- **Vertical Rhythm:** Rooted on an `8px` spatial grid (`8px`, `12px`, `16px`, `24px`, `32px`). Card-to-card spacing is strictly `12px` to maximize vertical density without causing accidental taps.
- **Touch-First Guardrails:** Interactive regions strictly maintain a minimum height and width of `48px` (exceeding the standard 44px baseline). Actions that require urgent attention—such as sending a reminder or marking a payment—stretch full-width across the card or stick to the screen footer.

## Elevation & Depth

This system avoids blurred, diffuse shadows and simulated 3D elevations. Instead, visual priority and hierarchy are established using **structural borders, solid color rails, and crisp surface contrast**:

1. **Surface Separation:** Pure White (`#FFFFFF`) containers sit directly on top of the Warm Stone (`#FAFAF9`) base canvas, outlined by a single hairline border (`1px solid #E5E7EB`).
2. **Status Accents:** Key ledger items use a solid `5px` vertical border along their left edge, delivering unambiguous status communication even before text is processed:
   - Green (`#15803D`): Paid
   - Amber (`#D97706`): Due Soon / Follow-up Needed
   - Red (`#DC2626`): Overdue
3. **Modals & Bottom Drawers:** Overlaid elements use a subtle `0px 4px 12px rgba(0, 0, 0, 0.08)` drop shadow combined with an active `40%` dim overlay (`#00000066`) to maintain structural focus on small viewports without dirtying the palette.

## Shapes

The shape system employs disciplined, soft rounding. It conveys order, precision, and tool-like utility:

- **Cards and Containers:** `8px` (`rounded-lg` equivalent for scale 1) corner radii create clean, neat groupings that stack tightly without visual bulk.
- **Buttons and Inputs:** Uniform `8px` corner radius preserves tactile button feedback and integrates smoothly with matching form field heights.
- **Pill Badges:** Fully rounded caps (`9999px`) distinguish status markers from actionable rectangular cards and buttons.
- **Left Edge Status Stripes:** The colored status indicator on card left edges conforms to the card's outer radius on its top-left and bottom-left points, leaving the right edge flat.

## Components

### Buttons
- **Primary Action (Mark Paid, Save):** Full-width or auto-flex, `48px` minimum height, solid `#3730A3` background, `#FFFFFF` text, `8px` radius. Active state: `#312E81`.
- **WhatsApp Remind Action:** Solid `#D97706` background or bordered `#FEF3C7` with `#92400E` text. Accompanied by a bold messaging icon. Full-width on mobile cards.
- **Secondary / Ghost:** `#FFFFFF` background, `1.5px solid #D1D5DB`, `#1F2937` text. Focus state provides high contrast indigo outlines.

### Status Cards (Fee Record)
- White background (`#FFFFFF`), `1px solid #E5E7EB`, `8px` radius.
- Left edge features a `5px` solid indicator bar (`#DC2626` for Overdue, `#D97706` for Due Soon, `#15803D` for Paid).
- Card interior is split into two zones: top row contains student name, class/batch, and the saturated pill badge; bottom row displays due date, outstanding amount in tabular figures, and primary CTA buttons.

### Status Badges (Pills)
- Compact, fully rounded (`9999px`), `12px` Inter Bold uppercase text with `0.04em` tracking.
- **Overdue:** `#DC2626` solid background with pure `#FFFFFF` text.
- **Due Soon:** `#D97706` solid background with pure `#FFFFFF` text.
- **Paid:** `#15803D` solid background with pure `#FFFFFF` text.

### Input Fields
- `48px` height, `#FFFFFF` background, `1.5px solid #D1D5DB`, `8px` radius.
- Placeholder text in `#6B7280`. Active focus rings shift to `2px solid #3730A3` with zero blur offset.
- Numeric amount inputs feature a static prefix (`₹`) locked at `18px Inter Semi-Bold` to prevent currency confusion.

### Student Ledger Lists
- Edge-to-edge listing with `12px` inter-card spacing.
- Includes quick-filter tabs at the top (All, Overdue, Due This Week, Collected) rendered as segmented chips: active chip has solid `#3730A3` background with white text; inactive chips have `#FFFFFF` background with `#4B5563` text and `#E5E7EB` border.