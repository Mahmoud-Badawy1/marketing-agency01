let audioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playChime(freq: number, duration = 0.4) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio not supported
  }
}

export const sounds = {
  lantern: () => {
    playChime(523, 0.5);
    setTimeout(() => playChime(659, 0.3), 120);
  },
  star: () => {
    playChime(880, 0.25);
    setTimeout(() => playChime(1047, 0.2), 80);
    setTimeout(() => playChime(1319, 0.15), 160);
  },
  crescent: () => {
    playChime(392, 0.6);
    setTimeout(() => playChime(523, 0.4), 200);
  },
};
