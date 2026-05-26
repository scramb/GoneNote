<script lang="ts">
  import { page } from '$app/stores';
  import Container from '$components/Container.svelte';
  import StatusAlert from '$components/StatusAlert.svelte';
</script>

<svelte:head>
  <title>Error — GoneNote</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center px-4">
  <Container maxWidth="sm">
    {#if $page.status === 404}
      <StatusAlert
        type="info"
        title="Note not found"
        message="The note you're looking for doesn't exist or has already been read."
        actionLabel="Create a note"
        actionHref="/"
      />
    {:else}
      <StatusAlert
        type="error"
        title="Something went wrong"
        message="Unable to process your request. Please try again later."
        actionLabel="Go home"
        actionHref="/"
      />
    {/if}
  </Container>
</main>
