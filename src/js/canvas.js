import platform from '../../img/platform.png'
import hills from '../../img/hills.png'
import background from '../../img/background.png'
import platformSmallTall from '../../img/platformSmallTall.png'

import spriteRunLeft from '../../img/spriteRunLeft.png'
import spriteRunRight from '../../img/spriteRunRight.png'
import spriteStandLeft from '../../img/spriteStandLeft.png'
import spriteStandRight from '../../img/spriteStandRight.png'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.5
const totalMissions = 13

let gameState = 'start'
let selectedMission = 1
let selectedDifficulty = 'easy'
let unlockedMissionCount = Number(localStorage.getItem('unlockedMissionCount')) || 1

if (unlockedMissionCount < 1) unlockedMissionCount = 1
if (unlockedMissionCount > totalMissions) unlockedMissionCount = totalMissions

const colors = {
  blue: '#1d4ed8',
  blueDark: '#0f2f78',
  locked: '#334155',
  white: '#ffffff',
  overlay: 'rgba(3, 7, 18, 0.58)'
}

const buttons = {
  start: { x: 412, y: 250, width: 200, height: 58, text: 'START' },
  help: { x: 412, y: 325, width: 200, height: 58, text: 'HELP' },
  back: { x: 32, y: 32, width: 130, height: 48, text: 'BACK' },
  easy: { x: 337, y: 215, width: 350, height: 58, text: 'EASY' },
  normal: { x: 337, y: 295, width: 350, height: 58, text: 'NORMAL' },
  hard: { x: 337, y: 375, width: 350, height: 58, text: 'HARD' },
  restart: { x: 312, y: 345, width: 190, height: 54, text: 'RESTART' },
  menu: { x: 522, y: 345, width: 190, height: 54, text: 'MENU' }
}

const missionButtons = []

for (let i = 1; i <= totalMissions; i++) {
  const column = (i - 1) % 4
  const row = Math.floor((i - 1) / 4)

  missionButtons.push({
    missionNumber: i,
    x: 128 + column * 195,
    y: 180 + row * 78,
    width: 165,
    height: 56,
    text: `MISSION ${i}`
  })
}

const difficulties = {
  easy: {
    label: 'EASY',
    goal: 'Go from Point A to Point B',
    winOffset: 7600
  },
  normal: {
    label: 'NORMAL',
    goal: 'Longer jumps and more holes',
    winOffset: 8600
  },
  hard: {
    label: 'HARD',
    goal: 'Hard jumps and bigger gaps',
    winOffset: 9600
  }
}

class Player {
  constructor() {
    this.speed = 10
    this.position = { x: 100, y: 100 }
    this.velocity = { x: 0, y: 0 }
    this.width = 66
    this.height = 150
    this.frames = 0

    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 66
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875
      }
    }

    this.currentSprite = this.sprites.stand.right
    this.currentCropWidth = 177
  }

  draw() {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update() {
    this.frames++

    if (
      this.frames > 28 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    ) {
      this.frames = 0
    } else if (
      this.frames > 28 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    ) {
      this.frames = 0
    }

    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity
    }
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

function createImage(imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}

function drawRoundedRect(x, y, width, height, radius) {
  c.beginPath()
  c.moveTo(x + radius, y)
  c.lineTo(x + width - radius, y)
  c.quadraticCurveTo(x + width, y, x + width, y + radius)
  c.lineTo(x + width, y + height - radius)
  c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  c.lineTo(x + radius, y + height)
  c.quadraticCurveTo(x, y + height, x, y + height - radius)
  c.lineTo(x, y + radius)
  c.quadraticCurveTo(x, y, x + radius, y)
  c.closePath()
}

function drawButton(button) {
  const locked = button.locked

  c.fillStyle = locked ? colors.locked : colors.blue
  drawRoundedRect(button.x, button.y, button.width, button.height, 14)
  c.fill()

  c.strokeStyle = locked ? '#64748b' : colors.white
  c.lineWidth = 3
  drawRoundedRect(button.x, button.y, button.width, button.height, 14)
  c.stroke()

  c.fillStyle = colors.white
  c.font = 'bold 20px Arial'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(
    button.text,
    button.x + button.width / 2,
    button.y + button.height / 2 - (locked ? 8 : 0)
  )

  if (locked) {
    c.font = '14px Arial'
    c.fillStyle = '#cbd5e1'
    c.fillText('LOCKED', button.x + button.width / 2, button.y + button.height / 2 + 15)
  }

  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
}

function isInsideButton(mouse, button) {
  return (
    mouse.x >= button.x &&
    mouse.x <= button.x + button.width &&
    mouse.y >= button.y &&
    mouse.y <= button.y + button.height
  )
}

function unlockNextMission() {
  if (selectedMission === unlockedMissionCount && unlockedMissionCount < totalMissions) {
    unlockedMissionCount++
    localStorage.setItem('unlockedMissionCount', unlockedMissionCount)
  }
}

function drawBackgroundOnly() {
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  const bg = createImage(background)
  const hill = createImage(hills)

  c.drawImage(bg, -1, -1)
  c.drawImage(hill, -1, -1)
}

function drawTitle(text, y) {
  c.fillStyle = colors.white
  c.font = 'bold 52px Arial'
  c.textAlign = 'center'
  c.fillText(text, canvas.width / 2, y)
  c.textAlign = 'left'
}

function drawStartScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawTitle('MARIO MISSION', 165)

  c.fillStyle = colors.white
  c.font = '24px Arial'
  c.textAlign = 'center'
  c.fillText('Point A to Point B', canvas.width / 2, 205)
  c.textAlign = 'left'

  drawButton(buttons.start)
  drawButton(buttons.help)
}

function drawHelpScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('HELP', 145)

  c.fillStyle = colors.white
  c.font = '28px Arial'
  c.textAlign = 'center'
  c.fillText('A - Move Left', canvas.width / 2, 235)
  c.fillText('D - Move Right', canvas.width / 2, 280)
  c.fillText('W - Jump', canvas.width / 2, 325)
  c.fillText('Reach the end of the level to win.', canvas.width / 2, 390)
  c.textAlign = 'left'
}

function drawMissionScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('SELECT MISSION', 125)

  missionButtons.forEach(button => {
    drawButton({
      ...button,
      locked: button.missionNumber > unlockedMissionCount
    })
  })

  c.fillStyle = colors.white
  c.font = '18px Arial'
  c.textAlign = 'center'
  c.fillText(
    `${unlockedMissionCount} / ${totalMissions} missions unlocked`,
    canvas.width / 2,
    520
  )
  c.textAlign = 'left'
}

function drawDifficultyScreen() {
  drawBackgroundOnly()

  c.fillStyle = colors.overlay
  c.fillRect(0, 0, canvas.width, canvas.height)

  drawButton(buttons.back)
  drawTitle('SELECT DIFFICULTY', 150)

  c.fillStyle = colors.white
  c.font = '22px Arial'
  c.textAlign = 'center'
  c.fillText(`Mission ${selectedMission}`, canvas.width / 2, 185)
  c.textAlign = 'left'

  drawButton(buttons.easy)
  drawButton(buttons.normal)
  drawButton(buttons.hard)
}

function drawWinScreen() {
  const difficulty = difficulties[selectedDifficulty]

  c.fillStyle = 'rgba(0, 0, 0, 0.58)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.fillStyle = colors.white
  c.font = 'bold 72px Arial'
  c.textAlign = 'center'
  c.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 45)

  c.font = '28px Arial'
  c.fillText(
    `MISSION ${selectedMission} ${difficulty.label} COMPLETE`,
    canvas.width / 2,
    canvas.height / 2 + 20
  )

  if (selectedMission < totalMissions) {
    c.font = '22px Arial'
    c.fillText(
      `MISSION ${selectedMission + 1} UNLOCKED`,
      canvas.width / 2,
      canvas.height / 2 + 58
    )
  }

  drawButton(buttons.restart)
  drawButton(buttons.menu)

  c.textAlign = 'left'
}

let platformImage = createImage(platform)
let platformSmallTallImage = createImage(platformSmallTall)

let player
let platforms = []
let genericObjects = []
let currentKey
let scrollOffset = 0

const keys = {
  right: { pressed: false },
  left: { pressed: false }
}

function createMissionPlatforms() {
  if (selectedDifficulty === 'easy') {
    return [
      new Platform({ x: -1, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width - 3, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 2 + 180, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 3 + 180, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 4 + 550, y: 390, image: platformImage }),
      new Platform({ x: platformImage.width * 5 + 550, y: 390, image: platformImage }),
      new Platform({ x: platformImage.width * 6 + 950, y: 470, image: platformImage }),
      new Platform({
        x: platformImage.width * 7 + 950,
        y: 270,
        image: platformSmallTallImage
      }),
      new Platform({ x: platformImage.width * 8 + 1250, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 9 + 1250, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 10 + 1650, y: 350, image: platformImage }),
      new Platform({ x: platformImage.width * 11 + 2050, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 12 + 2050, y: 470, image: platformImage }),
      new Platform({
        x: platformImage.width * 13 + 2350,
        y: 300,
        image: platformSmallTallImage
      }),
      new Platform({ x: platformImage.width * 14 + 2650, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 15 + 2650, y: 470, image: platformImage })
    ]
  }

  if (selectedDifficulty === 'normal') {
    return [
      new Platform({ x: -1, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width - 3, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 2 + 300, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 3 + 480, y: 405, image: platformImage }),
      new Platform({
        x: platformImage.width * 4 + 850,
        y: 290,
        image: platformSmallTallImage
      }),
      new Platform({ x: platformImage.width * 5 + 1200, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 6 + 1500, y: 380, image: platformImage }),
      new Platform({ x: platformImage.width * 7 + 1900, y: 470, image: platformImage }),
      new Platform({
        x: platformImage.width * 8 + 2150,
        y: 300,
        image: platformSmallTallImage
      }),
      new Platform({ x: platformImage.width * 9 + 2550, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 10 + 2900, y: 410, image: platformImage }),
      new Platform({ x: platformImage.width * 11 + 3300, y: 470, image: platformImage }),
      new Platform({ x: platformImage.width * 12 + 3650, y: 350, image: platformImage }),
      new Platform({ x: platformImage.width * 13 + 4100, y: 470, image: platformImage })
    ]
  }

  return [
    new Platform({ x: -1, y: 470, image: platformImage }),
    new Platform({ x: platformImage.width + 250, y: 420, image: platformImage }),
    new Platform({ x: platformImage.width * 2 + 650, y: 340, image: platformImage }),
    new Platform({
      x: platformImage.width * 3 + 1100,
      y: 260,
      image: platformSmallTallImage
    }),
    new Platform({ x: platformImage.width * 4 + 1500, y: 470, image: platformImage }),
    new Platform({ x: platformImage.width * 5 + 1950, y: 390, image: platformImage }),
    new Platform({
      x: platformImage.width * 6 + 2350,
      y: 280,
      image: platformSmallTallImage
    }),
    new Platform({ x: platformImage.width * 7 + 2800, y: 470, image: platformImage }),
    new Platform({ x: platformImage.width * 8 + 3250, y: 355, image: platformImage }),
    new Platform({ x: platformImage.width * 9 + 3700, y: 470, image: platformImage }),
    new Platform({
      x: platformImage.width * 10 + 4100,
      y: 270,
      image: platformSmallTallImage
    }),
    new Platform({ x: platformImage.width * 11 + 4550, y: 420, image: platformImage }),
    new Platform({ x: platformImage.width * 12 + 5000, y: 470, image: platformImage })
  ]
}

function init() {
  platformImage = createImage(platform)
  platformSmallTallImage = createImage(platformSmallTall)

  player = new Player()
  scrollOffset = 0

  keys.right.pressed = false
  keys.left.pressed = false
  currentKey = null

  platforms = createMissionPlatforms()

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background)
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills)
    })
  ]
}

function drawGameHud() {
  const difficulty = difficulties[selectedDifficulty]

  c.fillStyle = 'rgba(15, 47, 120, 0.82)'
  drawRoundedRect(20, 20, 315, 86, 14)
  c.fill()

  c.strokeStyle = colors.white
  c.lineWidth = 2
  drawRoundedRect(20, 20, 315, 86, 14)
  c.stroke()

  c.fillStyle = colors.white
  c.font = 'bold 20px Arial'
  c.fillText(`MISSION ${selectedMission} - ${difficulty.label}`, 38, 52)

  c.font = '16px Arial'
  c.fillText(difficulty.goal, 38, 80)
}

function playMission() {
  genericObjects.forEach(genericObject => {
    genericObject.draw()
  })

  platforms.forEach(platform => {
    platform.draw()
  })

  player.update()
  drawGameHud()

  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0

    if (keys.right.pressed) {
      scrollOffset += player.speed

      platforms.forEach(platform => {
        platform.position.x -= player.speed
      })

      genericObjects.forEach(genericObject => {
        genericObject.position.x -= player.speed * 0.66
      })
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed

      platforms.forEach(platform => {
        platform.position.x += player.speed
      })

      genericObjects.forEach(genericObject => {
        genericObject.position.x += player.speed * 0.66
      })
    }
  }

  platforms.forEach(platform => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >= platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0
    }
  })

  if (
    keys.right.pressed &&
    currentKey === 'right' &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.run.right
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (
    keys.left.pressed &&
    currentKey === 'left' &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.run.left
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (
    !keys.left.pressed &&
    currentKey === 'left' &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.left
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  } else if (
    !keys.right.pressed &&
    currentKey === 'right' &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.right
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }

  if (scrollOffset > difficulties[selectedDifficulty].winOffset) {
    unlockNextMission()
    gameState = 'won'
  }

  if (player.position.y > canvas.height) {
    init()
  }
}

function animate() {
  requestAnimationFrame(animate)

  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  if (gameState === 'start') {
    drawStartScreen()
    return
  }

  if (gameState === 'help') {
    drawHelpScreen()
    return
  }

  if (gameState === 'missions') {
    drawMissionScreen()
    return
  }

  if (gameState === 'difficulty') {
    drawDifficultyScreen()
    return
  }

  if (gameState === 'playing') {
    playMission()
    return
  }

  if (gameState === 'won') {
    genericObjects.forEach(genericObject => {
      genericObject.draw()
    })

    platforms.forEach(platform => {
      platform.draw()
    })

    player.draw()
    drawGameHud()
    drawWinScreen()
  }
}

init()
animate()

addEventListener('click', event => {
  const rect = canvas.getBoundingClientRect()
  const mouse = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (gameState === 'start') {
    if (isInsideButton(mouse, buttons.start)) {
      gameState = 'missions'
    } else if (isInsideButton(mouse, buttons.help)) {
      gameState = 'help'
    }
  } else if (gameState === 'help') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'start'
    }
  } else if (gameState === 'missions') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'start'
    }

    missionButtons.forEach(button => {
      const locked = button.missionNumber > unlockedMissionCount

      if (!locked && isInsideButton(mouse, button)) {
        selectedMission = button.missionNumber
        gameState = 'difficulty'
      }
    })
  } else if (gameState === 'difficulty') {
    if (isInsideButton(mouse, buttons.back)) {
      gameState = 'missions'
    } else if (isInsideButton(mouse, buttons.easy)) {
      selectedDifficulty = 'easy'
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.normal)) {
      selectedDifficulty = 'normal'
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.hard)) {
      selectedDifficulty = 'hard'
      init()
      gameState = 'playing'
    }
  } else if (gameState === 'won') {
    if (isInsideButton(mouse, buttons.restart)) {
      init()
      gameState = 'playing'
    } else if (isInsideButton(mouse, buttons.menu)) {
      init()
      gameState = 'start'
    }
  }
})

addEventListener('keydown', ({ keyCode, repeat }) => {
  if (repeat) return

  switch (keyCode) {
    case 65:
      if (gameState === 'playing') {
        keys.left.pressed = true
        currentKey = 'left'
      }
      break

    case 68:
      if (gameState === 'playing') {
        keys.right.pressed = true
        currentKey = 'right'
      }
      break

    case 87:
      if (gameState === 'playing' && player.velocity.y === 0) {
        player.velocity.y = -15
      }
      break

    case 82:
      if (gameState === 'won') {
        init()
        gameState = 'playing'
      }
      break

    case 27:
      if (gameState === 'help' || gameState === 'missions') {
        gameState = 'start'
      } else if (gameState === 'difficulty') {
        gameState = 'missions'
      }
      break
  }
})

addEventListener('keyup', ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      keys.left.pressed = false
      break

    case 68:
      keys.right.pressed = false
      break
  }
})