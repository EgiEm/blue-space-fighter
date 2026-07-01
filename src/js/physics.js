import { state } from './gameState.js'
import { Bullet } from './classes/Bullet.js'
import { rectanglesTouch } from './utils.js'
import { init } from './canvas.js'

/**
 * Fires a bullet from the player's position towards the boss.
 */
export function shootPlayerBullet() {
  if (!state.player.hasWeapon || state.player.reloadTimer > 0 || state.player.shootTimer > 0) return

  if (state.player.ammo <= 0) {
    state.player.reloadTimer = 90
    return
  }

  state.bullets.push(
    new Bullet({
      x: state.player.position.x + state.player.width + 40,
      y: state.player.position.y + 78,
      speed: 14
    })
  )

  state.player.ammo--
  state.player.shootTimer = 7

  if (state.player.ammo <= 0) state.player.reloadTimer = 90
}

/**
 * Scrolls the coordinates of level elements relative to screen scroll amount.
 */
export function moveWorld(amount) {
  state.platforms.forEach(platformItem => {
    platformItem.position.x += amount
  })

  state.enemies.forEach(enemy => {
    enemy.position.x += amount
    enemy.startX += amount
    enemy.endX += amount
  })

  state.genericObjects.forEach(genericObject => {
    genericObject.position.x += amount * 0.66
  })

  if (state.weaponPickup) state.weaponPickup.position.x += amount
  if (state.boss) state.boss.position.x += amount
  if (state.exitDoor) state.exitDoor.position.x += amount

  state.bullets.forEach(bullet => {
    bullet.position.x += amount
  })

  state.bossBullets.forEach(bullet => {
    bullet.position.x += amount
  })
}

/**
 * Applies horizontal walking, running, and scrolling offsets to player and world.
 */
export function handlePlayerMovement() {
  if (state.keys.right.pressed && state.player.position.x < 400) {
    state.player.velocity.x = state.player.speed
  } else if (
    (state.keys.left.pressed && state.player.position.x > 100) ||
    (state.keys.left.pressed && state.scrollOffset === 0 && state.player.position.x > 0)
  ) {
    state.player.velocity.x = -state.player.speed
  } else {
    state.player.velocity.x = 0

    if (state.keys.right.pressed) {
      state.scrollOffset += state.player.speed
      moveWorld(-state.player.speed)
    } else if (state.keys.left.pressed && state.scrollOffset > 0) {
      state.scrollOffset -= state.player.speed
      moveWorld(state.player.speed)
    }
  }
}

/**
 * Handles platform boundary floor landings and resets vertical gravity velocity.
 */
export function handlePlatformCollisions() {
  state.player.canJump = false

  state.platforms.forEach(platformItem => {
    if (
      state.player.position.y + state.player.height <= platformItem.position.y &&
      state.player.position.y + state.player.height + state.player.velocity.y >= platformItem.position.y &&
      state.player.position.x + state.player.width >= platformItem.position.x &&
      state.player.position.x <= platformItem.position.x + platformItem.width
    ) {
      state.player.velocity.y = 0
      state.player.position.y = platformItem.position.y - state.player.height
      state.player.canJump = true
    }
  })
}

/**
 * Standard enemy hit checking. Stomping kills the enemy, lateral contacts kill the player.
 */
export function handleEnemyCollisions() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive) return
    if (!rectanglesTouch(state.player, enemy)) return

    const wasAboveEnemy = state.player.previousPosition.y + state.player.height <= enemy.position.y + 12

    if (wasAboveEnemy && state.player.velocity.y >= 0) {
      enemy.alive = false
      state.player.velocity.y = -10
    } else {
      init()
    }
  })
}

/**
 * Coordinates weapon pickup touches, automated M4 trigger fires, bullet contacts, and exit door checks.
 */
export function handleWeaponBossAndDoor() {
  if (state.weaponPickup && !state.weaponPickup.collected && rectanglesTouch(state.player, state.weaponPickup)) {
    state.weaponPickup.collected = true
    state.player.hasWeapon = true
  }

  if (state.player.hasWeapon && state.boss && state.boss.alive) {
    shootPlayerBullet()
  }

  state.bullets.forEach(bullet => {
    bullet.update()

    if (state.boss && state.boss.alive && rectanglesTouch(bullet, state.boss)) {
      state.boss.health -= 15
      bullet.active = false

      if (state.boss.health <= 0) {
        state.boss.alive = false
        state.bossBullets.length = 0
        if (state.exitDoor) state.exitDoor.open = true
      }
    }
  })

  state.bossBullets.forEach(bullet => {
    bullet.update()

    if (rectanglesTouch(state.player, bullet)) {
      bullet.active = false
      state.player.lives--

      if (state.player.lives <= 0) {
        init()
      }
    }
  })

  if (state.exitDoor && state.exitDoor.open && rectanglesTouch(state.player, state.exitDoor)) {
    unlockNextMission()
    state.gameState = 'won'
  }

  state.bullets = state.bullets.filter(bullet => bullet.active)
  state.bossBullets = state.bossBullets.filter(bullet => bullet.active)
}

/**
 * Unlocks the subsequent level index and saves status to local storage.
 */
export function unlockNextMission() {
  if (state.selectedMission === state.unlockedMissionCount && state.unlockedMissionCount < state.totalMissions) {
    state.unlockedMissionCount++
    localStorage.setItem('unlockedMissionCount', state.unlockedMissionCount)
  }
}

/**
 * Matches player velocity vectors to active run/stand sprites.
 */
export function updateSprites() {
  if (
    state.keys.right.pressed &&
    state.currentKey === 'right' &&
    state.player.currentSprite !== state.player.sprites.run.right
  ) {
    state.player.frames = 1
    state.player.currentSprite = state.player.sprites.run.right
    state.player.currentCropWidth = state.player.sprites.run.cropWidth
    state.player.width = state.player.sprites.run.width
  } else if (
    state.keys.left.pressed &&
    state.currentKey === 'left' &&
    state.player.currentSprite !== state.player.sprites.run.left
  ) {
    state.player.frames = 1
    state.player.currentSprite = state.player.sprites.run.left
    state.player.currentCropWidth = state.player.sprites.run.cropWidth
    state.player.width = state.player.sprites.run.width
  } else if (
    !state.keys.left.pressed &&
    state.currentKey === 'left' &&
    state.player.currentSprite !== state.player.sprites.stand.left
  ) {
    state.player.frames = 1
    state.player.currentSprite = state.player.sprites.stand.left
    state.player.currentCropWidth = state.player.sprites.stand.cropWidth
    state.player.width = state.player.sprites.stand.width
  } else if (
    !state.keys.right.pressed &&
    state.currentKey === 'right' &&
    state.player.currentSprite !== state.player.sprites.stand.right
  ) {
    state.player.frames = 1
    state.player.currentSprite = state.player.sprites.stand.right
    state.player.currentCropWidth = state.player.sprites.stand.cropWidth
    state.player.width = state.player.sprites.stand.width
  }
}
