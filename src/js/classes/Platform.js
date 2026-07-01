import { state } from '../gameState.js'

export class Platform {
  constructor({ x, y, image }) {
    this.position = { x, y }
    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    state.c.drawImage(this.image, this.position.x, this.position.y)
  }
}
