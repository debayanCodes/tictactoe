exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
      players: ['', ''],
      current: 0,
      sign: 'X',
      toss: 0,
      active: false,
      winner: null,
      draw: false
    })
  };
};
