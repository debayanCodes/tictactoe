let backendUrl = '/.netlify/functions';
let gameState = null;

async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    alert('Server error. Please try again.');
    throw error;
  }
}

function renderBoard(board = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]) {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.textContent = board[i][j];
      cell.addEventListener('click', onCellClick);
      boardDiv.appendChild(cell);
    }
  }
}

async function updateState() {
  if (!gameState) {
    renderBoard();
    return;
  }
  renderBoard(gameState.ttt);
  const players = gameState.players || ["", ""];
  const currentPlayer = gameState.current || 0;
  const sign = gameState.sign || 'X';
  if (gameState.winner) {
    document.getElementById('result').textContent = `${gameState.winner} wins!! Thanks for playing!!`;
    document.getElementById('gameInfo').textContent = '';
    document.getElementById('resetBtn').style.display = 'inline-block';
  } else if (gameState.draw) {
    document.getElementById('result').textContent = `Draw!! Thanks for playing!!`;
    document.getElementById('gameInfo').textContent = '';
    document.getElementById('resetBtn').style.display = 'inline-block';
  } else if (gameState.active) {
    document.getElementById('gameInfo').textContent = `${players[currentPlayer]}'s turn (${sign})`;
    document.getElementById('result').textContent = '';
    document.getElementById('resetBtn').style.display = 'none';
  }
}

async function onCellClick(e) {
  if (!gameState || !gameState.active) return;
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  try {
    const data = await safeFetch(`${backendUrl}/move`, {
      method: 'POST',
      body: JSON.stringify({ row, col, gameState })
    });
    if (data.error) {
      alert(data.error);
      return;
    }
    gameState = {
      ttt: data.board,
      active: data.active,
      winner: data.winner,
      draw: data.draw,
      current: data.current,
      sign: data.sign,
      players: gameState.players
    };
    await updateState();
  } catch (error) {
    console.error('Failed to make move:', error);
  }
}

async function startGame() {
  try {
    const p1 = document.getElementById('player1').value.trim() || 'Player 1';
    const p2 = document.getElementById('player2').value.trim() || 'Player 2';
    const data = await safeFetch(`${backendUrl}/start`, {
      method: 'POST',
      body: JSON.stringify({ player1: p1, player2: p2 })
    });
    gameState = {
      ttt: data.board,
      players: data.players,
      current: data.current,
      sign: data.sign,
      toss: data.toss,
      active: data.active,
      winner: null,
      draw: false
    };
    renderBoard(data.board);
    document.getElementById('result').textContent = '';
    document.getElementById('resetBtn').style.display = 'none';
    document.querySelector('.player-inputs').style.display = 'none';
    document.getElementById('gameInfo').textContent = `${gameState.players[gameState.current]} won the toss, plays first with X`;
    setTimeout(() => {
      document.getElementById('gameInfo').textContent = `${gameState.players[gameState.current]}'s turn (${gameState.sign})`;
    }, 2000);
  } catch (error) {
    console.error('Failed to start game:', error);
    document.querySelector('.player-inputs').style.display = 'block';
  }
}

async function resetGame() {
  gameState = null;
  document.querySelector('.player-inputs').style.display = 'block';
  document.getElementById('result').textContent = '';
  document.getElementById('gameInfo').textContent = '';
  document.getElementById('resetBtn').style.display = 'none';
  renderBoard();
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initial render
renderBoard();
