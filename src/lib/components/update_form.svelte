<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    import LoadDial from '$lib/components/dial.svelte';

    let archiveInput = $state<HTMLInputElement | null>(null);
    let loading = $state(false);

    let success = $state("");
    let warning = $state("");
    let error = $state("");
    let archiveData = $state("");
    
    function clearResult() {
        error = warning = success = "";
    }

    let alertArea = $state<HTMLDivElement | null>(null);

    function scrollToAlert() {
        alertArea?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formatSize(f_size: number): string {
        if (f_size < 1024)
            return `${f_size} B`;
        if (f_size < 1024 * 1024)
            return `${(f_size / 1024).toFixed(1)} KB`;
        if (f_size < 1024 * 1024 * 1024)
            return `${(f_size / (1024 * 1024)).toFixed(1)} MB`;

        return `${(f_size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    const handleArchive = (e: Event) => {
        const ALLOWED_TYPES = [
            'application/zip',
            'application/x-zip',
            'application/x-zip-compressed',
            'application/octet-stream',
            'multipart/x-zip',
        ];

        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);
        const invalid = picked.filter(f => !ALLOWED_TYPES.includes(f.type));

        if (invalid.length > 0) {
            error = `Only ZIP files are allowed: ${invalid.map(f => f.name).join(", ")}`;
            input.value = "";
            return;
        }

        const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1 GB
        const tooBig = picked.filter(f => f.size > MAX_FILE_SIZE);
        if (tooBig.length > 0) {
            error = `Files exceed 1 GB limit: ${tooBig.map(f => f.name).join(", ")}`;
            if (input) {
                input.value = "";
            }
            return;
        }

        archiveData = `: ${picked[0].name} ${formatSize(picked[0].size)}`;

        error = "";
    };

    const { onClose, server_name } = $props();
</script>

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

<div class="update_overlay">
    <div class="d-flex justify-content-end">
        <button
            type="button"
            aria-label="Close"
            class="close-btn"
            onclick={() => { onClose() }}
        >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="1" y1="1" x2="17" y2="17"/>
                <line x1="17" y1="1" x2="1" y2="17"/>
            </svg>
        </button>
    </div>
    
    <div class="update_overlay content">
        {#if loading}
            <div style="display: flex; align-items: center; justify-content: center; margin: 5px">
                <LoadDial size="md" />
            </div>
        {/if}

        <form method="POST"
            action="/dashboard?/update_server"
            enctype="multipart/form-data"
            use:enhance={() => {
                loading = true;
                return async ({ result }) => {
                    if (result.type === 'success') {
                        if (result.data?.success) {
                            success = result.data.message as string;
                        } else {
                            error = result.data?.error as string;
                        }
                    } else {
                        error = "Error Occurred";
                    }

                    if (archiveInput) {
                        archiveInput.value = "";
                    }
                    loading = false;

                    await invalidateAll();
                    archiveData = "";
                    scrollToAlert();
                    setTimeout(clearResult, 10000);
                };
            }
        }>
            <div class="mb-4">
                <label
                    for="server_software"
                    class="form-label fw-semibold"
                >
                    Server Software Archive <span>{archiveData}</span>
                </label>

                <input
                    id="server_name"
                    name="server_name"
                    type="text"
                    value={server_name}
                    hidden
                    required
                />

                <input
                    id="server_software"
                    name="server_software"
                    type="file"
                    class="form-control"
                    accept="application/zip"
                    oninput={ handleArchive }
                    bind:this={ archiveInput }
                    required
                />
            </div>

            <!-- Submit -->
            <button
                type="submit"
                class="btn btn-primary btn-lg w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
            >
                {#if loading}
                    <span class="spinner-border spinner-border-sm"></span>
                    Loading...
                {:else}
                    <span>Update {server_name}</span>
                {/if}
            </button>
        </form>
    </div>
</div>