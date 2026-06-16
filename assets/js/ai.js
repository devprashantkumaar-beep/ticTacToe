const GameAI = (() => {
  // Check if a player has won the given board state
  const checkWinner = (board, player) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return winPatterns.some(pattern => 
      pattern.every(index => board[index] === player)
    );
  };

  // Check if the board is full
  const isBoardFull = (board) => {
    return board.every(cell => cell !== null);
  };

  // Get list of empty indices
  const getEmptyCells = (board) => {
    return board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  };

  // Easy AI: Selects a random empty cell
  const getEasyMove = (board) => {
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  };

  // Medium AI: Checks for immediate wins/blocks, then center, then random corners, then edge
  const getMediumMove = (board, aiPlayer, humanPlayer) => {
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) return null;

    // 1. Check if AI can win in this move
    for (const cell of emptyCells) {
      const tempBoard = [...board];
      tempBoard[cell] = aiPlayer;
      if (checkWinner(tempBoard, aiPlayer)) {
        return cell;
      }
    }

    // 2. Check if Human can win in their next move and block them
    for (const cell of emptyCells) {
      const tempBoard = [...board];
      tempBoard[cell] = humanPlayer;
      if (checkWinner(tempBoard, humanPlayer)) {
        return cell;
      }
    }

    // 3. Take the center if available
    if (emptyCells.includes(4)) {
      return 4;
    }

    // 4. Take a corner if available
    const corners = [0, 2, 6, 8].filter(c => emptyCells.includes(c));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Take whatever is left
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  // Minimax Scoring Algorithm
  const minimax = (board, depth, isMaximizing, aiPlayer, humanPlayer) => {
    if (checkWinner(board, aiPlayer)) return 10 - depth;
    if (checkWinner(board, humanPlayer)) return depth - 10;
    if (isBoardFull(board)) return 0;

    const emptyCells = getEmptyCells(board);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const cell of emptyCells) {
        board[cell] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
        board[cell] = null;
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const cell of emptyCells) {
        board[cell] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
        board[cell] = null;
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  };

  // Impossible AI: Full Minimax search
  const getImpossibleMove = (board, aiPlayer, humanPlayer) => {
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) return null;

    // Fast-path for empty board: playing center is best
    if (emptyCells.length === 9) {
      return 4; // Center
    }

    let bestScore = -Infinity;
    let bestMove = null;

    for (const cell of emptyCells) {
      board[cell] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer);
      board[cell] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }

    return bestMove;
  };

  // Hard AI: 75% Minimax, 25% Medium AI moves
  const getHardMove = (board, aiPlayer, humanPlayer) => {
    if (Math.random() > 0.25) {
      return getImpossibleMove(board, aiPlayer, humanPlayer);
    } else {
      return getMediumMove(board, aiPlayer, humanPlayer);
    }
  };

  return {
    getMove: (board, difficulty, aiPlayer, humanPlayer) => {
      switch (difficulty.toLowerCase()) {
        case 'easy':
          return getEasyMove(board);
        case 'medium':
          return getMediumMove(board, aiPlayer, humanPlayer);
        case 'hard':
          return getHardMove(board, aiPlayer, humanPlayer);
        case 'impossible':
          return getImpossibleMove(board, aiPlayer, humanPlayer);
        default:
          return getEasyMove(board);
      }
    }
  };
})();

// Export
window.GameAI = GameAI;
