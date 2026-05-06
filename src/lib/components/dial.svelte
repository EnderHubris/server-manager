<script lang="ts">
    let { size = 'md' } = $props<{ size?: 'sm' | 'md' | 'lg' }>();
</script>

<div class="dial {size}"></div>

<style>
    .dial {
        border-radius: 50%;
        border-style: solid;
        border-color: rgba(255, 255, 255, 0.08);
        border-top-color: #6ea8fe;
        animation: spin 0.75s linear infinite;
    }

    .sm { width: 32px; height: 32px; border-width: 2.5px; }
    .md { width: 56px; height: 56px; border-width: 3px; }
    .lg { width: 80px; height: 80px; border-width: 4px; }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>