<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import logo from '$lib/assets/mine_manager.png';

    import ServerForm from '$lib/components/server_form.svelte';
    let open = $state(false);

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const handleIconInput = (e: Event) => {
        const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);

        const invalid = picked.filter(f => !ALLOWED_TYPES.includes(f.type));
        if (invalid.length > 0) {
            error = `Only PNG, JPEG, and GIF files are allowed: ${invalid.map(f => f.name).join(", ")}`;
            input.value = "";
            return;
        }

        const tooBig = picked.filter(f => f.size > MAX_FILE_SIZE);
        if (tooBig.length > 0) {
            error = `Files exceed 12 MB limit: ${tooBig.map(f => f.name).join(", ")}`;
            if (iconInput) {
                iconInput.value = "";
            }
            return;
        }

        error = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");
    let alertArea = $state<HTMLDivElement | null>(null);
        
    function clearResult() {
        error = warning = success = "";
    }

    function scrollToAlert() {
        alertArea?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    $effect(() => {
        if (error || success || warning) {
            scrollToAlert();
        }
    });

    async function removeServer(name: string) {
        if (window.confirm(`Are you sure you want to DELETE this server "${name}"?`)) {
            const req = await fetch('/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-server', server_name: name })
            });

            const response = await req.json();
            if (response) {
                console.log(response);

                if (response.success) {
                    if (!response.warning)
                        success = response.message;
                    else
                        warning = response.warning;
                } else {
                    error = response.error;
                }
            } else {
               error = "Error Occurred";
            }

            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    const { data } = $props();
</script>

<!-- everything below here is displayed -->

<!-- Feedback -->
<div bind:this={alertArea}>
    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    {#if success}
        <div class="alert alert-success">{success}</div>
    {/if}
    {#if warning}
        <div class="alert alert-warning">{warning}</div>
    {/if}
</div>

<div class="collapse-wrapper">
    <button class="collapse-toggle green" onclick={() => open = !open}>
        <span>Create Server</span>
        <svg
            width="16" height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            style="transform: rotate({open ? 180 : 0}deg); transition: transform 0.3s ease;"
        >
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>

    {#if open}
        <div class="collapse-wrapper">
            <ServerForm
                handleIconInput={handleIconInput}
                onSuccess={(msg) => { success = msg; setTimeout(clearResult, 5000); invalidateAll(); }}
                onError={(msg) => { error = msg; setTimeout(clearResult, 5000); }}
            />
        </div>
    {/if}
</div>

<div class="row row-cols-1 row-cols-md-3 g-4">

    {#each data.servers as server}
        <div class="col">
            <div class="server-card card h-100">
                <img src={ server.icon.length === 0 ? logo : server.icon } class="card-img-top" alt="Server Icon" />
                <div class="card-body">
                    <h5 class="card-title">{server.name}</h5>
                    <p class="server-card-text card-text">
                        {server.description}
                    </p>
                    <span>
                        {formatDate(server.createdAt)}
                    </span>
                </div>

                <div class="card-footer bg-transparent">
                    <button class="btn btn-outline-primary btn-sm">Update</button>
                    <button onclick={ () => { removeServer(server.name) } } class="btn btn-outline-danger btn-sm">Delete</button>
                </div>
            </div>
        </div>
    {/each}

</div>