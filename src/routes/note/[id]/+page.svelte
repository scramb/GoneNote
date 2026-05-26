<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Bauhaus Note — View note</title>
</svelte:head>

<main>
  <pre class="note-content">{data.content}</pre>
  <p class="notice">This note has been destroyed. It cannot be viewed again.</p>
  <a href="/">Create your own note</a>
</main>

<style>
  main {
    max-width: 720px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }
  .note-content {
    white-space: pre-wrap;
    word-wrap: break-word;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    font: inherit;
    line-height: 1.5;
  }
  .notice {
    color: #666;
    font-size: 0.9rem;
    margin: 1rem 0 0.5rem;
  }
  a {
    color: #222;
  }
</style>
