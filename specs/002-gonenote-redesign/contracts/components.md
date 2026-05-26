# Component API Contracts: GoneNote Design System

Each component is a thin Svelte wrapper composing Tailwind classes. All accept a `class` prop for overrides.

---

## Button

**File**: `src/components/Button.svelte`

```typescript
interface Props {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  class?: string;
  onclick?: (e: MouseEvent) => void;
  children: Snippet;
}
```

**States**: idle, hover, focus (glow ring), active (scale 0.98), loading (spinner + disabled), disabled (50% opacity)

**Primary**: `bg-[--color-accent] text-black font-medium` (teal bg, dark text for contrast)
**Ghost**: `bg-transparent text-[--color-text-secondary] hover:text-[--color-text-primary]`

---

## Textarea

**File**: `src/components/Textarea.svelte`

```typescript
interface Props {
  name: string;
  value: string;
  maxlength: number;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  error?: string;
  class?: string;
  oninput?: (e: InputEvent) => void;
}
```

**States**: idle (subtle border), focus (teal glow ring + border highlight), error (amber border, error text below), with character count display

**Renders**: `<textarea>` + character count `<span>` + optional error `<p>`

---

## Card

**File**: `src/components/Card.svelte`

```typescript
interface Props {
  glass?: boolean;       // Enable glassmorphism (backdrop-blur + semi-transparent bg)
  hover?: boolean;       // Enable subtle hover lift (translateY -2px + shadow increase)
  padding?: 'md' | 'lg';
  class?: string;
  children: Snippet;
}
```

**Glass mode**: `bg-[rgba(28,28,36,0.6)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.06)] shadow-lg`
**Solid mode**: `bg-[--color-bg-surface] border border-[--color-border] shadow-md`
**Hover**: `transition-transform duration-250 hover:-translate-y-0.5 hover:shadow-lg`

---

## RadioGroup

**File**: `src/components/RadioGroup.svelte`

```typescript
interface Props {
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  class?: string;
  onchange?: (value: string) => void;
}
```

**Selection indicator**: Animated background fill on the selected option. `transition-colors duration-250`. Selected: teal tinted bg. Unselected: transparent.

---

## LinkDisplay

**File**: `src/components/LinkDisplay.svelte`

```typescript
interface Props {
  url: string;           // Relative URL, e.g., "/note/<uuid>"
  class?: string;
}
```

**Renders**: Glassmorphism Card containing a read-only `<input>` (full absolute URL computed client-side) + CopyButton.
**Entrance**: `animate-slide-up` (translateY + opacity) on mount.

---

## CopyButton

**File**: `src/components/CopyButton.svelte`

```typescript
interface Props {
  text: string;          // Text to copy to clipboard
  class?: string;
}
```

**States**: idle ("Copy"), copying (clipboard API call), copied ("Copied!" + teal pulse glow, 2s duration). Reverts to idle after 2s.
**Animation**: Text swap + `animate-pulse-glow` on the parent card.

---

## StatusAlert

**File**: `src/components/StatusAlert.svelte`

```typescript
interface Props {
  type: 'success' | 'info' | 'error';
  title: string;         // Bold heading
  message: string;       // Body text
  actionLabel?: string;  // Optional CTA button text
  actionHref?: string;   // Optional CTA link
  class?: string;
}
```

**Success**: Teal icon + `--color-success` text. Used for "Note destroyed" notice.
**Info**: Gray icon + `--color-text-secondary` text. Used for 404 "Note not found."
**Error**: Amber icon + `--color-error-text` text. Used for 500 "Something went wrong."

**All types use calm, muted styling — never red, never alarming.**

---

## Container

**File**: `src/components/Container.svelte`

```typescript
interface Props {
  maxWidth?: 'sm' | 'md' | 'lg';  // 480px | 640px | 720px
  centered?: boolean;              // Default true; mx-auto + text-center
  class?: string;
  children: Snippet;
}
```

---

## Icon Components

**Files**: `src/components/icons/*.svelte`

Inline SVG, sized via Tailwind `w-* h-*`, colored via `text-*`.

| Icon | Usage |
|------|-------|
| `CopyIcon` | CopyButton default state |
| `CheckIcon` | CopyButton copied state |
| `ShieldIcon` | Landing hero |
| `AlertIcon` | StatusAlert |
| `LockIcon` | Note destroyed notice |
| `ExternalLinkIcon` | Unused in v1, defined for completeness |
