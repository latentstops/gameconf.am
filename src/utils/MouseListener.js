/**
 *
 *
 * @class MouseListener
 */

import throttle from 'lodash/throttle'

class MouseListener {
  /**
   * Creates an instance of MouseListener.
   *
   * @memberOf MouseListener
   */
  constructor () {
    this.listeners = {
      move: [],
      over: [],
      out: [],
      down: [],
      up: []
    }

    window.addEventListener('mousedown', throttle(this._onMouseDown.bind(this), 100), false)
    window.addEventListener('mousemove', throttle(this._onMouseMove.bind(this), 0), false)
    window.addEventListener('mouseover', throttle(this._onMouseOver.bind(this), 100), false)
    window.addEventListener('mouseup', throttle(this._onMouseUp.bind(this), 100), false)
    window.addEventListener('mouseout', throttle(this._onMouseOut.bind(this), 100), false)
  }
  /**
   *
   *
   * @param {any} listener
   *
   * @memberOf MouseListener
   */
  add (group, listener) {
    let index = this.listeners[group].indexOf(listener)

    if (index === -1) {
      this.listeners[group].push(listener)
    }
  }
  /**
   *
   *
   * @param {any} listener
   *
   * @memberOf MouseListener
   */
  remove (group, listener) {
    let index = this.listeners[group].indexOf(listener)

    if (index !== -1) {
      this.listeners[group].splice(index, 1)
    }
  }
  /**
   *
   *
   *
   * @memberOf MouseListener
   */
  _onMouseMove (e) {
    for (let i = 0; i < this.listeners.move.length; i++) {
      this.listeners.move[i](e)
    }
  }

  _onMouseOver (e) {
    for (let i = 0; i < this.listeners.over.length; i++) {
      this.listeners.over[i](e)
    }
  }

  _onMouseOut (e) {
    for (let i = 0; i < this.listeners.out.length; i++) {
      this.listeners.out[i](e)
    }
  }

  _onMouseDown (e) {
    for (let i = 0; i < this.listeners.down.length; i++) {
      this.listeners.down[i](e)
    }
  }

  _onMouseUp (e) {
    for (let i = 0; i < this.listeners.up.length; i++) {
      this.listeners.up[i](e)
    }
  }
}

export default new MouseListener()
