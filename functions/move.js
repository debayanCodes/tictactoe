const { win, emptyCheck } = require('./game-utils');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { row, col, gameState } = JSON.parse(event.body);
    if (!gameState || !gameState.active) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Game not active' })
      };
    }
    const board = gameState.ttt;
    if (board[row][col] !== ' ') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Cell already filled' })
      };
    }
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = gameState.sign;
    let newGameState = { ...gameState, ttt: newBoard };
    if (win(newBoard, gameState.sign)) {
      newGameState.active = false;
      newGameState.winner = gameState.players[gameState.current];
    } else if (!emptyCheck(newBoard)) {
      newGameState.active = false;
      newGameState.draw = true;
    } else {
      newGameState.sign = gameState.sign === 'X' ? 'O' : 'X';
      newGameState.current = 1 - gameState.current;
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        board: newGameState.ttt,
        active: newGameState.active,
        winner: newGameState.winner,
        draw: newGameState.draw || false,
        current: newGameState.current,
        sign: newGameState.sign
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid request' })
    };
  }
};
