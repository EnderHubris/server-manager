import adapter from '@sveltejs/adapter-node'; // needed for SSC
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            out: 'build'
        })
    }
};

export default config;