
let cards = [], flipped = [], lock = false;
let moves = 0;
let timerInterval, timeLeft, initialTime;
let stats = { memory: 0, miss: 0 };
let gameActive = false;
let currentDifficulty = 'easy';
let currentLevel = 1;
let coins = parseInt(localStorage.getItem('memoryGameCoins')) || 0;
let totalMatches = 0;
let totalAttempts = 0;
let seenCards = {};
let cardsSeenCount = 0;
let cardsRemembered = 0;
let cardsForgotten = 0;
let lastGameStats = { moves: 0, timeUsed: 0, memory: 0, miss: 0 };
let combo = 0;
let lastClickTime = 0;
document.getElementById("startBtn").onclick = startGame;
document.getElementById("resetBtn").onclick = resetGame;
document.getElementById("continueBtn").onclick = continueWithRemaining;
document.getElementById("restartBtn").onclick = restartLevel;

const difficultyConfig = {
  easy: { 
    pairs: 6, 
    time: 60,
    timeReduction: 2,  
    cardIncrease: 2
  },
  medium: { 
    pairs: 8, 
    time: 120,
    timeReduction: 5,
    cardIncrease: 4
  },
  hard: { 
    pairs: 12, 
    time: 120,
    timeReduction: 5,
    cardIncrease: 6
  }
};
function generateLevelButtons() {
  let levelButtons = document.getElementById('levelButtons');
  levelButtons.innerHTML = '';
  
  let diffConfig = difficultyConfig[currentDifficulty];
  let baseTime = diffConfig.time;
  let timeReduction = diffConfig.timeReduction;
  let basePairs = diffConfig.pairs;
  let cardIncrease = diffConfig.cardIncrease;
  
  for (let i = 1; i <= 3; i++) {
    let btn = document.createElement('button');
    btn.className = `level-btn ${i === currentLevel ? 'active' : ''}`;
    
    let levelTime = Math.max(30, baseTime - (i - 1) * timeReduction);
    let additionalPairs = (i - 1) * Math.floor(cardIncrease / 2);
    let totalPairs = Math.min(15, basePairs + additionalPairs);
    let cardCount = totalPairs * 2;
    
    btn.innerHTML = `${i}<br><small>${cardCount} cards</small>`;
    btn.onclick = () => selectLevel(i);
    
    levelButtons.appendChild(btn);
  }
}

// Select Level
function selectLevel(level) {
  currentLevel = level;
  document.getElementById("selectedLevelDisplay").textContent = level;
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.level-btn')[level - 1].classList.add('active');
}

generateLevelButtons();
selectLevel(1);

document.getElementById("difficulty").onchange = function() {
  currentDifficulty = this.value;
  currentLevel = 1;
  generateLevelButtons();
  selectLevel(1);
};

// Card Themes
const themes = {
  fruits: [
    "https://img.icons8.com/color/96/apple.png",
    "https://img.icons8.com/color/96/banana.png",
    "https://img.icons8.com/color/96/grapes.png",
    "https://img.icons8.com/color/96/orange.png",
    "https://img.icons8.com/color/96/watermelon.png",
    "https://img.icons8.com/color/96/strawberry.png",
    "https://img.icons8.com/color/96/pineapple.png",
    "https://img.icons8.com/color/96/mango.png",
    "https://img.icons8.com/color/96/cherry.png",
    "https://img.icons8.com/color/96/kiwi.png",
    "https://img.icons8.com/color/96/peach.png",
    "https://img.icons8.com/color/96/pear.png",
    "https://img.icons8.com/color/96/coconut.png",
    "https://img.icons8.com/color/96/melon.png",
    "https://img.icons8.com/color/96/tomato.png"
  ],
  vegetables: [
    "https://img.icons8.com/color/96/carrot.png",
    "https://img.icons8.com/color/96/broccoli.png",
    "https://img.icons8.com/color/96/corn.png",
    "https://img.icons8.com/color/96/eggplant.png",
    "https://img.icons8.com/color/96/potato.png",
    "https://img.icons8.com/color/96/onion.png",
    "https://img.icons8.com/color/96/lettuce.png",
    "https://img.icons8.com/color/96/chili-pepper.png",
    "https://img.icons8.com/color/96/cucumber.png",
    "https://img.icons8.com/color/96/sweet-potato.png",
    "https://img.icons8.com/color/96/peas.png",
    "https://img.icons8.com/color/96/bell-pepper.png",
    "https://img.icons8.com/color/96/garlic.png",
    "https://img.icons8.com/color/96/ginger.png",
    "https://img.icons8.com/color/96/mushroom.png"
  ],
  flowers: [
    "https://img.icons8.com/color/96/rose.png",
    "https://img.icons8.com/color/96/tulip.png",
    "https://img.icons8.com/color/96/sunflower.png",
    "https://img.icons8.com/color/96/lily.png",
    "https://img.icons8.com/color/96/jasmine.png",
    "https://img.icons8.com/color/96/lotus.png",
    "https://img.icons8.com/color/96/flower.png",
    "https://img.icons8.com/color/96/orchid.png",
    "https://img.icons8.com/color/96/daisy.png",
    "https://img.icons8.com/color/96/bouquet.png",
    "https://img.icons8.com/color/96/hibiscus.png",
    "https://img.icons8.com/color/96/cherry-blossom.png",
    "https://img.icons8.com/color/96/poppy.png",
    "https://img.icons8.com/color/96/lavender.png",
    "https://img.icons8.com/color/96/plant.png"
  ],
  animals: [
    "https://img.icons8.com/color/96/dog.png",
    "https://img.icons8.com/color/96/cat.png",
    "https://img.icons8.com/color/96/lion.png",
    "https://img.icons8.com/color/96/tiger.png",
    "https://img.icons8.com/color/96/panda.png",
    "https://img.icons8.com/color/96/koala.png",
    "https://img.icons8.com/color/96/frog.png",
    "https://img.icons8.com/color/96/monkey.png",
    "https://img.icons8.com/color/96/pig.png",
    "https://img.icons8.com/color/96/cow.png",
    "https://img.icons8.com/color/96/rabbit.png",
    "https://img.icons8.com/color/96/fox.png",
    "https://img.icons8.com/color/96/wolf.png",
    "https://img.icons8.com/color/96/horse.png",
    "https://img.icons8.com/color/96/deer.png"
  ],
  birds: [
    "https://img.icons8.com/color/96/bird.png",
    "https://img.icons8.com/color/96/eagle.png",
    "https://img.icons8.com/color/96/owl.png",
    "https://img.icons8.com/color/96/duck.png",
    "https://img.icons8.com/color/96/parrot.png",
    "https://img.icons8.com/color/96/swan.png",
    "https://img.icons8.com/color/96/flamingo.png",
    "https://img.icons8.com/color/96/chicken.png",
    "https://img.icons8.com/color/96/penguin.png",
    "https://img.icons8.com/color/96/dove.png",
    "https://img.icons8.com/color/96/turkey.png",
    "https://img.icons8.com/color/96/baby-chicken.png",
    "https://img.icons8.com/color/96/rooster.png",
    "https://img.icons8.com/color/96/peacock.png",
    "https://img.icons8.com/color/96/hummingbird.png"
  ],
  emojis: [
    "😀", "❤️", "⭐", "🔥", "👍", "👏", "🙌", "🤔", "😎", "🎉", "💎", "👑", "🎁", "🏆", "⚡"
  ]
};

// Image Preloading
let imageCache = {};
let imagesLoaded = 0;
let totalImages = 0;

function preloadImages() {
  let allUrls = [];
  Object.values(themes).forEach(themeArray => {
    allUrls = allUrls.concat(themeArray);
  });
  
  totalImages = allUrls.length;
  
  allUrls.forEach((imageUrl, index) => {
    if (!imageCache[imageUrl]) {
      let img = new Image();
      
      img.onload = function() {
        imagesLoaded++;
        console.log(`✅ Loaded ${imagesLoaded}/${totalImages}: ${imageUrl.split('/').pop()}`);
      };
      
      img.onerror = function() {
        imagesLoaded++;
        console.warn(`❌ Failed to load: ${imageUrl}`);
      };
      
      img.src = imageUrl;
      imageCache[imageUrl] = img;
    }
  });
  
  console.log(`🔄 Preloading ${totalImages} images...`);
}

preloadImages();

// Emoji Fallback
function getEmojiFallback(imageUrl) {
  const emojiMap = {
    'smiling.png': '😀',
    'heart.png': '❤️',
    'star.png': '⭐',
    'fire.png': '🔥',
    'thumbs-up.png': '👍',
    'clapping-hands.png': '👏',
    'raising-hands.png': '🙌',
    'thinking-face.png': '🤔',
    'sunglasses.png': '😎',
    'party-popper.png': '🎉',
    'gem-stone.png': '💎',
    'crown.png': '👑',
    'gift.png': '🎁',
    'trophy.png': '🏆',
    'lightning-bolt.png': '⚡'
  };
  
  let filename = imageUrl.split('/').pop();
  return emojiMap[filename] || '🎴';
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function startGame() {
  document.getElementById("result").style.display = "none";

  let diffConfig = difficultyConfig[currentDifficulty];
  let basePairs = diffConfig.pairs;
  let additionalPairs = (currentLevel - 1) * Math.floor(diffConfig.cardIncrease / 2);
  let totalPairs = Math.min(15, basePairs + additionalPairs);
  let count = totalPairs * 2;
  let baseTime = diffConfig.time;
  let timeReduction = (currentLevel - 1) * diffConfig.timeReduction;
  let timerDuration = Math.max(30, baseTime - timeReduction);
  
  let themeName = document.getElementById("theme").value;
  
  let themeArray = themes[themeName];
  let shuffledTheme = [...themeArray];
  shuffle(shuffledTheme);
  let selected = shuffledTheme.slice(0, count / 2);
  let values = [...selected, ...selected];
  
  cards = values.map((v, i) => ({
    id: i,
    value: v,
    isFlipped: false,
    isMatched: false,
    seen: 0
  }));

  shuffle(cards);

  moves = 0;
  stats = { memory: 0, miss: 0 };
  totalMatches = 0;
  totalAttempts = 0;
  seenCards = {};
  cardsSeenCount = 0;
  cardsRemembered = 0;
  cardsForgotten = 0;
  combo = 0;
  lastGameStats = { moves: 0, timeUsed: 0, memory: 0, miss: 0 };
  gameActive = false;
  initialTime = timerDuration;

  setupGrid(count);
  let board = document.getElementById("board");
  board.innerHTML = "";
  cards.forEach(c => {
    let div = document.createElement("div");
    div.className = "card";
    div.onclick = () => clickCard(c);
    board.appendChild(div);
  });
  
  updateMemoryTracker();
  cards.forEach(c => c.isFlipped = true);
  render();
  
  setTimeout(() => {
    cards.forEach(c => c.isFlipped = false);
    render();
    gameActive = true;
    startTimer(timerDuration);
    updateCoinsDisplay();
    
    //console.log(`🎮 Game started: ${currentDifficulty} Level ${currentLevel}, ${count} cards, ${timerDuration}s`);
  }, 2000);
}
function setupGrid(count) {
  let cols = Math.ceil(Math.sqrt(count));
  document.getElementById("board").style.gridTemplateColumns = `repeat(${cols}, 80px)`;
}
function updateCardUI(card) {
  let board = document.getElementById("board");
  let div = document.getElementById(`card-${card.id}`);
  if (!div) return;
  div.className = "card";
  div.id = `card-${card.id}`;

  if (card.isFlipped || card.isMatched) {
    div.classList.add("flipped");
    if (card.value.startsWith('http')) {
      let img = imageCache[card.value]?.cloneNode() || new Image();
      img.src = card.value;
      img.onerror = function() {
        this.style.display = 'none';
        div.innerHTML = `<span class="emoji-card">${getEmojiFallback(card.value)}</span>`;
      };
      div.innerHTML = "";
      div.appendChild(img);
    } else {
      div.innerHTML = `<span class="emoji-card">${card.value}</span>`;
    }
  } else {
    div.innerHTML = "";
  }
  if (card.isMatched) {
    div.classList.add("hide");
  }
  document.getElementById("score").textContent =
    `Moves:${moves} | Combo:${combo} | Memory:${stats.memory} Miss:${stats.miss}`;
  
  updateMemoryTracker();
}
function render() {
  let board = document.getElementById("board");
  board.innerHTML = "";
  cards.forEach(c => {
    let div = document.createElement("div");
    div.className = "card";
    div.id = `card-${c.id}`;
    if (c.isFlipped || c.isMatched) {
      div.classList.add("flipped");
      if (c.value.startsWith('http')) {
        let img = imageCache[c.value]?.cloneNode() || new Image();
        img.src = c.value;
        img.onerror = function() {
          this.style.display = 'none';
          div.innerHTML = `<span class="emoji-card">${getEmojiFallback(c.value)}</span>`;
        };
        div.innerHTML = "";
        div.appendChild(img);
      } else {
        div.innerHTML = `<span class="emoji-card">${c.value}</span>`;
      }
    }

    if (c.isMatched) div.classList.add("hide");

    div.onclick = () => clickCard(c);
    board.appendChild(div);
  });

  document.getElementById("score").textContent =
    `Moves:${moves} | Combo:${combo} | Memory:${stats.memory} Miss:${stats.miss}`;
    
  updateMemoryTracker();
}
function clickCard(c) {
  let now = Date.now();
  if (now - lastClickTime < 200) return;
  lastClickTime = now;

  if (lock || c.isFlipped || c.isMatched || !gameActive) return;

  c.isFlipped = true;
  c.seen++;

  if (!seenCards[c.value]) seenCards[c.value] = new Set();
  seenCards[c.value].add(c.id);

  flipped.push(c);

  updateCardUI(c);
  saveGame();

  if (flipped.length === 2) {
    moves++;
    totalAttempts++;
    check();
  }
}


function checkWin() {
  if (cards.every(c => c.isMatched)) {
    clearInterval(timerInterval);
    gameActive = false;
    lastGameStats.moves = moves;
    lastGameStats.timeUsed = initialTime - timeLeft;
    lastGameStats.memory = stats.memory;
    lastGameStats.guess = stats.guess;
    lastGameStats.miss = stats.miss;
    
    let timeBonus = Math.floor(timeLeft / 10);
    let memoryBonus = cardsRemembered * 5;
    let levelBonus = currentLevel * 10;
    let coinsEarned = 50 + timeBonus + memoryBonus + levelBonus;
    
    coins += coinsEarned;
    localStorage.setItem('memoryGameCoins', coins);

    adjustDifficulty();
    
    let result = document.getElementById("result");
    result.style.display = "block";
    let best = updateBestScore();
    updateCoinsDisplay();
    
    let memoryRate = (cardsRemembered + cardsForgotten) > 0 ? 
      Math.round((cardsRemembered / (cardsRemembered + cardsForgotten)) * 100) : 0;
    
    result.innerHTML = `
      <h2>🎉 Level ${currentLevel} Complete!</h2>
      <p><strong>Difficulty:</strong> ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</p>
      <p><strong>Time Used:</strong> ${format(lastGameStats.timeUsed)}</p>
      <p><strong>Moves:</strong> ${lastGameStats.moves}</p>
      <p><strong>Memory:</strong> ${lastGameStats.memory} | <strong>Miss:</strong> ${lastGameStats.miss}</p>
      <p><strong>Best Combo:</strong> ${combo}</p>
      <p>🏆 <strong>Best Moves:</strong> ${best} | <strong>Memory Rate:</strong> ${memoryRate}%</p>
      <hr style="margin: 15px 0; border: 1px solid rgba(255,255,255,0.3);">
      <h3>💰 Coins Earned: ${coinsEarned}</h3>
      <p style="font-size: 12px; opacity: 0.8;">Base: 50 | Time: ${timeBonus} | Memory: ${memoryBonus} | Level: ${levelBonus}</p>
      <p><strong>Total Coins:</strong> ${coins}</p>
      <button onclick="nextLevel()" style="margin-top: 15px; padding: 12px 24px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer;">🎮 Next Level</button>
      <button onclick="resetGame()" style="margin-top: 10px; padding: 10px 20px; font-size: 14px; background: linear-gradient(135deg, #f44336, #d32f2f); color: white; border: none; border-radius: 8px; cursor: pointer;">🔄 Reset Game</button>
    `;

    saveGame();
  }
}


function nextLevel() {
  
  if (currentDifficulty === 'easy' && currentLevel === 3) {
    currentDifficulty = 'medium';
    currentLevel = 1;
    showMessage(`🎯 Advancing to Medium difficulty!`);
  } else if (currentDifficulty === 'medium' && currentLevel === 3) {
    currentDifficulty = 'hard';
    currentLevel = 1;
    showMessage(`🔥 Advancing to Hard difficulty!`);
  } else {
    currentLevel++;
    if (currentLevel > 3) {
      currentLevel = 1;
    }
  }
  
  document.getElementById("currentLevelDisplay").textContent = currentLevel;
  document.getElementById("difficulty").value = currentDifficulty;
  generateLevelButtons();
  selectLevel(currentLevel);
  startGame(); 
}


function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function check() {
  let [a, b] = flipped;
  lock = true;

  let seenBefore = seenCards[a.value]?.size >= 2;

  if (a.value === b.value) {
    totalMatches++;
    combo++;
    let bonus = combo * 2;
    coins += bonus;

    if (seenBefore) {
      stats.memory++;
      cardsRemembered++;
    } else {
      stats.miss++;
      cardsForgotten++;
    }

    await wait(500);

    a.isMatched = true;
    b.isMatched = true;

    updateCardUI(a);
    updateCardUI(b);

    flipped = [];
    lock = false;

    saveGame();
    checkWin();

  } else {
    combo = 0;

    if (a.seen > 1 || b.seen > 1) {
      stats.miss++;
      cardsForgotten++;
    }

    await wait(700);

    a.isFlipped = false;
    b.isFlipped = false;

    updateCardUI(a);
    updateCardUI(b);

    flipped = [];
    lock = false;

    saveGame();
  }
}
function startTimer(duration) {
  clearInterval(timerInterval);
  
  if (duration) {
    timeLeft = duration;
  } else {
    timeLeft = initialTime;
  }

  document.getElementById("timer").textContent = format(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = format(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      reshuffleRemaining();
    }
    
    saveGame();
  }, 1000);
}

function resetGame() {
  clearInterval(timerInterval);
  gameActive = false;
  cards = [];
  flipped = [];
  lock = false;
  moves = 0;
  stats = { memory: 0, miss: 0 };
  totalMatches = 0;
  totalAttempts = 0;
  currentLevel = 1;
  seenCards = {};
  cardsSeenCount = 0;
  cardsRemembered = 0;
  cardsForgotten = 0;
  combo = 0;
  lastGameStats = { moves: 0, timeUsed: 0, memory: 0, miss: 0 };
  timeLeft = 0;
  
  document.getElementById("board").innerHTML = "";
  document.getElementById("timer").textContent = "0:00";
  document.getElementById("score").textContent = "";
  document.getElementById("result").style.display = "none";
  
  generateLevelButtons();
  selectLevel(1);
  updateMemoryTracker();
  updateCoinsDisplay();
  localStorage.removeItem("memoryGameState");
  
  showMessage("🔄 Game reset! Select options and click Start Game.");
}
function reshuffleRemaining() {
  clearInterval(timerInterval);
  gameActive = false;
  
  let remaining = cards.filter(c => !c.isMatched);
  let remainingCount = remaining.length;
  
  console.log(`⏰ Time's up! Remaining cards: ${remainingCount}, Your coins: ${coins}`);
  
  if (remainingCount === 0) {
    console.log("No remaining cards, game complete!");
    return;
  }
  
  document.getElementById("remainingCards").textContent = remainingCount;
  document.getElementById("popupCoins").textContent = coins;
  
  let continueBtn = document.getElementById("continueBtn");
  if (coins >= 100) {
    continueBtn.disabled = false;
  } else {
    continueBtn.disabled = true;
    
  }
  
  document.getElementById("continuePopup").classList.add("show");
}
function updateMemoryTracker() {
  let memoryRateEl = document.getElementById("memoryRate");
  let totalTracked = cardsRemembered + cardsForgotten;
  let memoryRate = totalTracked > 0 ? (cardsRemembered / totalTracked) * 100 : 0;
  memoryRateEl.textContent = Math.round(memoryRate) + "%";
  
  if (memoryRate >= 75) {
    memoryRateEl.style.color = "#4CAF50";
  } else if (memoryRate >= 50) {
    memoryRateEl.style.color = "#FFC107";
  } else if (memoryRate >= 25) {
    memoryRateEl.style.color = "#FF9800";
  } else if (totalTracked > 0) {
    memoryRateEl.style.color = "#f44336";
  } else {
    memoryRateEl.style.color = "#4CAF50";
  }
}

function continueWithRemaining() {
  if (coins < 100) return;
  
  coins -= 100;
  localStorage.setItem('memoryGameCoins', coins);
  updateCoinsDisplay();
  document.getElementById("continuePopup").classList.remove("show");
  
  let matched = cards.filter(c => c.isMatched);
  let remaining = cards.filter(c => !c.isMatched);
  
  remaining.forEach(c => {
    c.isFlipped = false;
  });
  
  shuffle(remaining);
  cards = remaining;
  flipped = [];
  let count = cards.length;
  setupGrid(count);
  gameActive = false; 
  render();
  updateMemoryTracker();
  cards.forEach(c => c.isFlipped = true);
  render();
  
  setTimeout(() => {
    cards.forEach(c => c.isFlipped = false);
    render();
    gameActive = true; 
    let newTime = Math.max(15, Math.floor(timeLeft + 10));
    startTimer(newTime);
    
    showMessage(`✅ Continuing with ${count} cards! -100 coins`);
  }, 2000);
}
function restartLevel() {
  document.getElementById("continuePopup").classList.remove("show");
  startGame();
  showMessage("🔄 Level restarted!");
}

function updateCoinsDisplay() {
  document.getElementById("coins").textContent = coins;
  document.getElementById("currentLevelDisplay").textContent = currentLevel;
  let best = getBestScore();
  document.getElementById("bestMoves").textContent = best === 0 ? '-' : best;
}


function getBestScore() {
  let key = "bestMoves_" + currentDifficulty + "_" + currentLevel;
  let best = localStorage.getItem(key);
  return best ? parseInt(best) : 0;
}


function updateBestScore() {
  let key = "bestMoves_" + currentDifficulty + "_" + currentLevel;
  let best = localStorage.getItem(key);

  if (!best || moves < parseInt(best)) {
    localStorage.setItem(key, moves);
    best = moves;
  }

  return best;
}

function showMessage(msg) {
  let el = document.getElementById("score");
  el.textContent = msg;

  setTimeout(() => {
    render();
  }, 1500);
}

function format(s) {
  let m = Math.floor(s / 60);
  let sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
function saveGame() {
  localStorage.setItem("memoryGameState", JSON.stringify({
    cards,
    moves,
    timeLeft,
    currentDifficulty,
    currentLevel,
    stats,
    coins,
    combo,
    totalMatches,
    totalAttempts,
    seenCards: Object.fromEntries(Object.entries(seenCards).map(([k, v]) => [k, [...v]])),
    cardsRemembered,
    cardsForgotten
  }));
}

function loadGame() {
  let saved = localStorage.getItem("memoryGameState");
  if (!saved) return false;
  
  try {
    let data = JSON.parse(saved);
    if (!data || !data.cards || data.cards.length === 0) return false;
    
    cards = data.cards;
    moves = data.moves || 0;
    timeLeft = data.timeLeft || 0;
    currentDifficulty = data.currentDifficulty || 'easy';
    currentLevel = data.currentLevel || 1;
    stats = data.stats || { memory: 0, guess: 0, miss: 0 };
    coins = data.coins || 0;
    combo = data.combo || 0;
    totalMatches = data.totalMatches || 0;
    totalAttempts = data.totalAttempts || 0;
    seenCards = {};
    if (data.seenCards) {
      Object.entries(data.seenCards).forEach(([k, v]) => {
        seenCards[k] = new Set(v);
      });
    }
    
    cardsRemembered = data.cardsRemembered || 0;
    cardsForgotten = data.cardsForgotten || 0;
    
    gameActive = true;
    initialTime = timeLeft;
    
    setupGrid(cards.length);
    render();
    startTimer(timeLeft);
    updateCoinsDisplay();
    
    console.log("💾 Game loaded from save");
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    return false;
  }
}


function adjustDifficulty() {
  let total = cardsRemembered + cardsForgotten;
  if (total === 0) return;

  let rate = (cardsRemembered / total) * 100;

  if (rate > 80 && currentLevel < 3) {
    currentLevel++;
    showMessage(`🎯 Great memory! Advanced to Level ${currentLevel}!`);
  } else if (rate < 40 && currentLevel > 1) {
    currentLevel--;
    showMessage(`📉 Level adjusted to ${currentLevel} for better experience`);
  }
  
  document.getElementById("currentLevelDisplay").textContent = currentLevel;
  generateLevelButtons();
  selectLevel(currentLevel);
}
window.onload = function() {
  document.getElementById("board").innerHTML = "";
  document.getElementById("timer").textContent = "0:00";
  document.getElementById("score").textContent = "";
  document.getElementById("result").style.display = "none";
  cards = [];
  flipped = [];
  gameActive = false;
  moves = 0;
  combo = 0;
};
