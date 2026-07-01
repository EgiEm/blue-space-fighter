import spriteRunLeft from '../../../img/spriteRunLeft.png'
import spriteRunRight from '../../../img/spriteRunRight.png'
import spriteStandLeft from '../../../img/spriteStandLeft.png'
import spriteStandRight from '../../../img/spriteStandRight.png'

import { state } from '../gameState.js'
import { createImage, drawRoundedRect } from '../utils.js'

export class Player {
  constructor() {
    this.speed = 8
    this.position = { x: 100, y: 100 }
    this.previousPosition = { x: 100, y: 100 }
    this.velocity = { x: 0, y: 0 }
    this.width = 66
    this.height = 150
    this.frames = 0
    this.canJump = false
    this.lives = 3
    this.hasWeapon = false
    this.ammo = 30
    this.maxAmmo = 30
    this.reloadTimer = 0
    this.shootTimer = 0

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

  drawWeapon() {
    const handX = this.position.x + this.width - 12
    const handY = this.position.y + 78
    const gunX = handX + 6
    const gunY = handY - 8

    state.c.save()

    // Arm / hand holding the gun
    state.c.fillStyle = '#f2c9a0'
    drawRoundedRect(state.c, handX - 12, handY - 2, 24, 12, 6)
    state.c.fill()

    state.c.fillStyle = '#d8a06f'
    drawRoundedRect(state.c, handX + 2, handY - 4, 16, 16, 6)
    state.c.fill()

    // Gun body
    state.c.fillStyle = '#111827'
    drawRoundedRect(state.c, gunX, gunY, 54, 16, 5)
    state.c.fill()

    // Top metal shine
    state.c.fillStyle = '#64748b'
    state.c.fillRect(gunX + 8, gunY + 3, 28, 3)

    // Barrel
    state.c.fillStyle = '#030712'
    state.c.fillRect(gunX + 50, gunY + 5, 24, 6)

    // Muzzle
    state.c.fillStyle = '#38bdf8'
    state.c.fillRect(gunX + 74, gunY + 4, 5, 8)

    // Grip
    state.c.fillStyle = '#374151'
    drawRoundedRect(state.c, gunX + 16, gunY + 13, 12, 25, 4)
    state.c.fill()

    // Stock
    state.c.fillStyle = '#1f2937'
    drawRoundedRect(state.c, gunX - 13, gunY + 4, 18, 12, 4)
    state.c.fill()

    // Sight
    state.c.strokeStyle = '#e5e7eb'
    state.c.lineWidth = 2
    state.c.beginPath()
    state.c.moveTo(gunX + 24, gunY)
    state.c.lineTo(gunX + 30, gunY - 8)
    state.c.lineTo(gunX + 38, gunY)
    state.c.stroke()

    state.c.restore()
  }

  draw() {
    state.c.drawImage(
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

    if (this.hasWeapon) this.drawWeapon()
  }

  update() {
    this.previousPosition.x = this.position.x
    this.previousPosition.y = this.position.y

    this.frames++

    if (this.frames > 28) this.frames = 0

    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= state.canvas.height) {
      this.velocity.y += state.gravity
      this.canJump = false
    } else {
      this.velocity.y = 0
      this.canJump = true
    }

    if (this.reloadTimer > 0) {
      this.reloadTimer--
      if (this.reloadTimer === 0) this.ammo = this.maxAmmo
    }

    if (this.shootTimer > 0) this.shootTimer--
  }
}
