<script lang="ts">
    import logo from '$lib/assets/mine_manager.png';

    const { servers } = $props();
</script>

<!-- everything below here is displayed -->

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