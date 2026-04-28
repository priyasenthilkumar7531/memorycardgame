// helper functions

// format seconds to minutes:seconds
function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  if (s < 10) {
    s = "0" + s;
  }
  return m + ":" + s;
}

// shuffle array - got this from stackoverflow
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// wait function for setTimeout with promise
function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

// check if its an image url
function isImageUrl(value) {
  return value.startsWith('http');
}

// calculate time for level
function calculateLevelTime(difficulty, level) {
  let config = DIFFICULTY_CONFIG[difficulty];
  let reduction = (level - 1) * config.timeReduction;
  let time = config.time - reduction;
  if (time < GAME_CONSTANTS.MIN_LEVEL_TIME) {
    time = GAME_CONSTANTS.MIN_LEVEL_TIME;
  }
  return time;
}

// calculate how many cards
function calculateCardCount(difficulty, level) {
  let config = DIFFICULTY_CONFIG[difficulty];
  let extraPairs = (level - 1) * Math.floor(config.cardIncrease / 2);
  let totalPairs = config.pairs + extraPairs;
  if (totalPairs > GAME_CONSTANTS.MAX_PAIRS) {
    totalPairs = GAME_CONSTANTS.MAX_PAIRS;
  }
  return totalPairs * 2;
}

// calculate coins earned
function calculateCoinsEarned(timeLeft, cardsRemembered, currentLevel) {
  let timeBonus = Math.floor(timeLeft / GAME_CONSTANTS.TIME_BONUS_DIVISOR);
  let memoryBonus = cardsRemembered * GAME_CONSTANTS.MEMORY_BONUS_MULTIPLIER;
  let levelBonus = currentLevel * GAME_CONSTANTS.LEVEL_BONUS_MULTIPLIER;
  return GAME_CONSTANTS.BASE_COINS_REWARD + timeBonus + memoryBonus + levelBonus;
}

// get memory rate percentage
function calculateMemoryRate(cardsRemembered, cardsForgotten) {
  let total = cardsRemembered + cardsForgotten;
  if (total == 0) return 0;
  return (cardsRemembered / total) * 100;
}

// create a card object
function createCardObject(id, value) {
  return {
    id: id,
    value: value,
    isFlipped: false,
    isMatched: false,
    seen: 0
  };
}

// get card values from theme
function generateCardValues(themeName, count) {
  let themeArray = THEMES[themeName];
  let shuffled = shuffle([...themeArray]);
  let selected = shuffled.slice(0, count / 2);
  // duplicate for pairs
  return [...selected, ...selected];
}

// setup the grid
function setupGrid(count) {
  let cols = Math.ceil(Math.sqrt(count));
  elements.board.style.gridTemplateColumns = "repeat(" + cols + ", 80px)";
}
