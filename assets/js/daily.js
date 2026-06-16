const DailyChallenge = (() => {
  let todayPuzzle = null;
  let hasSolved = false;

  const getDailyPuzzle = () => {
    const puzzles = window.PuzzlesData.getAll();
    const today = new Date();
    
    // Hash based on YYYY-MM-DD
    const hash = today.getFullYear() * 397 + (today.getMonth() + 1) * 31 + today.getDate();
    const index = hash % puzzles.length;
    
    return puzzles[index];
  };

  const updateStreaksUI = () => {
    const stats = window.StatsManager.getStats();
    
    const currStreakElem = document.getElementById('daily-streak');
    const bestStreakElem = document.getElementById('best-streak');
    
    if (currStreakElem) currStreakElem.textContent = stats.dailyStreak;
    if (bestStreakElem) bestStreakElem.textContent = stats.bestDailyStreak;

    // Update badges
    const badgeBronze = document.getElementById('badge-bronze');
    const badgeSilver = document.getElementById('badge-silver');

    if (badgeBronze) {
      if (stats.bestDailyStreak >= 3) {
        badgeBronze.classList.add('unlocked');
        badgeBronze.querySelector('.badge-status').textContent = 'Unlocked';
      } else {
        badgeBronze.classList.remove('unlocked');
        badgeBronze.querySelector('.badge-status').textContent = '3 Day Streak';
      }
    }

    if (badgeSilver) {
      if (stats.bestDailyStreak >= 7) {
        badgeSilver.classList.add('unlocked');
        badgeSilver.querySelector('.badge-status').textContent = 'Unlocked';
      } else {
        badgeSilver.classList.remove('unlocked');
        badgeSilver.querySelector('.badge-status').textContent = '7 Day Streak';
      }
    }
  };

  const renderDailyBoard = () => {
    const boardElem = document.getElementById('daily-board');
    if (!boardElem) return;

    const isCompleted = window.StatsManager.checkDailyChallengeStatus();
    const completedContainer = document.getElementById('daily-completed-message');
    const gameContainer = document.getElementById('daily-game-container');

    if (isCompleted) {
      if (gameContainer) gameContainer.style.display = 'none';
      if (completedContainer) completedContainer.style.display = 'block';
      updateStreaksUI();
      return;
    }

    if (gameContainer) gameContainer.style.display = 'block';
    if (completedContainer) completedContainer.style.display = 'none';

    hasSolved = false;
    todayPuzzle = getDailyPuzzle();

    // Render level details
    document.getElementById('daily-title').textContent = todayPuzzle.title;
    document.getElementById('daily-difficulty').textContent = todayPuzzle.difficulty;
    document.getElementById('daily-difficulty').className = `badge badge-${todayPuzzle.difficulty}`;

    // Render board
    boardElem.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cellVal = todayPuzzle.board[i];
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.setAttribute('data-index', i);

      if (cellVal) {
        cell.classList.add(cellVal.toLowerCase());
        cell.textContent = cellVal;
        cell.setAttribute('disabled', 'true');
      } else {
        cell.addEventListener('click', () => makeDailyMove(i));
      }
      boardElem.appendChild(cell);
    }

    updateStreaksUI();
  };

  const makeDailyMove = (index) => {
    if (hasSolved) return;

    const boardElem = document.getElementById('daily-board');
    const clickedCell = boardElem.querySelector(`[data-index="${index}"]`);

    if (index === todayPuzzle.solution) {
      // CORRECT MOVE
      hasSolved = true;
      clickedCell.classList.add(todayPuzzle.turn.toLowerCase(), 'winner');
      clickedCell.textContent = todayPuzzle.turn;
      clickedCell.setAttribute('disabled', 'true');

      if (window.AudioManager) {
        if (todayPuzzle.turn === 'X') window.AudioManager.playX();
        else window.AudioManager.playO();
        setTimeout(() => window.AudioManager.playWin(), 200);
      }

      // Record daily challenge solved
      window.StatsManager.updateDailyStreak(true);

      // Open Success Modal
      setTimeout(() => {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        
        if (title) title.textContent = "Challenge Completed!";
        if (desc) desc.innerHTML = `
          <p style="margin-bottom: 12px; font-weight: 500;">Amazing job! You solved today's challenge.</p>
          <p style="font-size: 0.9rem; line-height: 1.4; color: var(--text-muted);">${todayPuzzle.explanation}</p>
        `;
        
        if (modal) modal.classList.add('open');
        
        // Setup rematch button to close modal and reload state
        const rematchBtn = document.getElementById('rematch-btn');
        if (rematchBtn) {
          rematchBtn.textContent = "Show Streak";
          const newBtn = rematchBtn.cloneNode(true);
          rematchBtn.parentNode.replaceChild(newBtn, rematchBtn);
          
          newBtn.addEventListener('click', () => {
            modal.classList.remove('open');
            renderDailyBoard(); // refresh to show completed message
          });
        }
      }, 700);
    } else {
      // INCORRECT MOVE
      clickedCell.classList.add(todayPuzzle.turn.toLowerCase(), 'incorrect');
      clickedCell.textContent = todayPuzzle.turn;

      if (window.AudioManager) {
        if (todayPuzzle.turn === 'X') window.AudioManager.playX();
        else window.AudioManager.playO();
        setTimeout(() => window.AudioManager.playLose(), 150);
      }

      clickedCell.style.animation = 'shake 0.3s';
      
      setTimeout(() => {
        clickedCell.classList.remove(todayPuzzle.turn.toLowerCase(), 'incorrect');
        clickedCell.textContent = '';
        clickedCell.removeAttribute('style');
        
        alert("Not quite the optimal strategic play. Think carefully about blocks and double attack traps! Try again!");
      }, 800);
    }
  };

  return {
    init: () => {
      renderDailyBoard();
    }
  };
})();

// Export
window.DailyChallenge = DailyChallenge;
