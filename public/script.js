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
    els.footnote.textContent = "And here you are.";
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

// ---------- sky phase based on viewer's local time ----------
const LIGHT_TEXT = { text: "#fff5e6", accent: "#ffe4b8", shadow: "rgba(20, 4, 18, 0.55)" };
const DARK_TEXT_COOL = { text: "#15243f", accent: "#0d3a5e", shadow: "rgba(255, 255, 255, 0.7)" };
const DARK_TEXT_WARM = { text: "#3a1822", accent: "#5e2230", shadow: "rgba(255, 240, 220, 0.6)" };

const palettes = {
  night: {
    sky: ["#020110", "#06031e", "#0a0524", "#0e072a", "#120a30", "#161035", "#1a1238"],
    sun: 0, glow: 0, stars: 1.0,
    oceanTop: "#0a0820", oceanBot: "#040210", oceanShimmer: "rgba(180, 200, 255, 0.06)",
    ...LIGHT_TEXT,
  },
  dawn: {
    sky: ["#180c30", "#321648", "#5d2452", "#8a3e5b", "#b95e62", "#dd8472", "#f5af8a"],
    sun: 0, glow: 0.3, stars: 0.5,
    oceanTop: "#150b25", oceanBot: "#080418", oceanShimmer: "rgba(220, 130, 100, 0.12)",
    ...LIGHT_TEXT,
  },
  sunrise: {
    sky: ["#1c0e35", "#3e1948", "#7a2e58", "#bd5468", "#e88471", "#f6ab78", "#ffd4a4"],
    sun: 1, glow: 0.85, stars: 0.1,
    oceanTop: "#1a0d2b", oceanBot: "#0f0618", oceanShimmer: "rgba(255, 180, 120, 0.18)",
    ...LIGHT_TEXT,
  },
  morning: {
    sky: ["#5d96c5", "#7eaad0", "#9dbfdc", "#b8cee2", "#d3dde9", "#e7e9eb", "#f2f0e7"],
    sun: 0.6, glow: 0.08, stars: 0,
    oceanTop: "#2c5478", oceanBot: "#102a48", oceanShimmer: "rgba(255, 255, 255, 0.16)",
    ...DARK_TEXT_COOL,
  },
  midday: {
    sky: ["#3e8bcd", "#5da0d4", "#7eb2da", "#9ec1de", "#bcd1e6", "#d8e3eb", "#efeeed"],
    sun: 0.55, glow: 0.05, stars: 0,
    oceanTop: "#3a6890", oceanBot: "#143258", oceanShimmer: "rgba(255, 255, 255, 0.2)",
    ...DARK_TEXT_COOL,
  },
  afternoon: {
    sky: ["#5786b8", "#7397ba", "#9aa9b1", "#c5b29c", "#dcba8e", "#edc788", "#f6d59c"],
    sun: 0.85, glow: 0.4, stars: 0,
    oceanTop: "#2c4f70", oceanBot: "#0e2842", oceanShimmer: "rgba(255, 220, 160, 0.18)",
    ...DARK_TEXT_WARM,
  },
  sunset: {
    sky: ["#1a0a2e", "#3d1442", "#7a2a4e", "#c25168", "#e8896a", "#f5b271", "#fcd5a1"],
    sun: 1, glow: 1, stars: 0.55,
    oceanTop: "#1a0d2b", oceanBot: "#0f0618", oceanShimmer: "rgba(255, 200, 140, 0.18)",
    ...LIGHT_TEXT,
  },
  dusk: {
    sky: ["#0a072a", "#190d3e", "#321648", "#562247", "#7c3548", "#985046", "#b07854"],
    sun: 0.35, glow: 0.4, stars: 0.8,
    oceanTop: "#100a28", oceanBot: "#060418", oceanShimmer: "rgba(220, 140, 110, 0.1)",
    ...LIGHT_TEXT,
  },
};

function getPhase(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 22.5 || h < 4.5) return "night";
  if (h < 6.5) return "dawn";
  if (h < 8) return "sunrise";
  if (h < 11) return "morning";
  if (h < 15) return "midday";
  if (h < 18) return "afternoon";
  if (h < 21.5) return "sunset";
  return "dusk";
}

function applySky() {
  const phase = getPhase(new Date());
  const p = palettes[phase];
  const root = document.documentElement.style;
  p.sky.forEach((c, i) => root.setProperty(`--sky-${i + 1}`, c));
  root.setProperty("--sun-opacity", p.sun);
  root.setProperty("--sun-glow-opacity", p.glow);
  root.setProperty("--stars-opacity", p.stars);
  root.setProperty("--ocean-top", p.oceanTop);
  root.setProperty("--ocean-bot", p.oceanBot);
  root.setProperty("--ocean-shimmer", p.oceanShimmer);
  root.setProperty("--text", p.text);
  root.setProperty("--accent", p.accent);
  root.setProperty("--shadow", p.shadow);
  document.body.dataset.phase = phase;
}

applySky();
setInterval(applySky, 60_000);

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
        } else if (e.data === YT.PlayerState.ENDED) {
          // explicit loop back to the shared timestamp
          e.target.seekTo(START_AT, true);
          e.target.playVideo();
        } else if (e.data === YT.PlayerState.PAUSED) {
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
