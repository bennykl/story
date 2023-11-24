<script>
    export let duration = 5; // durasi default adalah 5 detik

    function startAnimation() {
        progressBar.style.width = '0%'; // reset width bar
        setTimeout(() => {
            progressBar.style.transition = `width ${duration}s linear`;
            progressBar.style.width = '100%';
        }, 100);
    }

    // Referensi elemen
    let progressBar;
</script>

<div class="progress-container">
	<div class="progress-bar" bind:this={progressBar}></div>
</div>

<button on:click={startAnimation}>Mulai Animasi</button>

<style>
	.progress-container {
		width: 100%;
		background-color: white;
		border: 1px solid #ddd;
		border-radius: 5px;
	}

	.progress-bar {
		height: 20px;
		background-color: yellow;
		border-radius: 5px;
		width: 0;
	}
</style>
