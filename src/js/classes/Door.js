import { state } from '../gameState.js'
import { drawRoundedRect } from '../utils.js'

export class Door {
  constructor({ x, y }) {
    this.position = { x, y }
    this.width = 78
    this.height = 118
    this.open = false
  }

  draw() {
    state.c.fillStyle = this.open ? '#22c55e' : '#475569'
    drawRoundedRect(state.c, this.position.x, this.position.y, this.width, this.height, 10)
    state.c.fill()

    state.c.strokeStyle = '#f8fafc'
    state.c.lineWidth = 4
    drawRoundedRect(state.c, this.position.x, this.position.y, this.width, this.height, 10)
    state.c.stroke()

    state.c.fillStyle = '#facc15'
    state.c.beginPath()
    state.c.arc(this.position.x + 58, this.position.y + 62, 5, 0, Math.PI * 2)
    state.c.fill()

    state.c.fillStyle = '#ffffff'
    state.c.font = 'bold 14px Arial'
    state.c.fillText(this.open ? 'ENTER' : 'LOCKED', this.position.x + 9, this.position.y - 10)
  }
}
