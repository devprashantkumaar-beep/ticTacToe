const StatsManager = (() => {
  const DEFAULT_STATS = {
    wins: { easy: 0, medium: 0, hard: 0, impossible: 0, local: 0 },
    losses: { easy: 0, medium: 0, hard: 0, impossible: 0 },
    draws: { easy: 0, medium: 0, hard: 0, impossible: 0, local: 0 },
    puzzlesSolved: [], // Array of solved puzzle IDs
    dailyStreak: 0,
    bestDailyStreak: 0,
    dailyCompletedDates: [], // YYYY-MM-DD
    unlockedAchievements: [], // Array of achievement IDs
    premiumActive: false
  };

  const ACHIEVEMENTS = [
    { id: 'first_win', title: 'First Win', desc: 'Beat any AI level for the first time', icon: '🏆' },
    { id: 'ten_wins', title: 'Rising Star', desc: 'Beat the AI 10 times', icon: '⭐' },
    { id: 'fifty_wins', title: 'Grandmaster', desc: 'Beat the AI 50 times', icon: '👑' },
    { id: 'impossible_draw', title: 'Impossible Survivor', desc: 'Secure a draw against the Impossible AI', icon: '🛡️' },
    { id: 'puzzle_novice', title: 'Puzzle Novice', desc: 'Solve 5 strategy puzzles', icon: '🧩' },
    { id: 'puzzle_master', title: 'Puzzle Master', desc: 'Solve 30 strategy puzzles', icon: '🧠' },
    { id: 'streak_3', title: 'Bronze Streak', desc: 'Maintain a 3-day daily challenge streak', icon: '🥉' },
    { id: 'streak_7', title: 'Silver Streak', desc: 'Maintain a 7-day daily challenge streak', icon: '🥈' }
  ];

  let stats = JSON.parse(localStorage.getItem('tictactoe_stats')) || { ...DEFAULT_STATS };

  // Sync missing structure if older stats exist
  stats.wins = { ...DEFAULT_STATS.wins, ...stats.wins };
  stats.losses = { ...DEFAULT_STATS.losses, ...stats.losses };
  stats.draws = { ...DEFAULT_STATS.draws, ...stats.draws };
  if (!stats.puzzlesSolved) stats.puzzlesSolved = [];
  if (!stats.dailyCompletedDates) stats.dailyCompletedDates = [];
  if (!stats.unlockedAchievements) stats.unlockedAchievements = [];

  const save = () => {
    localStorage.setItem('tictactoe_stats', JSON.stringify(stats));
  };

  const showAchievementModal = (achievement) => {
    // Check if modal containers are ready, otherwise deferred/logged
    const modalHtml = `
      <div id="achievement-toast" style="
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: rgba(22, 27, 34, 0.95);
        border: 2px solid var(--color-success);
        box-shadow: 0 0 20px var(--color-success-glow);
        padding: 15px 25px;
        border-radius: var(--border-radius-md);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 2000;
        animation: slideInUp 0.3s forwards, slideOutDown 0.3s 4.7s forwards;
      ">
        <span style="font-size: 2.2rem;">${achievement.icon}</span>
        <div>
          <h4 style="color: var(--color-success); margin: 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px;">Achievement Unlocked!</h4>
          <h3 style="margin: 3px 0 0 0; font-size: 1.1rem; color: var(--text-bright);">${achievement.title}</h3>
          <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">${achievement.desc}</p>
        </div>
      </div>
    `;

    // Inject styles for animation if needed
    if (!document.getElementById('ach-anim-styles')) {
      const styles = document.createElement('style');
      styles.id = 'ach-anim-styles';
      styles.innerHTML = `
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100px); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);
    
    // Play achievement audio
    if (window.AudioManager) {
      window.AudioManager.playAchievement();
    }

    setTimeout(() => {
      const toast = document.getElementById('achievement-toast');
      if (toast) toast.remove();
    }, 5000);
  };

  const triggerUnlock = (id) => {
    if (stats.unlockedAchievements.includes(id)) return;
    stats.unlockedAchievements.push(id);
    save();
    
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (achievement) {
      showAchievementModal(achievement);
    }
  };

  const checkAndUnlockAchievements = () => {
    const totalAiWins = Object.values(stats.wins).reduce((acc, curr) => acc + curr, 0) - stats.wins.local;
    
    if (totalAiWins >= 1) triggerUnlock('first_win');
    if (totalAiWins >= 10) triggerUnlock('ten_wins');
    if (totalAiWins >= 50) triggerUnlock('fifty_wins');

    if (stats.puzzlesSolved.length >= 5) triggerUnlock('puzzle_novice');
    if (stats.puzzlesSolved.length >= 30) triggerUnlock('puzzle_master');

    if (stats.bestDailyStreak >= 3) triggerUnlock('streak_3');
    if (stats.bestDailyStreak >= 7) triggerUnlock('streak_7');
  };

  return {
    getStats: () => stats,
    
    recordResult: (mode, difficulty, outcome) => {
      // mode: 'single' | 'local'
      // outcome: 'win' | 'lose' | 'draw'
      if (mode === 'local') {
        if (outcome === 'win') stats.wins.local++;
        if (outcome === 'draw') stats.draws.local++;
      } else {
        const diff = difficulty.toLowerCase();
        if (outcome === 'win') {
          stats.wins[diff]++;
        } else if (outcome === 'lose') {
          stats.losses[diff]++;
        } else {
          stats.draws[diff]++;
          if (diff === 'impossible') {
            triggerUnlock('impossible_draw');
          }
        }
      }
      save();
      checkAndUnlockAchievements();
    },

    recordPuzzleSolved: (puzzleId) => {
      if (!stats.puzzlesSolved.includes(puzzleId)) {
        stats.puzzlesSolved.push(puzzleId);
        save();
        checkAndUnlockAchievements();
      }
    },

    updateDailyStreak: (completedToday) => {
      const today = new Date().toISOString().split('T')[0];
      if (stats.dailyCompletedDates.includes(today)) return;

      stats.dailyCompletedDates.push(today);
      
      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (stats.dailyCompletedDates.includes(yesterdayStr)) {
        stats.dailyStreak++;
      } else {
        stats.dailyStreak = 1;
      }

      if (stats.dailyStreak > stats.bestDailyStreak) {
        stats.bestDailyStreak = stats.dailyStreak;
      }
      
      save();
      checkAndUnlockAchievements();
    },

    checkDailyChallengeStatus: () => {
      const today = new Date().toISOString().split('T')[0];
      return stats.dailyCompletedDates.includes(today);
    },

    isAchievementUnlocked: (id) => stats.unlockedAchievements.includes(id),

    getAchievementsList: () => {
      return ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: stats.unlockedAchievements.includes(a.id)
      }));
    },

    togglePremium: () => {
      stats.premiumActive = !stats.premiumActive;
      save();
      if (stats.premiumActive) {
        document.body.classList.add('premium-active');
      } else {
        document.body.classList.remove('premium-active');
      }
      return stats.premiumActive;
    },

    isPremium: () => stats.premiumActive,
    
    resetAllStats: () => {
      stats = { ...DEFAULT_STATS };
      save();
    }
  };
})();

// Export
window.StatsManager = StatsManager;
