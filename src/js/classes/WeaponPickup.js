import { state } from '../gameState.js'
import { drawRoundedRect } from '../utils.js'

export class WeaponPickup {
  constructor({ x, y }) {
    this.position = { x, y }
    this.width = 90
    this.height = 45
    this.collected = false
  }

  draw() {
    if (this.collected) return

    state.c.fillStyle = '#facc15'
    state.c.font = 'bold 18px Arial'
    state.c.fillText('M4', this.position.x + 20, this.position.y - 12)

    state.c.fillStyle = '#111827'
    drawRoundedRect(state.c, this.position.x, this.position.y + 10, 68, 12, 3)
    state.c.fill()

    state.c.fillStyle = '#374151'
    state.c.fillRect(this.position.x + 20, this.position.y + 22, 14, 20)
    state.c.fillRect(this.position.x + 52, this.position.y + 7, 32, 6)

    state.c.fillStyle = '#e5e7eb'
    state.c.fillRect(this.position.x + 6, this.position.y + 13, 12, 6)
  }
}
