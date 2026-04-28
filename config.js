// game settings and config
const DIFFICULTY_CONFIG = {
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

// all the themes with images
const THEMES = {
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

// constants for the game
const GAME_CONSTANTS = {
  PREVIEW_DURATION: 2000,        // preview time 2 sec
  MATCH_DELAY: 500,              // wait time for match
  MISMATCH_DELAY: 700,           // wait time for no match
  CLICK_THROTTLE: 200,           // click delay
  CONTINUE_COST: 100,            // coins needed
  CONTINUE_TIME_BONUS: 10,       // extra seconds
  MIN_CONTINUE_TIME: 15,         // min time for continue
  MIN_LEVEL_TIME: 30,            // minimum level time
  MAX_PAIRS: 15,                 // max pairs allowed
  COMBO_BONUS_MULTIPLIER: 2,     // combo bonus
  BASE_COINS_REWARD: 50,         // base reward
  TIME_BONUS_DIVISOR: 10,        // time bonus calc
  MEMORY_BONUS_MULTIPLIER: 5,    // memory bonus
  LEVEL_BONUS_MULTIPLIER: 10,    // level bonus
  ADAPTIVE_HIGH_THRESHOLD: 80,   // 80% to level up
  ADAPTIVE_LOW_THRESHOLD: 40     // 40% to level down
};

// keys for localstorage
const STORAGE_KEYS = {
  COINS: 'memoryGameCoins',
  GAME_STATE: 'memoryGameState',
  BEST_MOVES_PREFIX: 'bestMoves_'
};
