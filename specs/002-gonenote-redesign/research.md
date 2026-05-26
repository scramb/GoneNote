# Research: GoneNote Visual Redesign

## 1. CSS Framework

**Decision**: Tailwind CSS 4.x with custom theme extension.

**Rationale**:
- Tailwind 4 uses CSS-first configuration (`@theme` blocks) which integrates naturally with SvelteKit's CSS pipeline.
- Utility-first approach keeps the component library small — components are thin wrappers around Tailwind classes, not heavy abstractions.
- Dark-first via `@media (prefers-color-scheme: dark)` and CSS custom properties — no JS theme toggle needed for v1.
- Build-time purging eliminates unused CSS; the final bundle contains only classes actually used in components.
- `tailwind-merge` + `clsx` handle class conflict resolution when components accept `class` props.

**Alternatives considered**:
- Vanilla CSS custom properties only: Would require hand-writing every utility. More code, less consistency, harder to maintain a design system. Rejected — the spec requires a "reusable design system" which implies a systematic approach.
- Open Props: Lighter than Tailwind but lacks the ecosystem (no component patterns, no plugin for SvelteKit). Rejected.
- Styled Components / CSS-in-JS: Adds runtime cost, violates the "no JS animation libraries / CSS-only" constraint. Rejected.

## 2. Color Palette

**Decision**: Dark-first palette inspired by Linear and Raycast.

**Rationale**:
- Background: near-black slate (`#0a0a0f` to `#16161d`) — deep but not pure black, easier on eyes.
- Surface: elevated gray (`#1c1c24`, `#252530`, `#2e2e3a`) — layered depth for cards and inputs.
- Text: high-contrast without being pure white (`#e4e4ec` primary, `#9494a4` secondary, `#5c5c6e` muted).
- Accent: a single premium accent — cool teal/cyan (`#3dd6c8`) for primary actions, focus rings, and the GoneNote brand. Linear uses violet; Raycast uses orange; teal is distinct and signals security/trust.
- Status: green (`#4ade80`) for success, amber (`#fbbf24`) for warnings (unused in v1), neutral gray for info/404.
- Error states: explicitly NOT red — use muted amber or gray with calm messaging per FR-008.

**Light mode tokens** (defined but not exposed in v1): Invert the scale — `#fafafc` background, `#1a1a24` text. Accent and status colors remain the same.

## 3. Typography

**Decision**: System font stack with monospace for note content.

**Rationale**:
- UI font: `"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Inter is widely available on modern OSes; fallbacks are solid.
- Content font: `"JetBrains Mono", "SF Mono", "Fira Code", "Consolas", monospace`. Monospace reinforces the security/privacy brand (terminal aesthetic) and renders consistently as `<pre>`.
- No external font loading — system fonts only. Avoids tracking via Google Fonts and eliminates FOUT/CLS from web font loading.
- Type scale: 12/14/16/18/24/32/48px (minor third). Line heights: 1.5 for UI, 1.7 for content.

**Alternatives considered**:
- Google Fonts (Inter + JetBrains Mono): Adds a third-party request, privacy concern, and CLS risk. Rejected per constitution.
- Geometric sans (e.g., Poppins): Only available via CDN. Rejected.
- System monospace only for content: JetBrains Mono and SF Mono are common on dev machines but not universal. Fallback to Consolas covers Windows.

## 4. Glassmorphism Implementation

**Decision**: Pure CSS `backdrop-filter: blur()` with `@supports` fallback.

**Rationale**:
- Applies to Card and LinkDisplay components: `background: rgba(28, 28, 36, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.06)`.
- Fallback for browsers without `backdrop-filter` support: `background: rgba(28, 28, 36, 0.95)` — near-opaque dark surface. Tested via `@supports (backdrop-filter: blur(1px))`.
- Performance: `backdrop-filter` is GPU-composited in all modern browsers. No layout cost.
- No JS-based blur (avoids canvas/WebGL hacks). Rejected alternatives include SVG filters (complex, poor perf).

## 5. Micro-Interactions & Animation

**Decision**: CSS transitions and `@keyframes` only. No JS animation libraries.

**Rationale**:
- Transition durations: 150ms (micro: focus ring, hover), 250ms (standard: state changes, radio toggle), 400ms (entrance: fade-in, slide-up).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) for most transitions; `cubic-bezier(0, 0, 0.2, 1)` for entrances (deceleration-only).
- Keyframes defined in `tailwind.config.ts` as `@keyframes` → Tailwind `animate-*` utilities:
  - `fade-in`: opacity 0→1
  - `slide-up`: translateY(8px) + opacity 0→1
  - `pulse-glow`: box-shadow pulse for copy feedback
  - `scale-in`: scale(0.95)→scale(1) for dialog/modal appearance
- `prefers-reduced-motion: reduce` → all durations set to 0ms, animations to `none`.

**Alternatives considered**:
- Framer Motion / GSAP: Adds 30-80 KB JS. Violates "no JS animation libraries" constraint. Rejected.
- Svelte `transition:` directives: Built-in but still JS-driven during SSR hydration. CSS is more performant for simple transitions.

## 6. Component Architecture

**Decision**: Thin Svelte components composing Tailwind classes. Each component accepts a `class` prop merged via `tailwind-merge`.

**Pattern**:
```svelte
<script lang="ts">
  import { cn } from '$lib/utils';
  let { variant = 'primary', size = 'md', class: className = '', ...rest } = $props();
</script>
<button class={cn('base-styles', variants[variant], sizes[size], className)} {...rest}>
  {@render children?.()}
</button>
```

**Rationale**:
- Components are presentational only — no business logic. Route files handle data and pass it down as props.
- `tailwind-merge` resolves conflicting Tailwind classes when consumers override styles via `class` prop.
- No headless UI library (Radix, Headless UI) — adds dependency weight for components we already have (buttons, radio groups). Svelte's native form bindings are sufficient.

## 7. Icons

**Decision**: Inline SVG, no icon library.

**Rationale**:
- The app needs ~5 icons: copy/clipboard, checkmark, alert/info, external link, lock/shield.
- Inline SVG avoids an icon library dependency and allows direct styling via Tailwind `text-*` and `w-*`/`h-*` classes.
- Icons defined as Svelte components in `src/components/icons/` for reuse.

**Alternatives considered**:
- Lucide Svelte: Good library but adds ~200KB for 5 icons. Rejected.
- Heroicons: Same issue. Rejected.
- Unicode emoji: Unreliable cross-platform rendering. Rejected.
