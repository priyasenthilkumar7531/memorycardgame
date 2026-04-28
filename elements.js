// getting all the html elements
const elements = {
  board: document.getElementById("board"),
  
  // buttons
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  continueBtn: document.getElementById("continueBtn"),
  restartBtn: document.getElementById("restartBtn"),
  
  // displays
  timer: document.getElementById("timer"),
  score: document.getElementById("score"),
  coins: document.getElementById("coins"),
  currentLevelDisplay: document.getElementById("currentLevelDisplay"),
  selectedLevelDisplay: document.getElementById("selectedLevelDisplay"),
  bestMoves: document.getElementById("bestMoves"),
  memoryRate: document.getElementById("memoryRate"),
  result: document.getElementById("result"),
  
  // popup
  continuePopup: document.getElementById("continuePopup"),
  remainingCards: document.getElementById("remainingCards"),
  popupCoins: document.getElementById("popupCoins"),
  
  // controls
  difficulty: document.getElementById("difficulty"),
  theme: document.getElementById("theme"),
  levelButtons: document.getElementById("levelButtons")
};

// update timer display
function updateTimerDisplay(time) {
  elements.timer.textContent = formatTime(time);
}

// update score
function updateScoreDisplay(moves, combo, stats) {
  elements.score.textContent = "Moves:" + moves + " | Combo:" + combo + " | Memory:" + stats.memory + " Miss:" + stats.miss;
}

// update coins and level
function updateCoinsDisplay(coins, currentLevel, bestMoves) {
  elements.coins.textContent = coins;
  elements.currentLevelDisplay.textContent = currentLevel;
  if (bestMoves == 0) {
    elements.bestMoves.textContent = "-";
  } else {
    elements.bestMoves.textContent = bestMoves;
  }
}

// update memory rate with color
function updateMemoryRateDisplay(cardsRemembered, cardsForgotten) {
  let totalTracked = cardsRemembered + cardsForgotten;
  let memoryRate = 0;
  if (totalTracked > 0) {
    memoryRate = (cardsRemembered / totalTracked) * 100;
  }
  
  elements.memoryRate.textContent = Math.round(memoryRate) + "%";
  
  // change color based on percentage
  if (memoryRate >= 75) {
    elements.memoryRate.style.color = "#4CAF50"; // green
  } else if (memoryRate >= 50) {
    elements.memoryRate.style.color = "#FFC107"; // yellow
  } else if (memoryRate >= 25) {
    elements.memoryRate.style.color = "#FF9800"; // orange
  } else if (totalTracked > 0) {
    elements.memoryRate.style.color = "#f44336"; // red
  } else {
    elements.memoryRate.style.color = "#4CAF50";
  }
}

// show result screen
function showResult(html) {
  elements.result.innerHTML = html;
  elements.result.style.display = "block";
}

// hide result screen
function hideResult() {
  elements.result.style.display = "none";
}

// show continue popup
function showContinuePopup() {
  elements.continuePopup.classList.add("show");
}

// hide continue popup
function hideContinuePopup() {
  elements.continuePopup.classList.remove("show");
}

// show temporary message
function showMessage(msg, duration) {
  if (!duration) duration = 1500;
  elements.score.textContent = msg;
  setTimeout(function() {
    render();
  }, duration);
}

// clear the board
function clearBoard() {
  elements.board.innerHTML = "";
}
