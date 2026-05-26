<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error — Bauhaus Note</title>
</svelte:head>

<main>
  <h1>{$page.status === 404 ? 'Note not found.' : 'Something went wrong.'}</h1>
  {#if $page.status === 404}
    <p>The note you're looking for doesn't exist or has already been read.</p>
  {:else}
    <p>Unable to process your request. Please try again later.</p>
  {/if}
  <a href="/">Create a note</a>
</main>

<style>
  main {
    max-width: 640px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
    text-align: center;
  }
  a {
    color: #222;
  }
</style>
