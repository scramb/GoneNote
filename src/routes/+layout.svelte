<script lang="ts">
  import '../app.css';
  import '../design/tokens.css';
  import '../design/base.css';
  let { children } = $props<{ children: import('svelte').Snippet }>();
</script>

<svelte:head>
  <meta name="color-scheme" content="dark" />
</svelte:head>

<div class="min-h-screen bg-root text-primary font-[family-name:var(--font-ui)]">
  {@render children()}
</div>
