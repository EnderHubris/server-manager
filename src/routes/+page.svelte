<script lang="ts">
    import logo from '$lib/assets/mine_manager.png';
</script>

<main class="min-vh-100">
    <section class="hero py-5">
        <div class="container">
            <div class="row align-items-center g-5">
    
                <div class="col-lg-6 slide-left">
                    <span class="badge bg-light text-dark px-3 py-2 rounded-pill mb-3">
                        Simplistic Actions
                    </span>
                    <span class="badge bg-light text-dark px-3 py-2 rounded-pill mb-3">
                        Monitoring
                    </span>
                    <span class="badge bg-light text-dark px-3 py-2 rounded-pill mb-3">
                        Maintainence
                    </span>
    
                    <h1 class="display-2 fw-bold lh-sm">
                        Server Management with Ease
                    </h1>
    
                    <p class="lead text-light mt-4">
                        General Manager designed to allow quick and simple server
                        upgrading.
                    </p>
    
                    <div class="d-flex flex-wrap gap-3 mt-4">
                        <a href="#about" class="btn btn-glow px-4">About</a>
                        <a href="/dashboard" class="btn btn-outline-light rounded-pill px-4">
                            View Servers
                        </a>
                    </div>
                </div>
    
                <div class="col-lg-6 slide-right">
                    <div class="float-card p-4">
                        <img id="site-logo" src={logo} alt="img-logo">
                    </div>
                </div>
    
            </div>
        </div>
    </section>
    <hr>
    <section id="about" class="about py-5">
        <div class="container">
            <div class="row align-items-center g-5">

                <div class="col-lg-6 slide-left">
                    <h2 class="display-5 fw-bold mb-4">
                        What's the purpose?
                    </h2>

                    <p class="lead text-light mb-4">
                        I noticed I needed to update my Minecraft Servers
                        but I did not want to deal with the hastle of typing
                        so many commands and worrying that I might corrupt
                        my server data.
                    </p>

                    <p class="text-light opacity-75">
                        From this simple web-application you can prepare references
                        to your active servers allowing you to perform simple aintainence
                        regarding updates and backups.
                    </p>
                    
                    <p class="text-light opacity-75">
                        While there are professional applications such as <a href="https://pterodactyl.io/">pterodactyl</a>
                        I'm looking for opportunities to get more experience making web-applications.
                    </p>
                </div>

                <div class="col-lg-6 slide-right">
                    <div class="float-card p-4">

                        <div class="row g-4 text-center">

                            <div class="col-6">
                                <div class="p-4 rounded bg-dark bg-opacity-25">
                                    <h3 class="fw-bold mb-1">Highly Scalable</h3>
                                    <small>Svelte Project</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-4 rounded bg-dark bg-opacity-25">
                                    <h3 class="fw-bold mb-1">Dockerized Application</h3>
                                    <small>System Security</small>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    </section>
</main>