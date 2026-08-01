let synth = null;

async function getSynth() {
  if (!synth) {
    const Tone = await import("tone");
    await Tone.start();
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.4 },
    }).toDestination();
    synth.volume.value = -10;
  }
  return synth;
}

export async function playPublishChime(enabled) {
  if (!enabled) return;
  try {
    const s = await getSynth();
    const now = s.context.currentTime;
    s.triggerAttackRelease("C5", "16n", now);
    s.triggerAttackRelease("E5", "16n", now + 0.08);
    s.triggerAttackRelease("G5", "8n", now + 0.16);
  } catch {
    // audio can fail silently (autoplay policies etc.) — never block the UI on it
  }
}

export async function playTickSound(enabled) {
  if (!enabled) return;
  try {
    const s = await getSynth();
    s.triggerAttackRelease("A4", "32n");
  } catch {
    /* no-op */
  }
}
