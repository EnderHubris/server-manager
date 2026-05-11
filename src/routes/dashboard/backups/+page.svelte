<script lang="ts">
    function formatSize(bytes: number): string {
        if (bytes < 1024)                   return `${bytes} B`;
        if (bytes < 1024 * 1024)            return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024)     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    function formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year:  'numeric',
            month: 'short',
            day:   'numeric'
        });
    }

    const { data } = $props();
</script>

<!-- everything below here is displayed -->
<div class="backup-list">
    {#each data.backups as backup}
        <a href="/backups/{backup.name}" download class="backup-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="backup-name">{backup.name}</span>
            <span class="backup-size">{formatSize(backup.size)}</span>
            <span class="backup-date">{formatDate(backup.createdAt)}</span>
        </a>
    {:else}
        <p class="no-backups">No backups found.</p>
    {/each}
</div>