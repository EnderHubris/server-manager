<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import logo from '$lib/assets/mine_manager.png';

    import LoadDial from '$lib/components/dial.svelte';
    let toggleTarget = $state<string|undefined>(undefined);

    import ServerForm from '$lib/components/server_form.svelte';
    let showCreateForm = $state(false);

    import ImportForm from '$lib/components/import_form.svelte';
    let showImportForm = $state(false);

    import { slide } from 'svelte/transition';
    import UpdateForm from '$lib/components/update_form.svelte';
    let showUpdateForm = $state(false);
    let selectedServer = $state("");

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
            if (input) {
                input.value = "";
            }
            return;
        }

        error = "";
    }

    const handleArchive = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);

        const invalid = picked.filter(f => 
            !f.name.endsWith('.tar.gz') && !f.name.endsWith('.zip')
        );

        if (invalid.length > 0) {
            error = `Only TAR.GZ and ZIP archives are allowed: ${invalid.map(f => f.name).join(", ")}`;
            input.value = "";
            return;
        }

        error = "";
    };

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
            toggleTarget = `Removing ${name}`;

            const req = await fetch('/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-server', server_name: name })
            });

            const response = await req.json();
            toggleTarget = undefined;
            
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

    let iconInput = $state<HTMLInputElement | null>(null);
    async function handleIconChange(e: Event, server_name: string) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('action', 'change-icon');
        formData.append('server_name', server_name);
        formData.append('icon', file);

        const req = await fetch('/dashboard', {
            method: 'POST',
            body: formData
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

    /**
     * Toggle a Server's Online status
    */
    async function handleServer(name: string, status: boolean) {
        toggleTarget = `${ status ? "Enabling" : "Disabling" } ${name}`;

        const req = await fetch('/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle-server', server_name: name, o_status: status })
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

        toggleTarget = undefined;
        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    let editingDesc = $state("");
    let editDescValue = $state("");

    async function saveDesc(server_name: string) {
        const req = await fetch('/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-desc', server_name, description: editDescValue })
        });

        const response = await req.json();
        if (response.success) {
            success = response.message;
        } else {
            error = response.error;
        }

        editingDesc = "";
        await invalidateAll();
        setTimeout(clearResult, 5000);
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

    {#if toggleTarget}
        <div class="loading-state">
            <LoadDial />
            <span class="loading-label">{toggleTarget}</span>
        </div>
    {/if}
</div>

{#if showUpdateForm}
    <div transition:slide={{ duration: 350 }} >
        <UpdateForm
            onClose={() => { showUpdateForm = false; }}
            server_name={selectedServer}
        />
    </div>
{/if}

<div class="collapse-wrapper">
    <button class="collapse-toggle green" onclick={() => {
        showCreateForm = !showCreateForm;
        if (showUpdateForm) showUpdateForm = false;
        if (showImportForm) showImportForm = false;
    }}>
        <span>Create Server</span>
        <svg
            width="16" height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            style="transform: rotate({showCreateForm ? 180 : 0}deg); transition: transform 0.3s ease;"
        >
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>

    {#if showCreateForm}
        <div
            transition:slide={{ duration: 350 }}
            class="collapse-wrapper"
        >
            <ServerForm
                handleIconInput={handleIconInput}
                onSuccess={(msg) => { success = msg; setTimeout(clearResult, 5000); invalidateAll(); }}
                onError={(msg) => { error = msg; setTimeout(clearResult, 5000); }}
            />
        </div>
    {/if}

    <button class="collapse-toggle blue" onclick={() => {
        showImportForm = !showImportForm;
        if (showUpdateForm) showUpdateForm = false;
        if (showCreateForm) showCreateForm = false;
    }}>
        <span>Import Server</span>
        <svg
            width="16" height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            style="transform: rotate({showImportForm ? 180 : 0}deg); transition: transform 0.3s ease;"
        >
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>

    {#if showImportForm}
        <div
            transition:slide={{ duration: 350 }}
            class="collapse-wrapper"
        >
            <ImportForm
                handleArchive={ handleArchive }
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
                {#if server.online}
                    <button
                        onclick={ () => { handleServer(server.name, false) } }
                        class="btn btn-danger btn-sm"
                        style="margin: 15px"
                    >Shutdown</button>
                {:else}
                    <button
                        onclick={ () => { handleServer(server.name, true) } }
                        class="btn btn-success btn-sm"
                        style="margin: 15px"
                    >Start Up</button>
                {/if}

                <div class="card-img-wrapper">
                    <img
                        src={ server.icon.length === 0 ? logo : server.icon }
                        class="card-img-top"
                        alt="Server Icon"
                        style="height: 300px"
                    />
                    
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        class="d-none"
                        bind:this={iconInput}
                        onchange={
                            (e) => handleIconChange(e, server.name)
                        }
                    />

                    <button class="icon-edit-btn" onclick={() => { iconInput?.click() }} aria-label="Change icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>

                <div class="card-body">
                    <h5 class="card-title">{server.name} : {server.port}</h5>

                    {#if editingDesc === server.name}
                        <textarea
                            class="form-control mb-2"
                            rows="3"
                            bind:value={editDescValue}
                        ></textarea>
                        <div class="d-flex gap-2 mb-2">
                            <button class="btn btn-primary btn-sm" onclick={() => saveDesc(server.name)}>Save</button>
                            <button class="btn btn-secondary btn-sm" onclick={() => editingDesc = ""}>Cancel</button>
                        </div>
                    {:else}
                        <div class="server-info">
                            <button
                                aria-label="Change Description"
                                style="margin-right: 10px;"
                                onclick={() => {
                                    editingDesc = server.name;
                                    editDescValue = server.description;
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <p class="server-card-text card-text">
                                {server.description}
                            </p>
                        </div>
                    {/if}

                    <span>{formatDate(server.createdAt)}</span>
                </div>

                <div class="card-footer bg-transparent">
                    <button
                        onclick={ () => {
                            selectedServer = server.name;
                            showCreateForm = showImportForm = false;
                            showUpdateForm = true;
                        } }
                        class="btn btn-outline-primary btn-sm"
                    >Update</button>
                    <button
                        onclick={ () => { removeServer(server.name) } }
                        class="btn btn-outline-danger btn-sm"
                    >Delete</button>
                </div>
            </div>
        </div>
    {/each}

</div>