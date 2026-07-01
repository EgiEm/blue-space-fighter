import { state } from './gameState.js'
import { isInsideButton } from './utils.js'
import { init } from './canvas.js'

/**
 * Initializes and registers mouse clicks and keyboard event listeners.
 */
export function setupInput() {
  addEventListener('click', event => {
    const rect = state.canvas.getBoundingClientRect()
    const mouse = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    if (state.gameState === 'start') {
      if (isInsideButton(mouse, state.buttons.start)) {
        state.gameState = 'missions'
      } else if (isInsideButton(mouse, state.buttons.help)) {
        state.gameState = 'help'
      }
    } else if (state.gameState === 'help') {
      if (isInsideButton(mouse, state.buttons.back)) {
        state.gameState = 'start'
      }
    } else if (state.gameState === 'missions') {
      if (isInsideButton(mouse, state.buttons.back)) {
        state.gameState = 'start'
      }

      state.missionButtons.forEach(button => {
        const locked = button.missionNumber > state.unlockedMissionCount

        if (!locked && isInsideButton(mouse, button)) {
          state.selectedMission = button.missionNumber
          state.gameState = 'difficulty'
        }
      })
    } else if (state.gameState === 'difficulty') {
      if (isInsideButton(mouse, state.buttons.back)) {
        state.gameState = 'missions'
      } else if (isInsideButton(mouse, state.buttons.easy)) {
        state.selectedDifficulty = 'easy'
        init()
        state.gameState = 'playing'
      } else if (isInsideButton(mouse, state.buttons.normal)) {
        state.selectedDifficulty = 'normal'
        init()
        state.gameState = 'playing'
      } else if (isInsideButton(mouse, state.buttons.hard)) {
        state.selectedDifficulty = 'hard'
        init()
        state.gameState = 'playing'
      }
    } else if (state.gameState === 'won') {
      if (isInsideButton(mouse, state.buttons.restart)) {
        init()
        state.gameState = 'playing'
      } else if (isInsideButton(mouse, state.buttons.menu)) {
        init()
        state.gameState = 'start'
      }
    }
  })

  addEventListener('keydown', ({ keyCode, repeat }) => {
    if (repeat) return

    switch (keyCode) {
      case 65:
        if (state.gameState === 'playing') {
          state.keys.left.pressed = true
          state.currentKey = 'left'
        }
        break

      case 68:
        if (state.gameState === 'playing') {
          state.keys.right.pressed = true
          state.currentKey = 'right'
        }
        break

      case 87:
      case 32:
        if (state.gameState === 'playing' && state.player.canJump) {
          state.player.velocity.y = -15
          state.player.canJump = false
        }
        break

      case 82:
        if (state.gameState === 'won') {
          init()
          state.gameState = 'playing'
        }
        break

      case 27:
        if (state.gameState === 'help' || state.gameState === 'missions') {
          state.gameState = 'start'
        } else if (state.gameState === 'difficulty') {
          state.gameState = 'missions'
        }
        break
    }
  })

  addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
      case 65:
        state.keys.left.pressed = false
        break

      case 68:
        state.keys.right.pressed = false
        break
    }
  })
}
