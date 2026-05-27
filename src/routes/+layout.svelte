<script lang="ts">
  import '../app.css';
  import '../design/tokens.css';
  import '../design/base.css';
  import BrandLogo from '$components/BrandLogo.svelte';
  import type { LayoutData } from './$types';

  let { data, children } = $props<{ data: LayoutData; children: import('svelte').Snippet }>();

  const c = $derived(data.branding.colors);
</script>

<svelte:head>
  <meta name="color-scheme" content="dark" />
  <title>{data.branding.appName}</title>
  {@html `<style>:root {
    --color-root: ${c.root};
    --color-surface: ${c.surface};
    --color-elevated: ${c.elevated};
    --color-border: ${c.border};
    --color-primary: ${c.primary};
    --color-secondary: ${c.secondary};
    --color-muted: ${c.muted};
    --color-accent: ${c.accent};
    --color-accent-hover: ${c.accentHover};
    --color-success: ${c.success};
    --color-error: ${c.error};
  }</style>`}
</svelte:head>

<div class="min-h-screen bg-root text-primary font-[family-name:var(--font-ui)]">
  <header class="flex items-center justify-center gap-3 pt-8 pb-4">
    <BrandLogo appName={data.branding.appName} logoUrl={data.branding.logoUrl} />
  </header>
  {@render children()}
</div>
