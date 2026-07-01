import platform from '../../img/platform.png'
import platformSmallTall from '../../img/platformSmallTall.png'
import background from '../../img/background.png'
import hills from '../../img/hills.png'

import { state } from './gameState.js'
import { createImage } from './utils.js'

import { Player } from './classes/Player.js'
import { GenericObject } from './classes/GenericObject.js'
import { WeaponPickup } from './classes/WeaponPickup.js'
import { Boss } from './classes/Boss.js'
import { Door } from './classes/Door.js'

import { createMissionPlatforms, createEnemies } from './levelBuilder.js'
import { 
  drawStartScreen, 
  drawHelpScreen, 
  drawMissionScreen, 
  drawDifficultyScreen, 
  drawWinScreen, 
  drawGameHud 
} from './screens.js'
import { 
  handlePlayerMovement, 
  handlePlatformCollisions, 
  handleEnemyCollisions, 
  handleWeaponBossAndDoor, 
  updateSprites,
  unlockNextMission
} from './physics.js'
import { setupInput } from './input.js'

// Setup canvas reference context on global state object
state.canvas = document.querySelector('canvas')
state.c = state.canvas.getContext('2d')
state.canvas.width = 1024
state.canvas.height = 576

/**
 * Initializes and resets all level variables, player statistics, platform positions, and entities.
 */
export function init() {
  state.player = new Player()
  state.scrollOffset = 0
  state.currentKey = null

  state.keys.right.pressed = false
  state.keys.left.pressed = false

  state.platforms = createMissionPlatforms()
  state.enemies = createEnemies()
  state.bullets = []
  state.bossBullets = []

  const weaponPlatform = state.selectedMission === 13 ? state.platforms[state.platforms.length - 4] : null
  const bossPlatform = state.selectedMission === 13 ? state.platforms[state.platforms.length - 2] : null
  const doorPlatform = state.selectedMission === 13 ? state.platforms[state.platforms.length - 1] : null

  state.weaponPickup =
    state.selectedMission === 13 && weaponPlatform
      ? new WeaponPickup({
        x: weaponPlatform.position.x + 180,
        y: weaponPlatform.position.y - 58
      })
      : null

  state.boss =
    state.selectedMission === 13 && bossPlatform
      ? new Boss({
        x: bossPlatform.position.x + 215,
        y: bossPlatform.position.y - 165
      })
      : null

  state.exitDoor =
    state.selectedMission === 13 && doorPlatform
      ? new Door({
        x: doorPlatform.position.x + 270,
        y: doorPlatform.position.y - 118
      })
      : null

  state.genericObjects = [
    new GenericObject({ x: -1, y: -1, image: createImage(background) }),
    new GenericObject({ x: -1, y: -1, image: createImage(hills) })
  ]
}

/**
 * Executes the frame update routines during active gameplay mode.
 */
function playMission() {
  state.genericObjects.forEach(genericObject => genericObject.draw())
  state.platforms.forEach(platformItem => platformItem.draw())
  state.enemies.forEach(enemy => enemy.update())

  if (state.weaponPickup) state.weaponPickup.draw()
  if (state.boss) state.boss.update()
  if (state.exitDoor && (!state.boss || !state.boss.alive)) state.exitDoor.draw()

  state.player.update()
  drawGameHud()

  handlePlayerMovement()
  handlePlatformCollisions()
  handleEnemyCollisions()
  handleWeaponBossAndDoor()
  updateSprites()

  if (state.selectedMission !== 13 && state.scrollOffset > state.missionWinOffset) {
    unlockNextMission()
    state.gameState = 'won'
  }

  const deathLine = 570
  if (state.player.position.y + state.player.height >= deathLine && !state.player.canJump) {
    init()
  }
}

/**
 * Main game execution loop rendering frames at target FPS constraints.
 */
function animate(currentTime = 0) {
  requestAnimationFrame(animate)

  const elapsed = currentTime - state.lastFrameTime
  if (elapsed < state.frameDelay) return

  state.lastFrameTime = currentTime - (elapsed % state.frameDelay)

  state.c.fillStyle = 'white'
  state.c.fillRect(0, 0, state.canvas.width, state.canvas.height)

  if (state.gameState === 'start') {
    drawStartScreen()
    return
  }
  if (state.gameState === 'help') {
    drawHelpScreen()
    return
  }
  if (state.gameState === 'missions') {
    drawMissionScreen()
    return
  }
  if (state.gameState === 'difficulty') {
    drawDifficultyScreen()
    return
  }
  if (state.gameState === 'playing') {
    playMission()
    return
  }
  if (state.gameState === 'won') {
    state.genericObjects.forEach(obj => obj.draw())
    state.platforms.forEach(p => p.draw())
    state.enemies.forEach(enemy => enemy.draw())

    if (state.weaponPickup) state.weaponPickup.draw()
    if (state.boss) state.boss.draw()
    if (state.exitDoor) state.exitDoor.draw()

    state.player.draw()
    drawGameHud()
    drawWinScreen()
  }
}

// Bootstrapping listeners and execution loop
setupInput()
init()
animate()