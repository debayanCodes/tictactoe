// Shared game logic utilities
function initGame(p1, p2) {
  return {
    ttt: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
    players: [p1, p2],
    toss: Math.floor(Math.random() * 2),
    current: Math.floor(Math.random() * 2),
    sign: 'X',
    active: true,
    winner: null,
    draw: false
  };
}

function win(board, sign) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === sign && board[i][1] === sign && board[i][2] === sign) {
      return true;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (board[0][i] === sign && board[1][i] === sign && board[2][i] === sign) {
      return true;
    }
  }
  if (board[0][0] === sign && board[1][1] === sign && board[2][2] === sign) {
    return true;
  }
  if (board[0][2] === sign && board[1][1] === sign && board[2][0] === sign) {
    return true;
  }
  return false;
}

function emptyCheck(board) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === ' ') {
        return true;
      }
    }
  }
  return false;
}

module.exports = { initGame, win, emptyCheck };
