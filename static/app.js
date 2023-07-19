const button = document.getElementById("submit-button");
const form = document.getElementById("form");
const formInput = document.querySelector('input[name="guess"]');
const responseMessage = {
  "not-word": "I don't recognize that word",
  ok: "Nice!",
  "not-on-board": "That word isn't on the board",
};
const responseDisplay = document.getElementById("response");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("startButton");
const gameDiv = document.getElementById("game"); // select the game section

let SCORE = 0;
let triedWords = [];

// add button click event listener
form.addEventListener("submit", function (e) {
  console.log("form submitted"); // REMOVE
  e.preventDefault(); //prevent the form from changing pages
  runSearchOnWord(formInput.value); //call the search function on the form input
  triedWords.push(formInput.value);
  formInput.value = "";
});

startButton.addEventListener("click", function (e) {
  console.log("new game started"); // REMOVE later
  triedWords = []; // empty out the list of tried words
  getNewGame(); //start a new game
  startTimer(); //start timer
});

async function runSearchOnWord(submission) {
  if (triedWords.includes(submission)) {
    alert("You tried that already!");
  } else {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/submission/${submission}`
      );
      // console.log("response is",response)

      let message = responseMessage[response.data]; //map the response to better messages
      // console.log(message)
      responseDisplay.innerText = message; //show the message on screen
      if (response.data == "ok") {
        addScore(submission);
      }
    } catch (e) {
      alert("Ran into an issue. Try again.");
    }
  }
  showScore();
}

async function getNewGame() {
  gameDiv.innerHTML = ""; //clear out any existing board
  SCORE = 0;
  const res = await axios.get("http://127.0.0.1:5000/new-game");
  console.log("res is ", res);
  let gameBoardResponse = res.data;
  console.log("gameboard:", gameBoardResponse);
  renderBoard(gameBoardResponse);
  //show submit form
  document.getElementById("form").style.display = "block";
}

function renderBoard(gameBoardResponse) {
  // For each row, create a div. For each letter, create a span.
  for (i of gameBoardResponse) {
    let row = document.createElement("div");
    for (j of i) {
      let cell = document.createElement("span");
      cell.innerText = j;
      row.append(cell);
    }
    gameDiv.append(row); // attach each row to the board
  }
  console.log("gameDiv:", gameDiv);
}

function addScore(submission) {
  SCORE += submission.length;
}

function showScore() {
  scoreDisplay.innerHTML = `<p>Your Score:\n${SCORE}</p>`;
}

function showFinalScore(topScore = 0, totalScore = 0) {
  scoreDisplay.innerHTML = `<p>Your score this game: ${SCORE}</p>
    <p>Your best score this session: ${topScore}</p>
    <p>Your cumulative score this session: ${totalScore}</p>`;
}

function startTimer() {
  let remaining = 13000;
  document.getElementById("timer").innerHTML = `<div>Time Remaining: ${
    remaining / 1000
  }</div>`;
  //start countount timer
  const timer = setInterval(function () {
    remaining -= 1000; //decrement time left by 1s
    document.getElementById("timer").innerHTML = `<div>Time Remaining: ${
      remaining / 1000
    }</div>`; //update the display on screen
    // If the timer has expired, clear the interval and t
    if (remaining <= 0) {
      clearInterval(timer);
      document.getElementById("timer").innerText = "Finished";
      form.style.display = "none"; //remove the submission form when finished.
      recordScore(SCORE);
    }
    // console.log('remaining lower:',remaining)
  }, 1000);
}

async function recordScore(SCORE) {
  // console.log('recording score')
  //todo: send axios request to a new route. pass the score
  const res = await axios.get(`http://127.0.0.1:5000/score/${SCORE}`);
  // console.log('score res is:',res)
  const { data } = res;
  showFinalScore(data.top_score, data.total_score);
}
