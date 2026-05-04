<script lang="ts">
    import logo from '$lib/assets/mine_manager.png';

    let showPanel = $state<boolean>(false);

    let navbar: HTMLElement;
    let navbarTab: HTMLElement;
    let content_area: HTMLElement;

    function handleNavbar(v: boolean) {
        if (!navbar) return;
        if (!navbarTab) return;

        showPanel = v;
        if (showPanel) {
            navbar.style.width = "250px";

            content_area.classList.add('collapsed');
            navbarTab.classList.add('collapsed');
        } else {
            navbar.style.width = "0";

            content_area.classList.remove('collapsed');
            navbarTab.classList.remove('collapsed');
        }
    }

    const { servers } = $props();
</script>

<main class="min-vh-100">
    <div>
    
        <!-- panel nav bar -->
        <div bind:this={navbar} class="sidenav">
            <div
                class="sidenav-tab"
                bind:this={navbarTab}
            >
                <button
                    class="btn btn-primary"
                    onclick={() => handleNavbar(true)}
                    onkeydown={(e) => { if (e.key === 'Enter') handleNavbar(true); }}
                >
                    Show Nav
                </button>
            </div>

            <div class="sidenav-inner">
                <div class="sidenav-header">
                    <span class="sidenav-title">Menu</span>
                    <button
                        type="button"
                        aria-label="Close"
                        class="close-btn"
                        onclick={() => handleNavbar(false)}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <line x1="1" y1="1" x2="17" y2="17"/>
                            <line x1="17" y1="1" x2="1" y2="17"/>
                        </svg>
                    </button>
                </div>
    
                <hr class="sidenav-divider" />
    
                <ul class="navbar-nav align-items-lg-center gap-lg-3">
                    <li class="nav-item">
                        <a class="nav-link" href="/dashboard">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-home">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
                            </svg>
                            Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/dashboard/users">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-user">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                                <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
                            </svg>
                            Users
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/dashboard/config">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-settings">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" />
                            </svg>
                            Settings
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- panel header -->
        <div class="d-flex justify-content-center align-items-center p-4">
            <h1 class="display-5 fw-bold text-center">
                Welcome to the Dashboard
            </h1>
        </div>
        
        <!-- main content -->
        <div class="server-listing" bind:this={content_area}>

            <div class="listing-panel-input">
                <ul class="navbar-nav">
                    <li class="nav-item ms-lg-3 mt-3 mt-lg-0">
                        <a
                            class="btn-green px-4 rounded-pill"
                            href="/dashboard/create"
                        >
                            Create
                        </a>
                    </li>
                </ul>
            </div>

            <div class="row row-cols-1 row-cols-md-3 g-4">
            
                {#each servers as server}
                    <div class="col">
                        <div class="server-card card h-100">
                            <img src={ server.icon.length === 0 ? logo : server.icon } class="card-img-top" alt="Server Icon" />
                            <div class="card-body">
                                <h5 class="card-title">{server.name}</h5>
                                <p class="server-card-text card-text">
                                    {server.description}
                                </p>
                                <span>
                                    {server.createdAt}
                                </span>
                            </div>

                            <div class="card-footer bg-transparent">
                                <a href="/" class="btn btn-outline-primary btn-sm">Update</a>
                                <a href="/" class="btn btn-outline-danger btn-sm">Delete</a>
                            </div>
                        </div>
                    </div>
                {/each}

            </div>

        </div>
    </div>
</main>