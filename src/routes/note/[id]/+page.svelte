<script lang="ts">
  import type { PageData } from './$types';
  import Container from '$components/Container.svelte';
  import Card from '$components/Card.svelte';
  import StatusAlert from '$components/StatusAlert.svelte';
  import Button from '$components/Button.svelte';

  let { data } = $props<{ data: PageData }>();

  const hasStyle = $derived(data.style && (data.style.backgroundColor || data.style.primaryColor || data.style.secondaryColor));
  const bgStyle = $derived(hasStyle && data.style?.backgroundColor ? `background-color: ${data.style.backgroundColor}` : '');
  const primaryStyle = $derived(hasStyle && data.style?.primaryColor ? `color: ${data.style.primaryColor}` : '');
  const secondaryStyle = $derived(hasStyle && data.style?.secondaryColor ? `color: ${data.style.secondaryColor}` : '');
</script>

<svelte:head>
  <title>GoneNote — View note</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center px-4 py-16" style={bgStyle || undefined}>
  <Container maxWidth="md">
    <Card padding="lg">
      <pre data-testid="note-content" class="text-[--text-base] font-[family-name:var(--font-mono)] whitespace-pre-wrap break-words m-0 leading-relaxed" style={primaryStyle || undefined}>{data.content}</pre>
    </Card>

    <div class="mt-8 animate-[fadeIn_400ms_ease-[--ease-entrance]_both]" style={hasStyle ? `background-color: inherit` : undefined}>
      <StatusAlert
        type="success"
        title="Note destroyed"
        message="This note has been permanently deleted and cannot be viewed again."
        actionLabel="Create your own note"
        actionHref="/"
        primaryColor={data.style?.primaryColor ?? null}
        secondaryColor={data.style?.secondaryColor ?? null}
      />
    </div>
  </Container>
</main>
