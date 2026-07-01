import { state } from '../gameState.js'

export class Bullet {
  constructor({ x, y, speed, fromBoss = false }) {
    this.position = { x, y }
    this.width = fromBoss ? 22 : 14
    this.height = fromBoss ? 22 : 6
    this.speed = speed
    this.fromBoss = fromBoss
    this.active = true
  }

  update() {
    this.position.x += this.speed

    if (this.position.x < -100 || this.position.x > state.canvas.width + 100) {
      this.active = false
    }

    state.c.fillStyle = this.fromBoss ? '#ef4444' : '#facc15'

    if (this.fromBoss) {
      state.c.beginPath()
      state.c.arc(this.position.x, this.position.y, this.width / 2, 0, Math.PI * 2)
      state.c.fill()
    } else {
      state.c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
  }
}
