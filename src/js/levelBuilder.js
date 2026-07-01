import platform from '../../img/platform.png'
import platformSmallTall from '../../img/platformSmallTall.png'

import { state } from './gameState.js'
import { Platform } from './classes/Platform.js'
import { Enemy } from './classes/Enemy.js'
import { createImage } from './utils.js'

/**
 * Generates the platform layouts for the selected mission and difficulty.
 */
export function createMissionPlatforms() {
  const diff = state.difficulties[state.selectedDifficulty]
  const mission = state.selectedMission
  const length = mission === 13 ? 24 : 8 + mission
  const platformsList = []

  let platformImage = createImage(platform)
  let platformSmallTallImage = createImage(platformSmallTall)

  let x = -1

  for (let i = 0; i < length; i++) {
    const isTall = i > 2 && (i + mission) % 5 === 0
    const baseGap =
      mission === 13
        ? 135 + diff.gapBonus * 0.45
        : 120 + mission * 18 + diff.gapBonus
    const gap = i < 2 ? -3 : baseGap + (i % 3) * 45
    const yPattern = [470, 430, 390, 350, 470, 410, 320]
    const y = i < 2 ? 470 : yPattern[(i + mission) % yPattern.length]

    platformsList.push(
      new Platform({
        x,
        y: isTall ? y - 70 : y,
        image: isTall ? platformSmallTallImage : platformImage
      })
    )

    x += platformImage.width + gap
  }

  if (mission === 13) {
    platformsList.push(new Platform({ x: x + 250, y: 470, image: platformImage }))
    platformsList.push(new Platform({ x: x + 720, y: 470, image: platformImage }))
    platformsList.push(new Platform({ x: x + 1190, y: 470, image: platformImage }))
    platformsList.push(new Platform({ x: x + 1660, y: 470, image: platformImage }))
  }

  state.missionWinOffset = mission === 13 ? x + 1700 : 4300 + mission * 700 + diff.gapBonus * 4
  return platformsList
}

/**
 * Spawns enemies on the generated platforms based on mission count and difficulty.
 */
export function createEnemies() {
  const diff = state.difficulties[state.selectedDifficulty]
  const mission = state.selectedMission
  const enemiesList = []
  const enemyCount = Math.min(2 + Math.floor(mission / 2) + diff.enemyBonus, mission === 13 ? 12 : 9)

  for (let i = 0; i < enemyCount; i++) {
    const platformIndex = 2 + i * 2

    if (!state.platforms[platformIndex]) continue

    const platformItem = state.platforms[platformIndex]
    const enemyX = platformItem.position.x + 120

    enemiesList.push(
      new Enemy({
        x: enemyX,
        y: platformItem.position.y - 52,
        startX: platformItem.position.x + 20,
        endX: platformItem.position.x + platformItem.width - 20,
        speed: 1.4 + mission * 0.12 + diff.speedBonus * 0.35
      })
    )
  }

  return enemiesList
}
