<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { enhance } from '$app/forms';

    import logo from '$lib/assets/mine_manager.png';

    let username = $state<string>("");
    let password = $state<string>("");

    let loading = $state<boolean>(false);
    let showPassword = $state<boolean>(false);

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");
</script>

<div id="login-panel" class="min-vh-100 container d-flex align-items-center justify-content-center bg-body-tertiary py-5">
	<div class="card shadow-lg border-0 rounded-4 w-100" style="max-width: 430px;">
		<div class="card-body p-4 p-md-5">

			<!-- Header -->
			<div class="text-center mb-4">
				<div
					class="mx-auto mb-3 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
					style="width:56px;height:56px;"
				>
					<img id="site-logo" style="width: 75px;" src={logo} alt="logo-icon">
				</div>

				<h1 class="h3 fw-bold mb-1">Login</h1>
				<p class="text-secondary mb-0">Login in to your account</p>
			</div>

			<!-- Feedback -->
			{#if error}
                <div class="alert alert-danger">{error}</div>
            {/if}
            {#if success}
                <div class="alert alert-success">{success}</div>
            {/if}
            {#if warning}
                <div class="alert alert-warning">{warning}</div>
            {/if}

			<!-- Form -->
			<form method="POST" action="?/login" use:enhance={() => {
                return async ({ result, update }) => {
                    await update();
                    if (result.type === 'success') {
                        console.log(result.data);

                        if (result.data.success as boolean) {
                            success = result.data.message as string;
                        } else {
                            error = result.data.message as string;
                        }
                    }

                    await invalidateAll();
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
						bind:value={username}
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
							bind:value={password}
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
						Signing in...
					{:else}
						<span>Sign In</span>
						<span>→</span>
					{/if}
				</button>
			</form>

			<!-- Footer -->
			<p class="text-center text-secondary mt-4 mb-0">
				Don't have an account? Ask your local administrator.
			</p>

		</div>
	</div>
</div>