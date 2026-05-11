<script lang="ts">
    import { enhance } from '$app/forms';
    import LoadDial from '$lib/components/dial.svelte';

    let showInfo = $state(false);

    let server_port = $state("19132");
    let server_description = $state("");
    let loading = $state<boolean>(false);

    let archiveInput = $state<HTMLInputElement | null>(null);

    let { handleArchive, onSuccess, onError } = $props<{
        handleArchive: (e: Event) => void;
        onSuccess: (msg: string) => void;
        onError: (msg: string) => void;
    }>();

    function resetForm() {
        server_description = "";
        if (archiveInput) archiveInput.value = "";
        loading = false;
    }
</script>

<!-- everything below here is displayed -->

<div style="margin-top: 25px; padding-left: 25px; padding-right: 25px; padding-bottom: 25px;">
    {#if loading}
        <div class="loading-state">
            <LoadDial />
            <span class="loading-label">Importing World</span>
        </div>
    {/if}

    <div class="conf-about">
        <p>Import an existing world here!</p>
    </div>

    <form method="POST"
        action="/dashboard/create?/import_server"
        enctype="multipart/form-data"
        use:enhance={() => {
            loading = true;
            return async ({ result }) => {
                if (result.type === 'success') {
                    if (result.data?.success) {
                        onSuccess(result.data.message as string);
                        resetForm();
                    } else {
                        onError(result.data?.error as string);
                    }
                } else {
                    onError("Something went wrong.");
                }
                loading = false;
            };
        }
    }>
        <div class="mb-4">
            <div style="display: flex; gap: 10px; justify-items: center;">
                <label for="server_icon" class="form-label fw-semibold">Server Archive</label>
    
                <button
                    type="button"
                    class="info-btn"
                    title="What do I submit?"
                    aria-label="More information"
                    onclick={ () => { showInfo = !showInfo; } }
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </button>
            </div>

            {#if showInfo}
                <p>
                    Achive name must match LEVEL_NAME within the server.properties file (case-sensitive).
                    i.e., <b><i>myamazingworld.tar.gz</i></b> or <b><i>myamazingworld.zip</i></b>
                </p>
                <p>
                    Archive when decompressed should not contain only a root folder where
                    server files are contained, archives are expected to contain the files
                    within the root of the archive shown below.
                </p>
                <pre class="info-tree">
                    .
                    ├── server.properties
                    ├── permissions.json
                    ├── allowlist.json
                    ├── other_files_or_folders
                    └── worlds/
                </pre>
            {/if}

            <input
                id="server_import"
                name="server_import"
                type="file"
                class="form-control"
                accept=".tar.gz, .zip"
                oninput={ handleArchive }
                bind:this={archiveInput}
            />

            <label for="server_port"
                class="form-label fw-semibold"
                style="margin-top: 5px;"
            >Server Port</label>
            <input
                id="server_port"
                name="server_port"
                type="number"
                min="1"
                max="65535"
                step="1"
                class="form-control form-control-lg rounded-3"
                style="margin-bottom: 40px;"
                placeholder="Server Port"
                bind:value={server_port}
                required
            />
        </div>

        <div class="mb-4">
            <label for="server_description" class="form-label fw-semibold">Server Description</label>
            <input
                id="server_description"
                name="server_description"
                type="text"
                class="form-control form-control-lg rounded-3"
                placeholder="Description"
                bind:value={server_description}
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
                <span>Submit</span>
            {/if}
        </button>
    </form>
</div>