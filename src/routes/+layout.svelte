<script lang="ts">
  import '../app.css';
  import '../design/tokens.css';
  import '../design/base.css';
  import type { LayoutData } from './$types';

  let { data, children } = $props<{ data: LayoutData; children: import('svelte').Snippet }>();

  const c = $derived(data.branding.colors);
  const cssVars = $derived(`--color-root: ${c.root}; --color-surface: ${c.surface}; --color-elevated: ${c.elevated}; --color-border: ${c.border}; --color-primary: ${c.primary}; --color-secondary: ${c.secondary}; --color-muted: ${c.muted}; --color-accent: ${c.accent}; --color-accent-hover: ${c.accentHover}; --color-success: ${c.success}; --color-error: ${c.error}`);
</script>

<svelte:head>
  <meta name="color-scheme" content="dark" />
  <title>{data.branding.appName}</title>
</svelte:head>

<div class="min-h-screen bg-root text-primary font-[family-name:var(--font-ui)]" style={cssVars}>
  {@render children()}
</div>
