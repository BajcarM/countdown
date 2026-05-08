// Wed 13 May 2026, 21:00 Canary Islands time (WEST = UTC+1 in May)
const TARGET = new Date("2026-05-13T21:00:00+01:00").getTime();

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  headline: document.querySelector(".headline"),
  footnote: document.getElementById("footnote"),
};

const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const diff = TARGET - Date.now();

  if (diff <= 0) {
    els.days.textContent = "00";
    els.hours.textContent = "00";
    els.minutes.textContent = "00";
    els.seconds.textContent = "00";
    els.headline.innerHTML = 'Hola, <span class="name">Summer</span>';
    els.footnote.textContent = "the Atlantic, and you";
    return;
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  els.days.textContent = pad(days);
  els.hours.textContent = pad(hours);
  els.minutes.textContent = pad(minutes);
  els.seconds.textContent = pad(seconds);
}

tick();
setInterval(tick, 1000);

// ---------- ambient music (YouTube IFrame API) ----------
const VIDEO_ID = "H-oAQY0K-PA";
const START_AT = 5418;

const toggleBtn = document.getElementById("audio-toggle");
let ytPlayer = null;
let isPlaying = false;

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked || !ytPlayer || typeof ytPlayer.unMute !== "function") return;
  ytPlayer.unMute();
  if (typeof ytPlayer.setVolume === "function") ytPlayer.setVolume(70);
  ytPlayer.playVideo();
  audioUnlocked = true;
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
  document.removeEventListener("touchstart", unlockAudio);
  document.removeEventListener("scroll", unlockAudio);
}

document.addEventListener("pointerdown", unlockAudio);
document.addEventListener("keydown", unlockAudio);
document.addEventListener("touchstart", unlockAudio, { passive: true });
document.addEventListener("scroll", unlockAudio, { passive: true });

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("ytplayer", {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      playlist: VIDEO_ID,
      start: START_AT,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
    },
    events: {
      onReady: (e) => {
        toggleBtn.disabled = false;
        try { e.target.playVideo(); } catch (_) {}
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          isPlaying = true;
          toggleBtn.classList.add("playing");
          toggleBtn.setAttribute("aria-label", "Pause music");
        } else if (
          e.data === YT.PlayerState.PAUSED ||
          e.data === YT.PlayerState.ENDED
        ) {
          isPlaying = false;
          toggleBtn.classList.remove("playing");
          toggleBtn.setAttribute("aria-label", "Play music");
        }
      },
    },
  });
};

toggleBtn.addEventListener("click", () => {
  if (!ytPlayer || typeof ytPlayer.playVideo !== "function") return;
  if (!audioUnlocked) unlockAudio();
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
});
