# Design Tokens: GoneNote

## Color Palette

### Dark Theme (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-root` | `#0a0a0f` | Page background |
| `--color-bg-surface` | `#16161d` | Card, input backgrounds |
| `--color-bg-elevated` | `#1c1c24` | Hover states, elevated surfaces |
| `--color-bg-glass` | `rgba(28, 28, 36, 0.6)` | Glassmorphism card background |
| `--color-border` | `rgba(255, 255, 255, 0.06)` | Subtle borders |
| `--color-border-focus` | `rgba(61, 214, 200, 0.4)` | Focus ring |
| `--color-text-primary` | `#e4e4ec` | Body text, headings |
| `--color-text-secondary` | `#9494a4` | Labels, hints, secondary info |
| `--color-text-muted` | `#5c5c6e` | Placeholder, disabled text |
| `--color-accent` | `#3dd6c8` | Primary button, focus ring, brand |
| `--color-accent-hover` | `#5cdfd4` | Button hover, link hover |
| `--color-success` | `#4ade80` | Copy success, destroyed notice |
| `--color-error-bg` | `rgba(251, 191, 36, 0.08)` | Error state background (amber, not red) |
| `--color-error-text` | `#fbbf24` | Error text |

### Light Theme (Defined, Not Exposed in v1)

| Token | Value |
|-------|-------|
| `--color-bg-root` | `#fafafc` |
| `--color-bg-surface` | `#f0f0f5` |
| `--color-bg-elevated` | `#e4e4ec` |
| `--color-bg-glass` | `rgba(255, 255, 255, 0.7)` |
| `--color-text-primary` | `#1a1a24` |
| `--color-text-secondary` | `#5c5c6e` |
| `--color-text-muted` | `#9494a4` |

## Typography Scale

| Token | Size / Line | Usage |
|-------|-------------|-------|
| `--text-xs` | 12px / 1.5 | Character count, meta |
| `--text-sm` | 14px / 1.5 | Labels, hints, secondary text |
| `--text-base` | 16px / 1.6 | Body, inputs, buttons |
| `--text-lg` | 18px / 1.5 | Subtitles, TTL labels |
| `--text-xl` | 24px / 1.4 | Card headings |
| `--text-2xl` | 32px / 1.3 | Page headings |
| `--text-3xl` | 48px / 1.2 | Hero title ("GoneNote") |

**Font families**:
- `--font-ui`: `"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- `--font-mono`: `"JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace`

**Font weights**: 400 (regular), 500 (medium), 600 (semibold)

## Spacing Scale

Based on 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Inline gaps, small padding |
| `--space-3` | 12px | Element padding |
| `--space-4` | 16px | Standard padding, card padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Container padding, large gaps |
| `--space-8` | 32px | Section spacing |
| `--space-12` | 48px | Hero spacing |
| `--space-16` | 64px | Page-level spacing |

## Shadows & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Buttons, inputs |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Cards |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Elevated cards, glass surfaces |
| `--shadow-glow` | `0 0 0 2px rgba(61,214,200,0.3)` | Focus rings |

## Blur & Glass

| Token | Value | Usage |
|-------|-------|-------|
| `--blur-glass` | `blur(12px)` | Card and LinkDisplay |
| `--blur-glass-sm` | `blur(8px)` | Input overlays |

## Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-micro` | 150ms | Focus, hover transitions |
| `--duration-standard` | 250ms | State changes, toggle |
| `--duration-entrance` | 400ms | Page load, card appearance |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--ease-entrance` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance animations |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Copy feedback pulse |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inline elements |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Large cards, glass surfaces |
| `--radius-full` | 9999px | Pills, radio indicators |
