<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  import HlsJS from "hls.js";

  let videoElement;
  let hls;
  let isPlaying = false;
  let isPreloadedNextVideo = false;

  let stories = [
    {
      id: 1,
      type: "video",
      hls: "https://customer-zfqec4nsru3wzh4r.cloudflarestream.com/a1d6964e340ee041a17dcfac03285002/manifest/video.m3u8",
      image:
        "https://www.picmaker.com/assets/images/instagramStory/Instagram-story-maker-template-Picmaker-4.png",
      active: true,
    },
    {
      id: 2,
      type: "video",
      hls: "https://customer-zfqec4nsru3wzh4r.cloudflarestream.com/4e3c57d6b1dae02182a2d3c8ed4b3545/manifest/video.m3u8",
      image:
        "https://www.picmaker.com/assets/images/instagramStory/Instagram-story-maker-template-Picmaker-1.png",
      active: false,
    },
  ];

  let currentStoryIndex = 0;
  let duration = videoElement?.duration || 0;
  let hlsSource = stories[currentStoryIndex].hls;

  function autoPlayNextVideo() {
    videoElement.addEventListener("timeupdate", () => {
      const timeLeft = videoElement.duration - videoElement.currentTime;
      if (timeLeft === 0) {
        nextStory();
      }
    });
  }

  function preloadNextVideo() {
    videoElement.addEventListener("timeupdate", () => {
      const timeLeft = videoElement.duration - videoElement.currentTime;
      // Preload the next video if the remaining time is less than 4 seconds and it has not been preloaded,
      if (timeLeft < 4 && !isPreloadedNextVideo) {
        let storyIndex = (currentStoryIndex + 1) % stories.length;
        let videoUrl = stories[storyIndex].hls;

        preloadVideo(videoUrl);
        isPreloadedNextVideo = true;
      }
    });
  }

  function preloadVideo(url) {
    const videoPreload = document.createElement("video");
    videoPreload.id = "wkwkkwkwkw";
    videoPreload.src = url;
    videoPreload.preload = "auto";
    videoPreload.load();
    const container = document.querySelector(".kl-story-viewer");
    if (container) {
      container.appendChild(videoPreload);
    }
  }

  function loadVideo(force = false) {
    if (force) {
      hlsSource = stories[currentStoryIndex].hls;
    }

    if (videoElement && stories[currentStoryIndex]) {
      if (HlsJS.isSupported()) {
        console.log("play on desktop");
        if (force) {
          hls.destroy(); // destroy previous instance HLS
        }
        const config = {
          // config to reduce preload and buffering
          maxBufferSize: 0,
          maxBufferLength: 6,
          maxMaxBufferLength: 6,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 2,
        };

        hls = new HlsJS(config);
        hls.loadSource(hlsSource);
        hls.attachMedia(videoElement);
        hls.on(HlsJS.Events.LEVEL_LOADED, function (e, data) {
          duration = data.details.totalduration;
          isPlaying = true;
          startAnimationProgressBar();
        });
        hls.on(HlsJS.Events.MANIFEST_PARSED, function () {
          // console.log("videoElement.duration", videoElement);
          // duration = videoElement.duration;
          // videoElement.play();
        });
      }
      // Fallback for browsers that do not support HLS
      else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("play on mobile");
        videoElement.src = hlsSource;
        videoElement.addEventListener("loadedmetadata", function () {
          console.log("loadedmetadata");
          duration = videoElement.duration;
          videoElement.play();
        });

        videoElement.addEventListener("loadeddata", () => {
          console.log("loadeddata");
          isPlaying = true;
          startAnimationProgressBar();
        });
      }
    }
  }

  const nextStory = () => {
    console.log("triggeeer");
    // Stop the currently playing video and set the progress to 0
    if (videoElement) {
      console.log("nextstory video");
      videoElement.pause();
      videoElement.currentTime = 0;
      isPlaying = false;
      pauseAnimationProgressBar();
      progress.set(0);
    }

    // Set the current story to inactive
    stories[currentStoryIndex].active = false;

    // Next story and set that story to active
    currentStoryIndex = (currentStoryIndex + 1) % stories.length;
    stories[currentStoryIndex].active = true;

    loadVideo(true);
  };

  let progress = writable(0);
  let isPaused = writable(false);
  let startTime, elapsed, intervalId;

  let progressBarElement;

  function startAnimationProgressBar() {
    progress.set(0);
    isPaused.set(false);
    startTime = Date.now();
    elapsed = 0;
    updateProgress();
  }

  function updateProgress() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if ($isPaused) {
        clearInterval(intervalId);
      } else {
        elapsed = Date.now() - startTime;
        progress.set(Math.min(100, (elapsed / (duration * 1000)) * 100));
        if ($progress >= 100) {
          clearInterval(intervalId);
        }
      }
    }, 1000 / 60);
  }

  function pauseAnimationProgressBar() {
    isPaused.set(true);
    elapsed = Date.now() - startTime; // save the elapsed time
    clearInterval(intervalId);
  }

  function resumeAnimationProgressBar() {
    isPaused.set(false);
    startTime = Date.now() - elapsed; // Reset the start time based on the elapsed time
    updateProgress();
  }

  function togglePlayPause() {
    console.log("pause", $isPaused);
    console.log("progress", $progress);

    if ($progress === 0) {
      startAnimationProgressBar();
    }
    if (!$isPaused && $progress > 0) {
      pauseAnimationProgressBar();
    } else {
      resumeAnimationProgressBar();
    }

    if (videoElement.paused || videoElement.ended) {
      videoElement.play();
      isPlaying = true;
    } else {
      videoElement.pause();
      isPlaying = false;
    }
  }

  function handleMuteUnMute() {
    videoElement.muted = !videoElement.muted;
  }

  onMount(() => {
    loadVideo();
    autoPlayNextVideo();
    // preloadNextVideo();
    videoElement.addEventListener("ended", () => {
      isPlaying = false;
    });
  });

  $: if (progressBarElement) {
    progressBarElement.style.width = `${$progress}%`;
  }

  // $: if ($progress >= 100) {
  //   setTimeout(() => {
  //     progress.set(0);
  //   }, 500);
  // }
</script>

<div class="kl-stories">
  <div class="kl-stories-container">
    <div class="kl-stories-viewer active">
      <div class="kl-story-header">
        <div class="kl-story-progressbar-column">
          {#each stories as story, index}
            <div
              class="kl-story-progressbar-container {index < currentStoryIndex
                ? 'progress-done'
                : ''} {index === currentStoryIndex ? '' : 'progress-inactive'}"
            >
              {#if index === currentStoryIndex}
                <div
                  class="kl-story-progressbar-item"
                  bind:this={progressBarElement}
                ></div>
              {/if}
            </div>
          {/each}
        </div>
        <div class="controls">
          <button class="play-pause-btn" on:click={togglePlayPause}>
            {isPlaying && !videoElement.ended ? "Pause" : "Play"}
          </button>
          <button class="next-btn" on:click={handleMuteUnMute}>
            {videoElement?.muted ? "Unmuted" : "Muted"}
          </button>
          <button class="next-btn" on:click={nextStory}> Next </button>
        </div>
      </div>

      <div class="kl-story-viewer">
        <div class="kl-story-content">
          <video
            bind:this={videoElement}
            preload="auto"
            autoplay
            muted
            playsInline
          >
            <track kind="captions" />
            {#each stories as story}
              {#if story.active}
                <source src={story.hls} type="application/vnd.apple.mpegurl" />
              {/if}
            {/each}
            Browser Anda tidak mendukung video ini.
          </video>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .kl-stories {
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1080px;
  }

  .kl-stories-container {
    height: calc(100vh - 30px);
    max-height: var(--height-border);
    position: relative;
    width: 100vw;
    max-width: var(--width-border);
    padding: 0;
    margin: 0;
    transform-style: preserve-3d;
    will-change: transform;
  }
  @media screen and (max-width: 550px) {
    .kl-stories-container {
      border-radius: 0px;
      margin: 0;
      height: 100vh;
      max-height: 100vh;
      max-width: 100vw;
    }
  }

  .kl-stories-viewer {
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition:
      left 0.5s ease,
      transform 0.5s ease;
    display: none;
    overflow: hidden;
    background: transparent;
    will-change: transform;
  }

  .kl-stories-viewer.active {
    transform-origin: center right;
    transition:
      left 0.5s ease,
      transform 0.5s ease;
    display: block;
    transform: translateX(0%) rotateY(0deg);
    -webkit-transform: translateX(0%) rotateY(0deg);
    position: absolute;
    top: 0;
    left: 0%;
  }

  .kl-story-progressbar-column {
    height: 2px;
    top: 8px;
    left: 6px;
    right: 6px;
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
  }

  .kl-story-progressbar-container {
    background-color: rgba(233, 232, 232, 0.5);
    height: 100%;
    flex-grow: 1;
    border-radius: 2px;
    margin: 0 2px;
  }

  .kl-story-progressbar-item {
    background-color: #e9e8e8;
    height: 2px;
    width: 0;
  }

  .progress-inactive {
    opacity: 1;
  }

  .progress-done {
    background-color: #e9e8e8;
  }

  .kl-story-viewer {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    transform: translateY(0);
  }

  .kl-story-content {
    overflow: hidden;
    width: 100%;
    height: 100%;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* .kl-story-content img {
		width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
	}

	.story-inactive {
		display: none;
	} */

  .controls {
    position: absolute;
    display: flex;
    flex-direction: row;
    gap: 8px;
    z-index: 10;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
  }

  .play-pause-btn {
    background: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
