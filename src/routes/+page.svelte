<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
  let content = $state('');
  let ttl = $state('604800');
  let copied = $state(false);

  const maxLength = 102400;
  const ttls = [
    { value: '3600', label: '1 hour' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '7 days' },
    { value: '2592000', label: '30 days' },
  ];

  function copyLink() {
    if (!form?.noteUrl) return;
    const url = new URL(form.noteUrl, window.location.origin).href;
    navigator.clipboard.writeText(url).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 2000);
    });
  }
</script>

<svelte:head>
  <title>Bauhaus Note — Create a self-destructing note</title>
</svelte:head>

<main>
  <h1>Bauhaus Note</h1>
  <p>Create a note that self-destructs after it's read.</p>

  {#if form?.success && form.noteUrl}
    <section class="result">
      <h2>Note created</h2>
      <p>Share this link — it will work exactly once.</p>
      <div class="link-box">
        <input type="text" value={new URL(form.noteUrl, typeof window !== 'undefined' ? window.location.origin : '').href} readonly />
        <button onclick={copyLink}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </section>
  {:else}
    <form method="POST" use:enhance>
      <label for="content">Note content</label>
      <textarea
        id="content"
        name="content"
        bind:value={content}
        maxlength={maxLength}
        rows={8}
        placeholder="Type your note here..."
        required
      ></textarea>
      <p class="char-count">{content.length} / {maxLength}</p>

      <fieldset>
        <legend>Expires after</legend>
        {#each ttls as opt}
          <label class="ttl-option">
            <input type="radio" name="ttl" value={opt.value} bind:group={ttl} />
            {opt.label}
          </label>
        {/each}
      </fieldset>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <button type="submit">Create Note</button>
    </form>
  {/if}
</main>

<style>
  main {
    max-width: 640px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }
  h1 {
    margin: 0 0 0.5rem;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem;
    font: inherit;
    resize: vertical;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .char-count {
    text-align: right;
    color: #666;
    font-size: 0.85rem;
    margin: 0.25rem 0 1rem;
  }
  fieldset {
    border: none;
    padding: 0;
    margin: 0 0 1rem;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .ttl-option {
    display: inline-block;
    margin-right: 1rem;
    cursor: pointer;
  }
  .ttl-option input {
    margin-right: 0.25rem;
  }
  .error {
    color: #c00;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  button {
    padding: 0.75rem 1.5rem;
    font: inherit;
    cursor: pointer;
    background: #222;
    color: #fff;
    border: none;
    border-radius: 4px;
  }
  button:hover {
    background: #444;
  }
  .result {
    background: #f0f8f0;
    border: 1px solid #8c8;
    border-radius: 4px;
    padding: 1rem;
  }
  .link-box {
    display: flex;
    gap: 0.5rem;
  }
  .link-box input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font: inherit;
  }
</style>
