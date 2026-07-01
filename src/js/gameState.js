export const state = {
  // Level & Physics Settings
  totalMissions: 13,
  gravity: 0.5,
  targetFPS:  targetFPSCount(),
  frameDelay: 1000 / 60,

  colors: {
    blue: '#1d4ed8',
    blueDark: '#0f2f78',
    locked: '#334155',
    white: '#ffffff',
    overlay: 'rgba(3, 7, 18, 0.58)'
  },

  difficulties: {
    easy: { label: 'EASY', speedBonus: 0, gapBonus: 0, enemyBonus: 0 },
    normal: { label: 'NORMAL', speedBonus: 1, gapBonus: 70, enemyBonus: 1 },
    hard: { label: 'HARD', speedBonus: 2, gapBonus: 130, enemyBonus: 2 }
  },

  missionNames: [
    'First Steps',
    'Broken Road',
    'Hill Runner',
    'Sky Training',
    'Long Jump',
    'Enemy Patrol',
    'Tall Towers',
    'Fast Fighters',
    'Danger Valley',
    'Hard Climb',
    'Last Bridge',
    'Weapon Path',
    'Final War'
  ],

  // UI buttons
  buttons: {
    start: { x: 412, y: 250, width: 200, height: 58, text: 'START' },
    help: { x: 412, y: 325, width: 200, height: 58, text: 'HELP' },
    back: { x: 32, y: 32, width: 130, height: 48, text: 'BACK' },
    easy: { x: 337, y: 215, width: 350, height: 58, text: 'EASY' },
    normal: { x: 337, y: 295, width: 350, height: 58, text: 'NORMAL' },
    hard: { x: 337, y: 375, width: 350, height: 58, text: 'HARD' },
    restart: { x: 312, y: 345, width: 190, height: 54, text: 'RESTART' },
    menu: { x: 522, y: 345, width: 190, height: 54, text: 'MENU' }
  },

  missionButtons: [],

  // Live Game States
  canvas: null,
  c: null,
  lastFrameTime: 0,
  gameState: 'start',
  selectedMission: 1,
  selectedDifficulty: 'easy',
  unlockedMissionCount: Number(localStorage.getItem('unlockedMissionCount')) || 1,

  // Render lists and current entities
  player: null,
  platforms: [],
  enemies: [],
  genericObjects: [],
  bullets: [],
  bossBullets: [],
  weaponPickup: null,
  boss: null,
  exitDoor: null,
  currentKey: null,
  scrollOffset: 0,
  missionWinOffset: 7600,
  keys: {
    right: { pressed: false },
    left: { pressed: false }
  }
}

// Generate the coordinates of the selection mission list
for (let i = 1; i <= state.totalMissions; i++) {
  const column = (i - 1) % 4
  const row = Math.floor((i - 1) / 4)

  state.missionButtons.push({
    missionNumber: i,
    x: 128 + column * 195,
    y: 180 + row * 78,
    width: 165,
    height: 56,
    text: `MISSION ${i}`
  })
}

function targetFPSCount() {
  return 60
}
