/**
 * Divya Jyotish - Web Audio Chanting & 108 Bead Jaap Mala
 * Synthesizes 432Hz Om drone, Tibetan singing bowl bell harmonics,
 * and haptic bead click without requiring external audio files.
 */

const JaapAudio = (function () {
  let audioCtx = null;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let droneGain = null;
  let isDronePlaying = false;

  function initContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a realistic wooden bead click
  function playBeadClick() {
    try {
      initContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);

      // Trigger phone vibration if available
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    } catch (e) {
      // Audio not permitted yet
    }
  }

  // Play a Tibetan singing bowl bell harmonic upon completing 108 beads
  function playSingingBowlBell() {
    try {
      initContext();
      const fundamentals = [272, 544, 816, 1088]; // Harmonic series of singing bowl
      fundamentals.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const initialGain = 0.25 / (index + 1);
        gain.gain.setValueAtTime(initialGain, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 3.6);
      });

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }
    } catch (e) { }
  }

  // Toggle meditative 432 Hz / 136.1 Hz Cosmic Om Drone
  function toggleOmDrone(enable) {
    initContext();
    if (enable) {
      if (isDronePlaying) return;
      droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 2.0);

      // 136.1 Hz = Earth frequency / Cosmic OM
      droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'sine';
      droneOsc1.frequency.setValueAtTime(136.1, audioCtx.currentTime);

      // 432 Hz harmonic
      droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(432.0 / 2, audioCtx.currentTime); // 216 Hz

      droneOsc1.connect(droneGain);
      droneOsc2.connect(droneGain);
      droneGain.connect(audioCtx.destination);

      droneOsc1.start();
      droneOsc2.start();
      isDronePlaying = true;
    } else {
      if (!isDronePlaying || !droneGain) return;
      droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
      setTimeout(() => {
        try {
          if (droneOsc1) droneOsc1.stop();
          if (droneOsc2) droneOsc2.stop();
        } catch (e) { }
        isDronePlaying = false;
      }, 1000);
    }
  }

  return {
    playBeadClick,
    playSingingBowlBell,
    toggleOmDrone,
    getIsDronePlaying: () => isDronePlaying
  };
})();

if (typeof window !== "undefined") {
  window.JaapAudio = JaapAudio;
}
