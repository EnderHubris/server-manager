<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");
    let alertArea = $state<HTMLDivElement | null>(null);

    function scrollToAlert() {
        alertArea?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    $effect(() => {
        if (error || success || warning) {
            scrollToAlert();
        }
    });

    const { data } = $props();

    let server_root = $state(
        data.conf?.server_root ?
            data.conf.server_root : "Error reading conf file"
    );
    let loading = $state<boolean>(false);

</script>

<!-- everything below here is displayed -->

<div>
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

    <div class="conf-about">
        <p>Change your interface configuration here!</p>
    </div>

    <form method="POST" action="?/update_config" use:enhance={() => {
        return async ({ result }) => {
            if (result.type === 'success') {
                console.log(result.data);

                if (result.data.success as boolean) {
                    success = result.data.message as string;
                } else {
                    error = result.data.error as string;
                }
            }

            await invalidateAll();
            setTimeout(clearResult, 5000);
        };
    }}>
        <div class="mb-4">
            <label for="server_root" class="form-label fw-semibold">Servers Folder</label>
            <input
                id="server_root"
                name="server_root"
                type="text"
                class="form-control form-control-lg rounded-3"
                placeholder="/home/server_user/active_servers"
                bind:value={server_root}
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
                <span>Submit</span>
            {/if}
        </button>
    </form>
</div>