<script lang="ts">
    import { enhance } from '$app/forms';

    let server_name = $state("");
    let server_description = $state("");
    let loading = $state<boolean>(false);

    let iconInput = $state<HTMLInputElement | null>(null);

    let { handleIconInput, onSuccess, onError } = $props<{
        handleIconInput: (e: Event) => void;
        onSuccess: (msg: string) => void;
        onError: (msg: string) => void;
    }>();

    function resetForm() {
        server_name = "";
        server_description = "";
        if (iconInput) iconInput.value = "";
        loading = false;
    }
</script>

<!-- everything below here is displayed -->

<div style="margin-top: 25px; padding-left: 25px; padding-right: 25px; padding-bottom: 25px;">
    <div class="conf-about">
        <p>Create a new Instance reference here!</p>
    </div>

    <form method="POST"
        action="/dashboard/create?/create_server"
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
            <label for="server_name" class="form-label fw-semibold">Server Name</label>
            <input
                id="server_name"
                name="server_name"
                type="text"
                class="form-control form-control-lg rounded-3"
                placeholder="Name of Server"
                bind:value={server_name}
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

        <div class="mb-4">
            <label for="server_icon" class="form-label fw-semibold">Server Icon</label>
            <input
                id="server_icon"
                name="server_icon"
                type="file"
                class="form-control"
                accept="image/png, image/jpeg, image/gif"
                oninput={ handleIconInput }
                bind:this={iconInput}
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