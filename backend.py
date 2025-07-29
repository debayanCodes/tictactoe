from flask import Flask, request, jsonify, session
from flask_cors import CORS
import random


app = Flask(__name__)
app.secret_key = 'tictactoe_secret_key'
# Session cookie settings for local development
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
# Allow credentials and specify allowed origins (file:// is 'null' in browser, add your dev server if needed)
CORS(app, supports_credentials=True, origins=["null", "http://127.0.0.1:5500", "http://localhost:5500"])

def init_game(p1, p2):
    session['ttt'] = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]
    session['players'] = [p1, p2]
    session['toss'] = random.randint(0, 1)
    session['current'] = session['toss']
    session['sign'] = 'X'
    session['active'] = True
    session['winner'] = None
    session['draw'] = False

def win(sign):
    ttt = session['ttt']
    for i in range(3):
        if ttt[i][0] == sign and ttt[i][1] == sign and ttt[i][2] == sign:
            return True
        if ttt[0][i] == sign and ttt[1][i] == sign and ttt[2][i] == sign:
            return True
    if ttt[0][0] == sign and ttt[1][1] == sign and ttt[2][2] == sign:
        return True
    if ttt[0][2] == sign and ttt[1][1] == sign and ttt[2][0] == sign:
        return True
    return False

def empty_check():
    ttt = session['ttt']
    for i in range(3):
        for j in range(3):
            if ttt[i][j] == ' ':
                return True
    return False

@app.route('/start', methods=['POST'])
def start():
    data = request.json
    p1 = data.get('player1', 'Player 1')
    p2 = data.get('player2', 'Player 2')
    init_game(p1, p2)
    return jsonify({
        'board': session['ttt'],
        'players': session['players'],
        'current': session['current'],
        'sign': session['sign'],
        'toss': session['toss'],
        'active': session['active']
    })

@app.route('/move', methods=['POST'])
def move():
    if not session.get('active', False):
        return jsonify({'error': 'Game not active'}), 400
    data = request.json
    row = data['row']
    col = data['col']
    ttt = session['ttt']
    if ttt[row][col] != ' ':
        return jsonify({'error': 'Cell already filled'}), 400
    ttt[row][col] = session['sign']
    session['ttt'] = ttt
    if win(session['sign']):
        session['active'] = False
        session['winner'] = session['players'][session['current']]
    elif not empty_check():
        session['active'] = False
        session['draw'] = True
    else:
        session['sign'] = 'O' if session['sign'] == 'X' else 'X'
        session['current'] = 1 - session['current']
    return jsonify({
        'board': session['ttt'],
        'active': session['active'],
        'winner': session.get('winner'),
        'draw': session.get('draw', False),
        'current': session['current'],
        'sign': session['sign']
    })

@app.route('/state', methods=['GET'])
def state():
    return jsonify({
        'board': session.get('ttt', [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]),
        'players': session.get('players', ['', '']),
        'current': session.get('current', 0),
        'sign': session.get('sign', 'X'),
        'toss': session.get('toss', 0),
        'active': session.get('active', False),
        'winner': session.get('winner'),
        'draw': session.get('draw', False)
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000, threaded=True)
