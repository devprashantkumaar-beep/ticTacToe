const AudioManager = (() => {
  let audioCtx = null;
  let isMuted = localStorage.getItem('tictactoe_muted') === 'true';

  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playTone = (frequency, type, duration, slideTo = null) => {
    if (isMuted) return;
    try {
      initAudio();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      if (slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      }

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  };

  return {
    toggleMute: () => {
      isMuted = !isMuted;
      localStorage.setItem('tictactoe_muted', isMuted);
      return isMuted;
    },
    getMuteState: () => isMuted,
    playClick: () => playTone(800, 'sine', 0.08),
    playX: () => playTone(587.33, 'sine', 0.15), // D5 note
    playO: () => playTone(493.88, 'triangle', 0.18), // B4 note
    playWin: () => {
      // Celebratory arpeggio
      const now = audioCtx ? audioCtx.currentTime : 0;
      setTimeout(() => playTone(523.25, 'sine', 0.15), 0); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.15), 100); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.15), 200); // G5
      setTimeout(() => playTone(1046.50, 'sine', 0.35), 300); // C6
    },
    playLose: () => {
      // Melancholic slide down
      playTone(392.00, 'sawtooth', 0.45, 196.00); // G4 to G3
    },
    playDraw: () => {
      // Dual flat tone
      playTone(293.66, 'triangle', 0.25); // D4
      setTimeout(() => playTone(293.66, 'triangle', 0.15), 150);
    },
    playAchievement: () => {
      // Sparkly lock unlock
      setTimeout(() => playTone(880, 'sine', 0.1), 0); // A5
      setTimeout(() => playTone(987.77, 'sine', 0.1), 75); // B5
      setTimeout(() => playTone(1046.50, 'sine', 0.1), 150); // C6
      setTimeout(() => playTone(1318.51, 'sine', 0.35), 225); // E6
    }
  };
})();

// Export or bind to window
window.AudioManager = AudioManager;
