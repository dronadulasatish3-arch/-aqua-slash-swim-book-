// Subtle synthesized sounds — no audio files required.
import { useSyncExternalStore } from 'react';

let ctx: AudioContext | null = null;
let enabled = (() => {
  try {
    return localStorage.getItem('aquaslash-sound') !== 'off';
  } catch {
    return true;
  }
})();
const soundListeners = new Set<() => void>();

export function getSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(v: boolean) {
  if (enabled === v) return;
  enabled = v;
  try {
    localStorage.setItem('aquaslash-sound', v ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  soundListeners.forEach((f) => f());
}

/** One shared Sound ON/OFF for Glass, Pool and the whole app. */
export function useSoundOn() {
  return useSyncExternalStore(
    (fn) => {
      soundListeners.add(fn);
      return () => soundListeners.delete(fn);
    },
    () => enabled,
    () => enabled,
  );
}

function ac(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freqA: number, freqB: number, start: number, dur: number, vol = 0.12, type: OscillatorType = 'sine') {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freqA, t);
  o.frequency.exponentialRampToValueAtTime(freqB, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, freq: number, vol = 0.12, start = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(freq * 0.4, t + dur);
  f.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

export const sfx = {
  drop() {
    tone(1400, 380, 0, 0.12, 0.13);
    tone(380, 900, 0.1, 0.12, 0.08);
  },
  splash() {
    noise(0.45, 1800, 0.1);
  },
  bubbles() {
    for (let i = 0; i < 5; i++) {
      const f = 380 + Math.random() * 500;
      tone(f, f * 1.9, i * 0.07 + Math.random() * 0.03, 0.06, 0.04);
    }
  },
  click() {
    tone(900, 700, 0, 0.05, 0.04, 'triangle');
  },
  success() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, f * 1.01, i * 0.11, 0.35, 0.08, 'triangle'));
  },
  celebrate() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.01, i * 0.1, 0.45, 0.08, 'triangle'));
    [1568, 2093].forEach((f, i) => tone(f, f * 0.98, 0.6 + i * 0.12, 0.5, 0.05, 'sine'));
    noise(0.6, 2500, 0.04, 0.55);
  },
};
