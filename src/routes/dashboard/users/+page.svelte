<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    const roleBadge: Record<string, string> = {
        admin:     'bg-danger',
        user:      'bg-secondary',
    };

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    let open = $state(false);

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

    let username = $state<string>("");
    let oldpasswd = $state<string>("");
    let newpasswd = $state<string>("");

    let new_username = $state<string>("");
    let usr_passwd = $state<string>("");
    let user_role = $state<string>("user");

    let loading = $state<boolean>(false);

    let showPassword = $state<boolean>(false);
        
    let activeForm = $state<string>("update-passwd");

    const { data } = $props();
    username = data.username as string;

    async function removeUser(username: string) {
        if (window.confirm(`Are you sure you want to DELETE this user "${username}"?`)) {
            const req = await fetch('/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-user', username: username })
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
</script>

<!-- everything below here is displayed -->

<div>
    <div class="collapse-wrapper">
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

        <button class="collapse-toggle" onclick={() => open = !open}>
            <span>Update Profile</span>
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
            <div class="collapse-body">
                <label for="form_option" class="form-label fw-semibold">Action</label>
                <select bind:value={activeForm}
                    name="form_option"
                    class="form-select form-select-lg rounded-3"
                    style="margin-bottom: 45px;"
                >
                    <option value="" disabled selected>What would you like to do?</option>
                    <option value="update-passwd">Update Password</option>
                    <option value="create-user">Add User</option>
                </select>

                <!-- Form -->
                {#if activeForm === "update-passwd"}

                    <form method="POST" action="?/update_passwd" use:enhance={() => {
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

                            oldpasswd = newpasswd = "";
                            loading = false;

                            setTimeout(clearResult, 5000);
                        };
                    }}>

                        <!-- Username -->
                        <input
                            id="username"
                            name="username"
                            type="text"
                            class="form-control form-control-lg rounded-3"
                            placeholder="username"
                            bind:value={username}
                            required
                            hidden
                        />

                        <!-- Password -->
                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Current Password</label>

                            <div class="input-group input-group-lg">
                                <input
                                    id="password"
                                    name="oldpasswd"
                                    type={showPassword ? 'text' : 'password'}
                                    class="form-control rounded-start-3"
                                    placeholder="••••••••"
                                    bind:value={oldpasswd}
                                    autocomplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary rounded-end-3"
                                    onclick={() => (showPassword = !showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {#if showPassword}
                                        Hide
                                    {:else}
                                        Show
                                    {/if}
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">New Password</label>

                            <div class="input-group input-group-lg">
                                <input
                                    id="password"
                                    name="newpasswd"
                                    type={showPassword ? 'text' : 'password'}
                                    class="form-control rounded-start-3"
                                    placeholder="••••••••"
                                    bind:value={newpasswd}
                                    autocomplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary rounded-end-3"
                                    onclick={() => (showPassword = !showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {#if showPassword}
                                        Hide
                                    {:else}
                                        Show
                                    {/if}
                                </button>
                            </div>
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

                {:else if activeForm === "create-user"}

                    <form method="POST" action="?/add_user" use:enhance={() => {
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

                            new_username = usr_passwd = "";
                            user_role = "user";

                            loading = false;
                            setTimeout(clearResult, 5000);
                        };
                    }}>
                        <!-- Username -->
                        <div class="mb-3">
                            <label for="username" class="form-label fw-semibold">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                class="form-control form-control-lg rounded-3"
                                placeholder="username"
                                bind:value={new_username}
                                autocomplete="username"
                                required
                            />
                        </div>

                        <!-- Password -->
                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Password</label>

                            <div class="input-group input-group-lg">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    class="form-control rounded-start-3"
                                    placeholder="••••••••"
                                    bind:value={usr_passwd}
                                    autocomplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary rounded-end-3"
                                    onclick={() => (showPassword = !showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {#if showPassword}
                                        Hide
                                    {:else}
                                        Show
                                    {/if}
                                </button>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="role" class="form-label fw-semibold">Role</label>
                            <select bind:value={user_role}
                                name="role"
                                class="form-select form-select-lg rounded-3"
                                style="margin-bottom: 45px;"
                                required
                            >
                                <option value="" disabled selected>Choose a role</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
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
                                <span>Create</span>
                            {/if}
                        </button>
                    </form>

                {/if}
            </div>
        {/if}
    </div>

    <table class="operator-table">
        <thead>
            <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Joined</th>
            </tr>
        </thead>
        <tbody>
            {#each data.operators as user}
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <button
                                class="btn btn-danger btn-sm"
                                style="margin-right: 20px;"
                                onclick={ () => { removeUser(user.username) } }
                            >
                                Remove
                            </button>
                            <span>{user.username}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge {roleBadge[user.role] ?? 'bg-secondary'}">
                            {user.role}
                        </span>
                    </td>
                    <td>
                        {formatDate(user.createdAt)}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>