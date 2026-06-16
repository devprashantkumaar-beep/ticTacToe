const TicTacToe = (() => {
  let board = Array(9).fill(null);
  let currentTurn = 'X';
  let isGameOver = false;
  let gameMode = 'single'; // 'single' or 'local'
  let difficulty = 'medium'; // 'easy' | 'medium' | 'hard' | 'impossible'
  let scores = { X: 0, O: 0, draws: 0 };
  let winningPattern = null;

  const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = () => {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        winningPattern = pattern;
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
  };

  const handleAIMove = (renderCallback) => {
    if (isGameOver) return;
    
    // Set status to thinking
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = 'AI is thinking...';
    
    // Disable board clicks during AI turn
    document.getElementById('game-board').classList.add('ai-thinking');

    setTimeout(() => {
      const aiPlayer = 'O';
      const humanPlayer = 'X';
      const aiMove = window.GameAI.getMove(board, difficulty, aiPlayer, humanPlayer);

      if (aiMove !== null) {
        board[aiMove] = aiPlayer;
        if (window.AudioManager) window.AudioManager.playO();
        
        const result = checkWinner();
        if (result) {
          isGameOver = true;
          handleGameOver(result);
        } else {
          currentTurn = 'X';
          document.body.setAttribute('data-current-turn', currentTurn);
          if (statusText) statusText.textContent = "Your turn (X)";
        }
      }

      document.getElementById('game-board').classList.remove('ai-thinking');
      renderCallback();
    }, 600 + Math.random() * 400); // Realistic reaction delay
  };

  const handleGameOver = (result) => {
    const statusText = document.getElementById('status-text');
    const resultModal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    if (result === 'draw') {
      scores.draws++;
      if (statusText) statusText.textContent = "It's a draw!";
      if (modalTitle) modalTitle.textContent = "Draw Game!";
      if (modalDesc) modalDesc.textContent = "Great defense by both players.";
      if (window.AudioManager) window.AudioManager.playDraw();
      window.StatsManager.recordResult(gameMode, difficulty, 'draw');
    } else {
      scores[result]++;
      const winnerName = result === 'X' ? 'Player X' : 'Player O';
      if (statusText) statusText.textContent = `${winnerName} wins!`;

      if (gameMode === 'single') {
        if (result === 'X') {
          if (modalTitle) modalTitle.textContent = "Victory!";
          if (modalDesc) modalDesc.textContent = `You defeated the ${difficulty} AI.`;
          if (window.AudioManager) window.AudioManager.playWin();
          window.StatsManager.recordResult(gameMode, difficulty, 'win');
        } else {
          if (modalTitle) modalTitle.textContent = "Defeat!";
          if (modalDesc) modalDesc.textContent = `The ${difficulty} AI outsmarted you.`;
          if (window.AudioManager) window.AudioManager.playLose();
          window.StatsManager.recordResult(gameMode, difficulty, 'lose');
        }
      } else {
        if (modalTitle) modalTitle.textContent = `${winnerName} Wins!`;
        if (modalDesc) modalDesc.textContent = "Rematch to see who reigns supreme.";
        if (window.AudioManager) window.AudioManager.playWin();
        window.StatsManager.recordResult('local', null, 'win');
      }
    }

    updateScoreboard();
    
    // Open Modal after short delay
    setTimeout(() => {
      if (resultModal) resultModal.classList.add('open');
    }, 800);
  };

  const updateScoreboard = () => {
    const sx = document.getElementById('score-x');
    const so = document.getElementById('score-o');
    const sd = document.getElementById('score-draws');
    if (sx) sx.textContent = scores.X;
    if (so) so.textContent = scores.O;
    if (sd) sd.textContent = scores.draws;
  };

  return {
    init: (mode = 'single') => {
      gameMode = mode;
      board = Array(9).fill(null);
      currentTurn = 'X';
      isGameOver = false;
      winningPattern = null;
      document.body.setAttribute('data-current-turn', currentTurn);

      // Load settings
      const diffSelect = document.getElementById('difficulty-select');
      if (diffSelect) {
        difficulty = diffSelect.value;
        diffSelect.addEventListener('change', (e) => {
          difficulty = e.target.value;
          TicTacToe.resetGame();
        });
      }

      const boardElem = document.getElementById('game-board');
      if (boardElem) {
        boardElem.innerHTML = '';
        for (let i = 0; i < 9; i++) {
          const cell = document.createElement('button');
          cell.className = 'cell';
          cell.setAttribute('data-index', i);
          cell.setAttribute('aria-label', `Cell ${i + 1}, empty`);
          
          cell.addEventListener('click', () => TicTacToe.makeMove(i));
          boardElem.appendChild(cell);
        }
      }

      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) resetBtn.addEventListener('click', () => TicTacToe.resetGame());

      const rematchBtn = document.getElementById('rematch-btn');
      if (rematchBtn) {
        rematchBtn.addEventListener('click', () => {
          const resultModal = document.getElementById('result-modal');
          if (resultModal) resultModal.classList.remove('open');
          TicTacToe.resetGame();
        });
      }

      const statusText = document.getElementById('status-text');
      if (statusText) {
        statusText.textContent = gameMode === 'single' ? "Your turn (X)" : "Player X's turn";
      }

      updateScoreboard();
    },

    makeMove: (index) => {
      if (board[index] || isGameOver) return;

      // Single player restricts move input on AI's turn
      if (gameMode === 'single' && currentTurn !== 'X') return;

      board[index] = currentTurn;
      
      // Sound FX
      if (window.AudioManager) {
        if (currentTurn === 'X') window.AudioManager.playX();
        else window.AudioManager.playO();
      }

      TicTacToe.render();

      const result = checkWinner();
      if (result) {
        isGameOver = true;
        handleGameOver(result);
      } else {
        // Toggle turn
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        document.body.setAttribute('data-current-turn', currentTurn);

        const statusText = document.getElementById('status-text');
        if (gameMode === 'single') {
          handleAIMove(TicTacToe.render);
        } else {
          if (statusText) statusText.textContent = `Player ${currentTurn}'s turn`;
        }
      }
    },

    render: () => {
      const cells = document.querySelectorAll('.cell');
      cells.forEach((cell, idx) => {
        const value = board[idx];
        cell.className = 'cell'; // reset classes
        cell.removeAttribute('disabled');
        
        if (value) {
          cell.classList.add(value.toLowerCase());
          cell.textContent = value;
          cell.setAttribute('disabled', 'true');
          cell.setAttribute('aria-label', `Cell ${idx + 1}, occupied by ${value}`);
        } else {
          cell.textContent = '';
          cell.setAttribute('aria-label', `Cell ${idx + 1}, empty`);
        }

        // Highlight winning cells
        if (winningPattern && winningPattern.includes(idx)) {
          cell.classList.add('winner');
        }
      });
    },

    resetGame: () => {
      board = Array(9).fill(null);
      currentTurn = 'X';
      isGameOver = false;
      winningPattern = null;
      document.body.setAttribute('data-current-turn', currentTurn);
      
      const statusText = document.getElementById('status-text');
      if (statusText) {
        statusText.textContent = gameMode === 'single' ? "Your turn (X)" : "Player X's turn";
      }

      TicTacToe.render();
    },

    resetScores: () => {
      scores = { X: 0, O: 0, draws: 0 };
      updateScoreboard();
    }
  };
})();

// Export
window.TicTacToe = TicTacToe;
