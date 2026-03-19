// ============================================================
// Idle Abyss — Procedural Sound System (Web Audio API)
// No external dependencies. Defaults to muted.
// ============================================================

let audioCtx: AudioContext | null = null;
let _muted = true;
let _volume = 0.3;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function gain(ctx: AudioContext, vol: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = vol * _volume;
  g.connect(ctx.destination);
  return g;
}

// --- Sound generators ---

function playTap() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = gain(ctx, 0.15);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
  osc.connect(g);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

function playHit() {
  const ctx = getCtx();
  // Noise burst for thud
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const g = gain(ctx, 0.12);
  // Low-pass for thud
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  noise.connect(filter);
  filter.connect(g);
  noise.start(ctx.currentTime);
}

function playMonsterDeath() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Pop: quick sine burst
  const osc = ctx.createOscillator();
  const g = gain(ctx, 0.2);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
  g.gain.setValueAtTime(0.2 * _volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.15);

  // Crunch: noise
  const bufferSize = Math.floor(ctx.sampleRate * 0.1);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const g2 = gain(ctx, 0.15);
  noise.connect(g2);
  noise.start(t);
}

function playGoldPickup() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = gain(ctx, 0.12);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(1800, t + 0.08);
  g.gain.setValueAtTime(0.12 * _volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.12);
}

function playLevelUp() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.1);
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.1 * _volume, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
    osc.connect(g);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.2);
  });
}

function playAchievement() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Fanfare: major chord arpeggio
  const notes = [392, 494, 587, 784, 988]; // G4, B4, D5, G5, B5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = gain(ctx, 0.08);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.08 * _volume, t + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);
    osc.connect(g);
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.4);
  });
}

function playBossAppear() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = gain(ctx, 0.2);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);
  g.gain.setValueAtTime(0.2 * _volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  // Low-pass for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  osc.connect(filter);
  filter.connect(g);
  osc.start(t);
  osc.stop(t + 0.6);

  // Sub rumble
  const osc2 = ctx.createOscillator();
  const g2 = gain(ctx, 0.15);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(50, t);
  osc2.frequency.exponentialRampToValueAtTime(30, t + 0.8);
  g2.gain.setValueAtTime(0.15 * _volume, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  osc2.connect(g2);
  osc2.start(t);
  osc2.stop(t + 0.8);
}

function playPrestige() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Ethereal whoosh: filtered noise sweep
  const bufferSize = Math.floor(ctx.sampleRate * 0.8);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * env * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, t);
  filter.frequency.exponentialRampToValueAtTime(4000, t + 0.4);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.8);
  filter.Q.value = 2;
  const g = gain(ctx, 0.15);
  noise.connect(filter);
  filter.connect(g);
  noise.start(t);

  // Shimmer tone
  const osc = ctx.createOscillator();
  const g2 = gain(ctx, 0.06);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.8);
  g2.gain.setValueAtTime(0.06 * _volume, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  osc.connect(g2);
  osc.start(t);
  osc.stop(t + 0.8);
}

// --- Public API ---

export type SoundName =
  | 'tap'
  | 'hit'
  | 'monsterDeath'
  | 'goldPickup'
  | 'levelUp'
  | 'achievement'
  | 'bossAppear'
  | 'prestige';

const soundMap: Record<SoundName, () => void> = {
  tap: playTap,
  hit: playHit,
  monsterDeath: playMonsterDeath,
  goldPickup: playGoldPickup,
  levelUp: playLevelUp,
  achievement: playAchievement,
  bossAppear: playBossAppear,
  prestige: playPrestige,
};

export function playSound(name: SoundName): void {
  if (_muted) return;
  try {
    soundMap[name]();
  } catch {
    // Silently ignore audio errors (e.g. user hasn't interacted yet)
  }
}

export function isMuted(): boolean {
  return _muted;
}

export function setMuted(muted: boolean): void {
  _muted = muted;
  try {
    localStorage.setItem('idle-abyss-muted', muted ? '1' : '0');
  } catch {
    // ignore
  }
}

export function toggleMuted(): boolean {
  setMuted(!_muted);
  return _muted;
}

// Initialize mute state from localStorage
try {
  const saved = localStorage.getItem('idle-abyss-muted');
  // Default to muted if no preference saved
  _muted = saved === null ? true : saved === '1';
} catch {
  _muted = true;
}
