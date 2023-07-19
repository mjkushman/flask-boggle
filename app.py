from boggle import Boggle
from flask import Flask, request, render_template, redirect, flash, jsonify, session
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config["SECRET_KEY"] = "mysecurepassword"

app.config["DEBUG_TB_INTERCEPT_REDIRECTS"] = False
debug = DebugToolbarExtension(app)  # instantiates toolbar

boggle_game = Boggle()
WORDS = boggle_game.read_dict("words.txt")  # a list of all possible words
scores = []

@app.route("/")
def show_home():
    # BOARD = session["board"]  # load board from session
    return render_template("index.html") #board=BOARD)


@app.route("/new-game")
def start_game():
    print("new game requested")
    BOARD = boggle_game.make_board()  # Create a new board
    session["board"] = BOARD  # store this board in session
    if session.get('game_number') == None:
        # print('game count evaluated None')
        session['game_number'] = 0
    return jsonify(BOARD)


@app.route("/submission/<submission>")
def handle_submission(submission):
    # print("sub received:", submission)
    BOARD = session["board"]

    # check against check_valid_word
    response = boggle_game.check_valid_word(
        BOARD, submission
    )  # expect 'not-on-board', 'not-word', or 'ok'

    return jsonify(response)

@app.route("/score/<int:points>")
def record_score(points):
    game_number = session['game_number'] +1
    if session.get('total_score'):
        score = int(session.get('total_score')) + points
    else:
        score = points
    session["total_score"] = score
    session['game_number'] = game_number
    scores.append(points)
    return {
        'total_score':score,
        'game_number':game_number,
        'scores':scores,
        'top_score':max(scores)
        }
