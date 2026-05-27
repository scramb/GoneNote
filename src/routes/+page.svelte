<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import type { LayoutData } from './$types';
  import Container from '$components/Container.svelte';
  import Textarea from '$components/Textarea.svelte';
  import RadioGroup from '$components/RadioGroup.svelte';
  import Button from '$components/Button.svelte';
  import BrandLogo from '$components/BrandLogo.svelte';
  import ShieldIcon from '$components/icons/ShieldIcon.svelte';
  import LinkDisplay from '$components/LinkDisplay.svelte';

  let { data, form } = $props<{ data: LayoutData; form: ActionData }>();
  let content = $state('');
  let ttl = $state('604800');

  const appName = $derived(data.branding.appName);
  const isBranded = $derived(appName !== 'GoneNote');

  const maxLength = 102400;
  const ttls = [
    { value: '3600', label: '1 hour' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '7 days' },
    { value: '2592000', label: '30 days' },
  ];
</script>

<svelte:head>
  <title>{appName} — Self-destructing notes</title>
</svelte:head>

<main class="min-h-screen flex flex-col items-center justify-center px-4 py-16">
  <Container maxWidth="md">
    <!-- Hero -->
    <div class="mb-10 animate-[fadeIn_400ms_ease-[--ease-entrance]_both]">
      {#if isBranded}
        <div class="flex items-center justify-center mb-4">
          <BrandLogo appName={data.branding.appName} logoUrl={data.branding.logoUrl} class="text-3xl" />
        </div>
      {:else}
        <div class="flex items-center justify-center gap-3 mb-4">
          <ShieldIcon class="w-8 h-8 text-accent" />
          <h1 class="text-3xl font-semibold tracking-tight text-primary m-0">
            GoneNote
          </h1>
        </div>
      {/if}
      <p class="text-lg text-secondary m-0 max-w-md mx-auto">
        Create a note that disappears forever after it's read.
      </p>
    </div>

    {#if form?.success && form.noteUrl}
      <LinkDisplay url={form.noteUrl} />
    {:else}
      <!-- Form -->
      <form method="POST" use:enhance class="w-full animate-[fadeIn_400ms_ease-[--ease-entrance]_400ms_both]">
        <Textarea
          name="content"
          bind:value={content}
          maxlength={maxLength}
          placeholder="Type your note here..."
          required={true}
          error={form?.error}
        />

        <div class="mt-5">
          <p class="text-xs text-muted uppercase tracking-wider mb-2">Expires after</p>
          <RadioGroup
            name="ttl"
            bind:value={ttl}
            options={ttls}
          />
        </div>

        <div class="mt-6">
          <Button type="submit" variant="primary" size="md" class="w-full">
            Create Note
          </Button>
        </div>
      </form>
    {/if}
  </Container>
</main>
