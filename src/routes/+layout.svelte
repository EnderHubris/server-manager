<script lang="ts">
    import 'bootstrap/dist/css/bootstrap.min.css';
    
    // only apply the boostrap js in the browser
    import { browser } from '$app/environment';
    if (browser) {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }

	import favicon from '$lib/assets/mine_manager-512.png';
    import apple_touch_icon from '$lib/assets/mine_manager-192.png';

	let { children, data } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link rel="stylesheet" href="/css/index.css">
    <link rel="apple-touch-icon" href={apple_touch_icon} />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Minecraft Server Manager - Svelte" />

    <title>Server Manager</title>
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
  <div class="container">
    <a class="navbar-brand fw-bold fs-4" href="/">
      Server Management
    </a>

    <button
      class="navbar-toggler border-0"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#mainNavbar"
      aria-controls="mainNavbar"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- feedback if local db is unreachable : avoid ec 500 -->
    {#if data.error }
        <div class="alert alert-danger">{data.error}</div>
    {/if}

    <div class="collapse navbar-collapse" id="mainNavbar">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-3">
        <li class="nav-item ms-lg-3 mt-3 mt-lg-0">
            {#if data.user}
                <button
                    class="btn btn-dark dropdown-toggle px-4 rounded-pill"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {data.user.name}
                </button>

                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                    <li>
                        <form method="POST" action="/auth/logout">
                            <button type="submit" class="dropdown-item text-danger">
                                Logout
                            </button>
                        </form>
                    </li>
                </ul>
            {:else}
                <a href="/auth/login" class="btn btn-primary px-4 rounded-pill">
                    Login
                </a>
            {/if}
        </li>
      </ul>
    </div>
  </div>
</nav>

{@render children()}