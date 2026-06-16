const PuzzleApp = (() => {
  let currentPuzzle = null;
  let hasSolved = false;

  const initLibrary = () => {
    const listContainer = document.getElementById('puzzles-list');
    if (!listContainer) return;

    const stats = window.StatsManager.getStats();
    const puzzles = window.PuzzlesData.getAll();

    const renderList = (filterType = 'all', filterDiff = 'all') => {
      listContainer.innerHTML = '';
      
      const filtered = puzzles.filter(p => {
        const typeMatch = filterType === 'all' || p.type === filterType;
        const diffMatch = filterDiff === 'all' || p.difficulty === filterDiff;
        return typeMatch && diffMatch;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No puzzles matching filters.</p>';
        return;
      }

      filtered.forEach(p => {
        const solved = stats.puzzlesSolved.includes(p.id);
        const card = document.createElement('a');
        card.href = `puzzle.html?id=${p.id}`;
        card.className = `card puzzle-item ${solved ? 'solved' : ''}`;
        card.style.padding = '20px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '8px';

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge badge-${p.difficulty}" style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">${p.difficulty}</span>
            <span class="badge badge-${p.type}" style="font-size: 0.7rem; font-weight: 500; opacity: 0.8;">${p.type}</span>
          </div>
          <h3 style="font-size: 1.1rem; margin: 5px 0;">${p.title}</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; font-size: 0.85rem;">
            <span style="color: ${solved ? 'var(--color-success)' : 'var(--text-muted)'}; font-weight: 500;">
              ${solved ? '✓ Solved' : 'Play Now'}
            </span>
            <span style="color: var(--text-muted);">Level ${p.id}</span>
          </div>
        `;
        listContainer.appendChild(card);
      });
    };

    // Bind Filter Buttons
    const typeFilters = document.querySelectorAll('[data-filter-type]');
    const diffFilters = document.querySelectorAll('[data-filter-diff]');
    let currentType = 'all';
    let currentDiff = 'all';

    typeFilters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        typeFilters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentType = e.target.getAttribute('data-filter-type');
        renderList(currentType, currentDiff);
      });
    });

    diffFilters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        diffFilters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentDiff = e.target.getAttribute('data-filter-diff');
        renderList(currentType, currentDiff);
      });
    });

    renderList();
  };

  const initSolver = () => {
    const boardElem = document.getElementById('puzzle-board');
    if (!boardElem) return;

    // Parse URL parameter
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 1;
    currentPuzzle = window.PuzzlesData.getById(id);

    if (!currentPuzzle) {
      alert("Puzzle not found!");
      window.location.href = 'puzzle-library.html';
      return;
    }

    hasSolved = false;

    // Render text data
    document.getElementById('puzzle-title').textContent = currentPuzzle.title;
    document.getElementById('puzzle-level-num').textContent = `Puzzle #${currentPuzzle.id}`;
    
    const diffBadge = document.getElementById('puzzle-difficulty');
    diffBadge.textContent = currentPuzzle.difficulty;
    diffBadge.className = `badge badge-${currentPuzzle.difficulty}`;
    
    document.getElementById('puzzle-desc').textContent = `It is ${currentPuzzle.turn}'s turn. Find the optimal move!`;

    // Render board
    boardElem.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cellVal = currentPuzzle.board[i];
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.setAttribute('data-index', i);

      if (cellVal) {
        cell.classList.add(cellVal.toLowerCase());
        cell.textContent = cellVal;
        cell.setAttribute('disabled', 'true');
      } else {
        cell.addEventListener('click', () => makePuzzleMove(i));
      }
      boardElem.appendChild(cell);
    }

    // Bind next/back links
    const nextBtn = document.getElementById('next-puzzle-btn');
    if (nextBtn) {
      if (id < window.PuzzlesData.getAll().length) {
        nextBtn.href = `puzzle.html?id=${id + 1}`;
        nextBtn.style.display = 'inline-flex';
      } else {
        nextBtn.style.display = 'none';
      }
    }

    // Recommendation links
    const recContainer = document.getElementById('related-puzzles');
    if (recContainer) {
      recContainer.innerHTML = '';
      const related = window.PuzzlesData.getAll()
        .filter(p => p.id !== id && p.difficulty === currentPuzzle.difficulty)
        .slice(0, 3);
      
      related.forEach(rp => {
        const item = document.createElement('a');
        item.href = `puzzle.html?id=${rp.id}`;
        item.className = 'nav-link';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = 'var(--border-radius-sm)';
        item.style.padding = '8px 12px';
        item.style.textAlign = 'center';
        item.textContent = `${rp.title.split(' (')[0]} (#${rp.id})`;
        recContainer.appendChild(item);
      });
    }

    // Bind Modal action
    const solvedRematchBtn = document.getElementById('rematch-btn');
    if (solvedRematchBtn) {
      solvedRematchBtn.addEventListener('click', () => {
        const modal = document.getElementById('result-modal');
        if (modal) modal.classList.remove('open');
        initSolver(); // reload
      });
    }
  };

  const makePuzzleMove = (index) => {
    if (hasSolved) return;

    const boardElem = document.getElementById('puzzle-board');
    const clickedCell = boardElem.querySelector(`[data-index="${index}"]`);

    if (index === currentPuzzle.solution) {
      // CORRECT MOVE
      hasSolved = true;
      clickedCell.classList.add(currentPuzzle.turn.toLowerCase(), 'winner');
      clickedCell.textContent = currentPuzzle.turn;
      clickedCell.setAttribute('disabled', 'true');

      if (window.AudioManager) {
        if (currentPuzzle.turn === 'X') window.AudioManager.playX();
        else window.AudioManager.playO();
        setTimeout(() => window.AudioManager.playWin(), 200);
      }

      // Record solver progress
      window.StatsManager.recordPuzzleSolved(currentPuzzle.id);

      // Open Success Modal
      setTimeout(() => {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        
        if (title) title.textContent = "Correct!";
        if (desc) desc.innerHTML = `
          <p style="margin-bottom: 12px; font-weight: 500;">You solved the puzzle!</p>
          <p style="font-size: 0.9rem; line-height: 1.4; color: var(--text-muted);">${currentPuzzle.explanation}</p>
        `;
        if (modal) modal.classList.add('open');
      }, 700);
    } else {
      // INCORRECT MOVE
      clickedCell.classList.add(currentPuzzle.turn.toLowerCase(), 'incorrect');
      clickedCell.textContent = currentPuzzle.turn;
      
      // Play lose audio tone
      if (window.AudioManager) {
        if (currentPuzzle.turn === 'X') window.AudioManager.playX();
        else window.AudioManager.playO();
        setTimeout(() => window.AudioManager.playLose(), 150);
      }

      // Shake effect or feedback
      clickedCell.style.animation = 'shake 0.3s';
      
      setTimeout(() => {
        clickedCell.classList.remove(currentPuzzle.turn.toLowerCase(), 'incorrect');
        clickedCell.textContent = '';
        clickedCell.removeAttribute('style');
        
        alert("Not quite the optimal move! Think defensively or seek direct double attacks. Try again!");
      }, 800);
    }
  };

  return {
    init: () => {
      initLibrary();
      initSolver();
    }
  };
})();

// Export
window.PuzzleApp = PuzzleApp;
