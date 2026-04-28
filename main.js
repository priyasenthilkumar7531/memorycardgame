// main game logic

// game variables
let cards = [];
let flipped = [];
let lock = false;
let moves = 0;
let timerInterval = null;
let timeLeft = 0;
let initialTime = 0;
let stats = { memory: 0, miss: 0 };
let gameActive = false;
let currentDifficulty = 'easy';
let currentLevel = 1;
let coins = parseInt(localStorage.getItem(STORAGE_KEYS.COINS)) || 0;
let totalMatches = 0;
let totalAttempts = 0;
let seenCards = {};
let cardsRemembered = 0;
let cardsForgotten = 0;
let lastGameStats = { moves: 0, timeUsed: 0, memory: 0, miss: 0 };
let combo = 0;
let lastClickTime = 0;
let imageCache = {};

// event listeners
elements.startBtn.onclick = startGame;
elements.resetBtn.onclick = resetGame;
elements.continueBtn.onclick = continueWithRemaining;
elements.restartBtn.onclick = restartLevel;
elements.difficulty.onchange = function() {
  currentDifficulty = elements.difficulty.value;
  currentLevel = 1;
  generateLevelButtons();
  selectLevel(1);
};

// initialize the game when page loads
generateLevelButtons();
selectLevel(1);
preloadImages();
initializeGame();

// create level buttons
function generateLevelButtons() {
  elements.levelButtons.innerHTML = '';
  let config = DIFFICULTY_CONFIG[currentDifficulty];
  
  for (let i = 1; i <= 3; i++) {
    let btn = document.createElement('button');
    btn.className = 'level-btn';
    if (i == currentLevel) {
      btn.className += ' active';
    }
    
    let levelTime = calculateLevelTime(currentDifficulty, i);
    let cardCount = calculateCardCount(currentDifficulty, i);
    
    btn.innerHTML = i + '<br><small>' + cardCount + ' cards</small><br><small>⏱️ ' + levelTime + 's</small>';
    
    // using let to preserve the value
    let levelNum = i;
    btn.onclick = function() {
      selectLevel(levelNum);
    };
    
    elements.levelButtons.appendChild(btn);
  }
}

// select a level
function selectLevel(level) {
  currentLevel = level;
  elements.selectedLevelDisplay.textContent = level;
  
  // update active button
  let buttons = document.querySelectorAll('.level-btn');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  buttons[level - 1].classList.add('active');
}

// preload all images
function preloadImages() {
  let allUrls = [];
  // get all images from all themes
  for (let theme in THEMES) {
    allUrls = allUrls.concat(THEMES[theme]);
  }
  
  for (let i = 0; i < allUrls.length; i++) {
    let url = allUrls[i];
    if (!imageCache[url] && isImageUrl(url)) {
      let img = new Image();
      img.onload = function() {
        console.log('Loaded image');
      };
      img.src = url;
      imageCache[url] = img;
    }
  }
}

// start the game
function startGame() {
  hideResult();
  
  let cardCount = calculateCardCount(currentDifficulty, currentLevel);
  let timerDuration = calculateLevelTime(currentDifficulty, currentLevel);
  let themeName = elements.theme.value;
  
  // get card values and create pairs
  let cardValues = generateCardValues(themeName, cardCount);
  
  // create card objects
  cards = [];
  for (let i = 0; i < cardValues.length; i++) {
    cards.push(createCardObject(i, cardValues[i]));
  }
  
  // shuffle the cards
  shuffle(cards);
  
  // reset everything
  resetGameState();
  initialTime = timerDuration;
  
  // setup the board
  setupGrid(cardCount);
  clearBoard();
  
  // create divs for cards
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let div = document.createElement("div");
    div.className = "card";
    div.id = "card-" + card.id;
    
    // closure to keep reference to card
    (function(c) {
      div.onclick = function() {
        clickCard(c);
      };
    })(card);
    
    elements.board.appendChild(div);
  }
  
  updateMemoryRateDisplay(cardsRemembered, cardsForgotten);
  
  // preview - show all cards for 2 seconds
  for (let i = 0; i < cards.length; i++) {
    cards[i].isFlipped = true;
  }
  render();
  
  // after 2 seconds hide cards and start game
  setTimeout(function() {
    for (let i = 0; i < cards.length; i++) {
      cards[i].isFlipped = false;
    }
    render();
    gameActive = true; // now player can click
    startTimer(timerDuration);
    updateUI();
    
    console.log('Game started:', currentDifficulty, 'Level', currentLevel);
  }, GAME_CONSTANTS.PREVIEW_DURATION);
}

// reset game state
function resetGameState() {
  moves = 0;
  stats = { memory: 0, miss: 0 };
  totalMatches = 0;
  totalAttempts = 0;
  seenCards = {};
  cardsRemembered = 0;
  cardsForgotten = 0;
  combo = 0;
  lastGameStats = { moves: 0, timeUsed: 0, memory: 0, miss: 0 };
  gameActive = false;
  flipped = [];
  lock = false;
}

// render the board
function render() {
  clearBoard();
  
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let div = document.createElement("div");
    div.className = "card";
    div.id = "card-" + card.id;
    
    if (card.isFlipped || card.isMatched) {
      div.classList.add("flipped");
      renderCardContent(div, card);
    }
    
    if (card.isMatched) {
      div.classList.add("hide");
    }
    
    (function(c) {
      div.onclick = function() {
        clickCard(c);
      };
    })(card);
    
    elements.board.appendChild(div);
  }
  
  updateScoreDisplay(moves, combo, stats);
  updateMemoryRateDisplay(cardsRemembered, cardsForgotten);
}

// render card content
function renderCardContent(div, card) {
  if (isImageUrl(card.value)) {
    // its an image
    let img;
    if (imageCache[card.value]) {
      img = imageCache[card.value].cloneNode();
    } else {
      img = new Image();
    }
    img.src = card.value;
    
    // if image fails to load
    img.onerror = function() {
      this.style.display = 'none';
      div.innerHTML = '<span class="emoji-card">❌</span>';
    };
    
    div.innerHTML = "";
    div.appendChild(img);
  } else {
    // its an emoji
    div.innerHTML = '<span class="emoji-card">' + card.value + '</span>';
  }
}

// update single card ui
function updateCardUI(card) {
  let div = document.getElementById("card-" + card.id);
  if (!div) return;
  
  div.className = "card";
  div.id = "card-" + card.id;
  
  if (card.isFlipped || card.isMatched) {
    div.classList.add("flipped");
    renderCardContent(div, card);
  } else {
    div.innerHTML = "";
  }
  
  if (card.isMatched) {
    div.classList.add("hide");
  }
  
  updateScoreDisplay(moves, combo, stats);
  updateMemoryRateDisplay(cardsRemembered, cardsForgotten);
}
// click on a card
function clickCard(card) {
  // prevent fast clicking
  let now = Date.now();
  if (now - lastClickTime < GAME_CONSTANTS.CLICK_THROTTLE) return;
  lastClickTime = now;
  
  // check if can click
  if (lock || card.isFlipped || card.isMatched || !gameActive) return;
  
  // flip the card
  card.isFlipped = true;
  card.seen++;
  
  // track seen cards
  if (!seenCards[card.value]) {
    seenCards[card.value] = new Set();
  }
  seenCards[card.value].add(card.id);
  
  flipped.push(card);
  updateCardUI(card);
  saveGame();
  
  // if 2 cards flipped check for match
  if (flipped.length == 2) {
    moves++;
    totalAttempts++;
    check();
  }
}

// check if cards match
async function check() {
  let a = flipped[0];
  let b = flipped[1];
  lock = true;
  
  let seenBefore = false;
  if (seenCards[a.value] && seenCards[a.value].size >= 2) {
    seenBefore = true;
  }
  
  if (a.value == b.value) {
    // MATCH!
    await handleMatch(a, b, seenBefore);
  } else {
    // no match
    await handleMismatch(a, b);
  }
  
  flipped = [];
  lock = false;
  saveGame();
}

// handle matching cards
async function handleMatch(a, b, seenBefore) {
  totalMatches++;
  combo++;
  let bonus = combo * GAME_CONSTANTS.COMBO_BONUS_MULTIPLIER;
  coins += bonus;
  
  if (seenBefore) {
    stats.memory++;
    cardsRemembered++;
  } else {
    stats.miss++;
    cardsForgotten++;
  }
  
  await wait(GAME_CONSTANTS.MATCH_DELAY);
  
  a.isMatched = true;
  b.isMatched = true;
  
  updateCardUI(a);
  updateCardUI(b);
  
  checkWin();
}

// handle mismatch
async function handleMismatch(a, b) {
  combo = 0; // reset combo
  
  if (a.seen > 1 || b.seen > 1) {
    stats.miss++;
    cardsForgotten++;
  }
  
  await wait(GAME_CONSTANTS.MISMATCH_DELAY);
  
  a.isFlipped = false;
  b.isFlipped = false;
  
  updateCardUI(a);
  updateCardUI(b);
}

// check if player won
function checkWin() {
  // check if all cards matched
  let allMatched = true;
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].isMatched) {
      allMatched = false;
      break;
    }
  }
  
  if (!allMatched) return;
  
  clearInterval(timerInterval);
  gameActive = false;
  
  // save stats
  lastGameStats.moves = moves;
  lastGameStats.timeUsed = initialTime - timeLeft;
  lastGameStats.memory = stats.memory;
  lastGameStats.miss = stats.miss;
  
  // calculate coins
  let coinsEarned = calculateCoinsEarned(timeLeft, cardsRemembered, currentLevel);
  coins += coinsEarned;
  localStorage.setItem(STORAGE_KEYS.COINS, coins);
  
  // adjust difficulty
  adjustDifficulty();
  
  // show result
  let bestMoves = updateBestScore();
  let memoryRate = calculateMemoryRate(cardsRemembered, cardsForgotten);
  
  let html = '<h2>🎉 Level ' + currentLevel + ' Complete!</h2>';
  html += '<p><strong>Difficulty:</strong> ' + currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1) + '</p>';
  html += '<p><strong>Time Used:</strong> ' + formatTime(lastGameStats.timeUsed) + '</p>';
  html += '<p><strong>Moves:</strong> ' + lastGameStats.moves + '</p>';
  html += '<p><strong>Memory:</strong> ' + lastGameStats.memory + ' | <strong>Miss:</strong> ' + lastGameStats.miss + '</p>';
  html += '<p><strong>Best Combo:</strong> ' + combo + '</p>';
  html += '<p>🏆 <strong>Best Moves:</strong> ' + bestMoves + ' | <strong>Memory Rate:</strong> ' + Math.round(memoryRate) + '%</p>';
  html += '<hr style="margin: 15px 0; border: 1px solid rgba(255,255,255,0.3);">';
  html += '<h3>💰 Coins Earned: ' + coinsEarned + '</h3>';
  html += '<p style="font-size: 12px; opacity: 0.8;">Base: 50 | Time: ' + Math.floor(timeLeft / 10) + ' | Memory: ' + (cardsRemembered * 5) + ' | Level: ' + (currentLevel * 10) + '</p>';
  html += '<p><strong>Total Coins:</strong> ' + coins + '</p>';
  html += '<button onclick="nextLevel()" style="margin-top: 15px; padding: 12px 24px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer;">🎮 Next Level</button>';
  html += '<button onclick="resetGame()" style="margin-top: 10px; padding: 10px 20px; font-size: 14px; background: linear-gradient(135deg, #f44336, #d32f2f); color: white; border: none; border-radius: 8px; cursor: pointer;">🔄 Reset Game</button>';
  
  showResult(html);
  saveGame();
}

// next level
function nextLevel() {
  // auto progress through difficulties
  if (currentDifficulty == 'easy' && currentLevel == 3) {
    currentDifficulty = 'medium';
    currentLevel = 1;
    showMessage('🎯 Advancing to Medium difficulty!');
  } else if (currentDifficulty == 'medium' && currentLevel == 3) {
    currentDifficulty = 'hard';
    currentLevel = 1;
    showMessage('🔥 Advancing to Hard difficulty!');
  } else {
    currentLevel++;
    if (currentLevel > 3) currentLevel = 1;
  }
  
  elements.difficulty.value = currentDifficulty;
  generateLevelButtons();
  selectLevel(currentLevel);
  startGame();
}

// adjust difficulty based on performance
function adjustDifficulty() {
  let memoryRate = calculateMemoryRate(cardsRemembered, cardsForgotten);
  
  if (memoryRate > GAME_CONSTANTS.ADAPTIVE_HIGH_THRESHOLD && currentLevel < 3) {
    currentLevel++;
    showMessage('🎯 Great memory! Advanced to Level ' + currentLevel + '!');
  } else if (memoryRate < GAME_CONSTANTS.ADAPTIVE_LOW_THRESHOLD && currentLevel > 1) {
    currentLevel--;
    showMessage('📉 Level adjusted to ' + currentLevel + ' for better experience');
  }
  
  elements.currentLevelDisplay.textContent = currentLevel;
  generateLevelButtons();
  selectLevel(currentLevel);
}

// timer
function startTimer(duration) {
  clearInterval(timerInterval);
  
  if (duration) {
    timeLeft = duration;
  } else {
    timeLeft = initialTime;
  }
  
  updateTimerDisplay(timeLeft);
  
  timerInterval = setInterval(function() {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      reshuffleRemaining();
    }
    
    saveGame();
  }, 1000);
}

// time ran out
function reshuffleRemaining() {
  clearInterval(timerInterval);
  gameActive = false;
  
  let remaining = [];
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].isMatched) {
      remaining.push(cards[i]);
    }
  }
  let remainingCount = remaining.length;
  
  console.log("Time's up! Remaining:", remainingCount, "Coins:", coins);
  
  if (remainingCount == 0) {
    console.log("No remaining cards!");
    return;
  }
  
  elements.remainingCards.textContent = remainingCount;
  elements.popupCoins.textContent = coins;
  
  let canContinue = coins >= GAME_CONSTANTS.CONTINUE_COST;
  elements.continueBtn.disabled = !canContinue;
  
  showContinuePopup();
}

// continue after time out
function continueWithRemaining() {
  if (coins < GAME_CONSTANTS.CONTINUE_COST) return;
  
  coins -= GAME_CONSTANTS.CONTINUE_COST;
  localStorage.setItem(STORAGE_KEYS.COINS, coins);
  updateUI();
  hideContinuePopup();
  
  // get remaining cards
  let remaining = [];
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].isMatched) {
      remaining.push(cards[i]);
    }
  }
  
  // reset and shuffle
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].isFlipped = false;
  }
  shuffle(remaining);
  
  cards = remaining;
  flipped = [];
  
  setupGrid(cards.length);
  gameActive = false;
  render();
  updateMemoryRateDisplay(cardsRemembered, cardsForgotten);
  
  // preview mode
  for (let i = 0; i < cards.length; i++) {
    cards[i].isFlipped = true;
  }
  render();
  
  setTimeout(function() {
    for (let i = 0; i < cards.length; i++) {
      cards[i].isFlipped = false;
    }
    render();
    gameActive = true;
    
    let newTime = timeLeft + GAME_CONSTANTS.CONTINUE_TIME_BONUS;
    if (newTime < GAME_CONSTANTS.MIN_CONTINUE_TIME) {
      newTime = GAME_CONSTANTS.MIN_CONTINUE_TIME;
    }
    startTimer(newTime);
    
    showMessage('✅ Continuing with ' + cards.length + ' cards! -' + GAME_CONSTANTS.CONTINUE_COST + ' coins');
  }, GAME_CONSTANTS.PREVIEW_DURATION);
}

// restart level
function restartLevel() {
  hideContinuePopup();
  startGame();
  showMessage("🔄 Level restarted!");
}

// reset game
function resetGame() {
  clearInterval(timerInterval);
  
  resetGameState();
  cards = [];
  currentLevel = 1;
  timeLeft = 0;
  
  clearBoard();
  updateTimerDisplay(0);
  elements.score.textContent = "";
  hideResult();
  
  generateLevelButtons();
  selectLevel(1);
  updateMemoryRateDisplay(0, 0);
  updateUI();
  
  localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  
  showMessage("🔄 Game reset! Select options and click Start Game.");
}

// update ui
function updateUI() {
  updateCoinsDisplay(coins, currentLevel, getBestScore());
}

// get best score
function getBestScore() {
  let key = STORAGE_KEYS.BEST_MOVES_PREFIX + currentDifficulty + '_' + currentLevel;
  let best = localStorage.getItem(key);
  if (best) {
    return parseInt(best);
  }
  return 0;
}

// update best score
function updateBestScore() {
  let key = STORAGE_KEYS.BEST_MOVES_PREFIX + currentDifficulty + '_' + currentLevel;
  let best = localStorage.getItem(key);
  
  if (!best || moves < parseInt(best)) {
    localStorage.setItem(key, moves);
    return moves;
  }
  
  return best;
}

// save game
function saveGame() {
  // convert Sets to arrays for saving
  let seenCardsArray = {};
  for (let key in seenCards) {
    seenCardsArray[key] = Array.from(seenCards[key]);
  }
  
  let gameState = {
    cards: cards,
    moves: moves,
    timeLeft: timeLeft,
    currentDifficulty: currentDifficulty,
    currentLevel: currentLevel,
    stats: stats,
    coins: coins,
    combo: combo,
    totalMatches: totalMatches,
    totalAttempts: totalAttempts,
    seenCards: seenCardsArray,
    cardsRemembered: cardsRemembered,
    cardsForgotten: cardsForgotten
  };
  
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
}

// load game
function loadGame() {
  let saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  if (!saved) return false;
  
  try {
    let data = JSON.parse(saved);
    if (!data || !data.cards || data.cards.length == 0) return false;
    
    // restore state
    cards = data.cards;
    moves = data.moves || 0;
    timeLeft = data.timeLeft || 0;
    currentDifficulty = data.currentDifficulty || 'easy';
    currentLevel = data.currentLevel || 1;
    stats = data.stats || { memory: 0, miss: 0 };
    coins = data.coins || 0;
    combo = data.combo || 0;
    totalMatches = data.totalMatches || 0;
    totalAttempts = data.totalAttempts || 0;
    cardsRemembered = data.cardsRemembered || 0;
    cardsForgotten = data.cardsForgotten || 0;
    
    // restore seenCards
    seenCards = {};
    if (data.seenCards) {
      for (let key in data.seenCards) {
        seenCards[key] = new Set(data.seenCards[key]);
      }
    }
    
    gameActive = true;
    initialTime = timeLeft;
    elements.difficulty.value = currentDifficulty;
    
    setupGrid(cards.length);
    render();
    startTimer(timeLeft);
    updateUI();
    
    console.log("Game loaded from save");
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}

// initialize
function initializeGame() {
  clearBoard();
  updateTimerDisplay(0);
  elements.score.textContent = "";
  hideResult();
  
  cards = [];
  flipped = [];
  gameActive = false;
  moves = 0;
  combo = 0;
  
  console.log("Memory Card Game loaded! Click Start Game to begin.");
}
