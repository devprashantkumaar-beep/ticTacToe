const PuzzlesData = (() => {
  // 25 Core Seed Puzzles
  const SEED_PUZZLES = [
    // --- EASY ATTACK (WIN IN 1) ---
    {
      title: "Instant Victory",
      type: "attack",
      difficulty: "easy",
      board: ["X", "X", null, "O", "O", null, null, null, null],
      turn: "X",
      solution: 2,
      explanation: "Play in the empty top-right corner to complete the top row for a three-in-a-row win."
    },
    {
      title: "Diagonal Dash",
      type: "attack",
      difficulty: "easy",
      board: ["X", "O", null, null, "X", "O", null, null, null],
      turn: "X",
      solution: 8,
      explanation: "Playing in the bottom-right corner completes the main diagonal (0, 4, 8) for the win."
    },
    {
      title: "Column Crusher",
      type: "attack",
      difficulty: "easy",
      board: ["O", "X", null, null, "X", "O", "O", null, null],
      turn: "X",
      solution: 7,
      explanation: "Place your mark on the bottom row middle cell to complete the central column (1, 4, 7)."
    },
    {
      title: "Bottom Row Sweep",
      type: "attack",
      difficulty: "easy",
      board: ["O", null, "O", null, "O", "X", "X", "X", null],
      turn: "X",
      solution: 8,
      explanation: "Complete the bottom row (6, 7, 8) by marking the bottom-right cell."
    },
    {
      title: "Central Strike",
      type: "attack",
      difficulty: "easy",
      board: ["X", null, "O", null, null, null, "O", null, "X"],
      turn: "X",
      solution: 4,
      explanation: "Take the center cell to complete the diagonal line (0, 4, 8)."
    },

    // --- EASY DEFENSE (BLOCK IN 1) ---
    {
      title: "Emergency Block",
      type: "defense",
      difficulty: "easy",
      board: ["O", "O", null, "X", null, null, null, null, "X"],
      turn: "X",
      solution: 2,
      explanation: "O has two marks in the top row. Block the win by occupying the top-right corner."
    },
    {
      title: "Diagonal Defense",
      type: "defense",
      difficulty: "easy",
      board: [null, null, "O", null, "O", null, null, "X", "X"],
      turn: "X",
      solution: 6,
      explanation: "O is threatening to win along the diagonal (2, 4, 6). Block at index 6."
    },
    {
      title: "Vertical Gatekeeper",
      type: "defense",
      difficulty: "easy",
      board: ["X", "O", null, null, "O", null, "X", null, null],
      turn: "X",
      solution: 7,
      explanation: "Block O's vertical threat in the center column by claiming the bottom-center cell."
    },
    {
      title: "Right Side Check",
      type: "defense",
      difficulty: "easy",
      board: [null, "X", "O", null, null, "O", "X", null, null],
      turn: "X",
      solution: 8,
      explanation: "Stop O from scoring along the right-hand column by taking the bottom-right corner."
    },
    {
      title: "Left Column Guard",
      type: "defense",
      difficulty: "easy",
      board: ["O", null, null, null, "X", null, "O", null, "X"],
      turn: "X",
      solution: 3,
      explanation: "The left column is vulnerable. Play in the middle-left cell to block O's connection."
    },

    // --- MEDIUM STRATEGY / FORK ---
    {
      title: "Double Threat Creation",
      type: "fork",
      difficulty: "medium",
      board: ["X", null, null, null, "O", null, null, null, "X"],
      turn: "X",
      solution: 2,
      explanation: "Playing in the top-right corner (index 2) creates a double win threat: row 0 (0,1,2) and column 2 (2,5,8). O can only block one."
    },
    {
      title: "Center Trap Setup",
      type: "fork",
      difficulty: "medium",
      board: ["O", null, null, null, "X", null, null, null, "X"],
      turn: "X",
      solution: 2,
      explanation: "Claiming the top-right corner establishes a diagonal threat and a corner-side link, forcing a win on the next turn."
    },
    {
      title: "Wing Fork Tactics",
      type: "fork",
      difficulty: "medium",
      board: [null, "X", null, null, "O", "X", "O", null, null],
      turn: "X",
      solution: 2,
      explanation: "Take the top-right corner. It connects with your other marks to build double overlapping threats."
    },
    {
      title: "Opponent Block Counter",
      type: "fork",
      difficulty: "medium",
      board: ["X", "O", null, null, "X", null, null, null, "O"],
      turn: "X",
      solution: 8,
      explanation: "Playing index 8 completes the diagonal setup while creating a secondary threat on row 2."
    },
    {
      title: "Corner Bind",
      type: "fork",
      difficulty: "medium",
      board: ["O", null, "X", null, "X", null, null, null, "O"],
      turn: "X",
      solution: 6,
      explanation: "Claim index 6 (bottom-left). O is forced into a defensive corner where you can seal a second line."
    },

    // --- MEDIUM DEFENSE (BLOCK FORKS) ---
    {
      title: "Fork Defuser",
      type: "defense",
      difficulty: "medium",
      board: ["O", null, null, null, "X", null, null, null, "O"],
      turn: "X",
      solution: 1,
      explanation: "O has opposite corners. Playing an edge like index 1 forces O to block, defusing the diagonal double-threat trap."
    },
    {
      title: "Edge Bind Block",
      type: "defense",
      difficulty: "medium",
      board: [null, "O", null, "O", "X", null, null, null, null],
      turn: "X",
      solution: 0,
      explanation: "Stop O from building a side-cell fork trap by claiming the top-left corner yourself."
    },
    {
      title: "Evasive Maneuvers",
      type: "defense",
      difficulty: "medium",
      board: [null, null, "O", null, "X", "O", null, null, null],
      turn: "X",
      solution: 8,
      explanation: "O is preparing a right-side hook. Play in the bottom-right corner to stop their momentum."
    },
    {
      title: "Apex Block",
      type: "defense",
      difficulty: "medium",
      board: ["O", null, null, "X", "O", null, null, null, null],
      turn: "X",
      solution: 8,
      explanation: "Prevent O from expanding their main diagonal by anchoring the bottom-right corner."
    },
    {
      title: "Center Cross Halt",
      type: "defense",
      difficulty: "medium",
      board: [null, "O", null, null, "X", null, null, "O", null],
      turn: "X",
      solution: 3,
      explanation: "Play index 3. This edge play forces O to defend, preventing them from securing corner control."
    },

    // --- HARD STRATEGY (ADVANCED PATTERNS) ---
    {
      title: "The Golden Fork",
      type: "fork",
      difficulty: "hard",
      board: ["X", null, null, null, "O", "O", null, null, "X"],
      turn: "X",
      solution: 2,
      explanation: "Placing a mark in the corner (index 2) triggers a double win alignment that bypasses O's defense."
    },
    {
      title: "Three-Way Trap",
      type: "fork",
      difficulty: "hard",
      board: ["O", null, "X", null, "X", null, "O", null, null],
      turn: "X",
      solution: 5,
      explanation: "Secure index 5. This sets up threats across multiple vectors which O is mathematically incapable of blocking."
    },
    {
      title: "Impossible Escape",
      type: "defense",
      difficulty: "hard",
      board: [null, "O", null, null, "X", "O", "X", null, null],
      turn: "X",
      solution: 2,
      explanation: "This is a complex defensive state. Occupying the top-right corner blocks O's multi-fork."
    },
    {
      title: "Center Fork Block",
      type: "defense",
      difficulty: "hard",
      board: [null, null, "O", "O", "X", null, null, null, null],
      turn: "X",
      solution: 0,
      explanation: "O's L-shape setup is dangerous. Anchor at index 0 to neutralize their options."
    },
    {
      title: "Endgame Clinch",
      type: "attack",
      difficulty: "hard",
      board: ["X", "O", "O", null, "X", null, null, null, null],
      turn: "X",
      solution: 8,
      explanation: "Complete the diagonal for an elegant checkmate victory."
    }
  ];

  // Geometric Transformations
  const TRANSFORMS = [
    // 1. Identity (no change)
    { name: "A", map: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    // 2. Rotate 90 CW
    { name: "B", map: [6, 3, 0, 7, 4, 1, 8, 5, 2] },
    // 3. Rotate 180
    { name: "C", map: [8, 7, 6, 5, 4, 3, 2, 1, 0] },
    // 4. Rotate 270 CW
    { name: "D", map: [2, 5, 8, 1, 4, 7, 0, 3, 6] },
    // 5. Flip Horizontally
    { name: "E", map: [2, 1, 0, 5, 4, 3, 8, 7, 6] }
  ];

  // Generate the database of 120+ puzzles (25 seeds * 5 transforms)
  const generatePuzzles = () => {
    const list = [];
    let idCounter = 1;

    SEED_PUZZLES.forEach((seed, seedIdx) => {
      TRANSFORMS.forEach((trans) => {
        // Transform the board array
        const newBoard = trans.map.map(origIdx => seed.board[origIdx]);
        
        // Find transformed solution index
        const newSolution = trans.map.indexOf(seed.solution);

        list.push({
          id: idCounter++,
          title: `${seed.title} (${trans.name})`,
          type: seed.type,
          difficulty: seed.difficulty,
          board: newBoard,
          turn: seed.turn,
          solution: newSolution,
          explanation: seed.explanation
        });
      });
    });

    return list;
  };

  const puzzles = generatePuzzles();

  return {
    getAll: () => puzzles,
    getById: (id) => puzzles.find(p => p.id === parseInt(id)),
    getByDifficulty: (diff) => puzzles.filter(p => p.difficulty === diff.toLowerCase()),
    getByType: (type) => puzzles.filter(p => p.type === type.toLowerCase())
  };
})();

// Export
window.PuzzlesData = PuzzlesData;
