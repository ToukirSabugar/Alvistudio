// Optional ambient sound, made in the browser with the Web Audio API (no audio files to download).
// A soft, low room tone through a slowly moving filter and a generated reverb, and a quiet chime
// when a new chapter of the home story comes on screen. Off until the visitor switches it on.

type Engine = { ctx: AudioContext; master: GainNode; bus: AudioNode };
let engine: Engine | null = null;
let on = false;

/** Reverb tail: decaying noise in a buffer. */
function impulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function create(): Engine | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  // Shared bus: low-pass, then dry plus reverb.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.4;
  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  const verb = ctx.createConvolver();
  verb.buffer = impulse(ctx, 5, 2.6);
  lp.connect(dry).connect(master);
  lp.connect(verb).connect(wet).connect(master);

  // The filter opens and closes very slowly, so the tone breathes.
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.035;
  lfoDepth.gain.value = 380;
  lfo.connect(lfoDepth).connect(lp.frequency);
  lfo.start();

  // Room tone: a low A with a slightly detuned twin and a quiet fifth above.
  for (const [f, a] of [
    [55, 0.05],
    [55.4, 0.035],
    [82.4, 0.014],
    [110, 0.01],
  ]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.value = a;
    o.connect(g).connect(lp);
    o.start();
  }
  return { ctx, master, bus: lp };
}

/** Starts (or resumes) the sound. Call from a click or tap: browsers block audio before that. */
export async function startAmbient(): Promise<void> {
  engine ??= create();
  if (!engine) return;
  const { ctx, master } = engine;
  if (ctx.state === "suspended") await ctx.resume();
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0.9, ctx.currentTime, 1.2);
  on = true;
}

/** Fades the sound out and suspends the audio engine. */
export function stopAmbient(): void {
  on = false;
  if (!engine) return;
  const { ctx, master } = engine;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
  window.setTimeout(() => {
    if (!on && ctx.state === "running") void ctx.suspend();
  }, 1200);
}

export const isAmbientOn = () => on;

// A pentatonic step per chapter, so moving through the story climbs gently.
const NOTES = [220, 246.9, 277.2, 329.6, 370, 440, 493.9];
let lastChime = 0;

/** Soft bell-like tone for chapter `index` (0..6). Silent when the sound is off. */
export function chime(index: number): void {
  if (!on || !engine) return;
  const now = performance.now();
  if (now - lastChime < 600) return;
  lastChime = now;
  const { ctx, bus } = engine;
  const t = ctx.currentTime;
  const f = NOTES[Math.max(0, Math.min(NOTES.length - 1, index))];
  for (const [mult, amp] of [
    [1, 0.05],
    [2.01, 0.012],
  ]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f * mult;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 3.3);
  }
}
