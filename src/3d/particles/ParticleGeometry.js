import { BufferGeometry } from 'three-full/sources/core/BufferGeometry'
import { BufferAttribute } from 'three-full/sources/core/BufferAttribute'

export default class ParticleGeometry extends BufferGeometry {
    constructor (count) {
        super()
        this.addAttributeFill('position', 3, -350, 350, count)
        this.addAttributeFill('aSize', 1, 4, 8, count)
        this.addAttributeFill('orbitSize', 1, -10.0, 10.0, count)
        this.addAttributeFill('orbitSpeed', 1, -2.0, 2.0, count)
        this.addAttributeFill('pulseSpeed', 1, -2.0, 2.0, count)
    }

    addAttributeFill (name, length, min, max, count) {
        let array = new Float32Array(count * length) // eslint-disable-line
        let k = 0

        for (let i = 0; i < count; i++) {
            k = i * length
            for (let j = 0; j < length; j++) {
                array[k + j] = Math.random() * (max - min) + min
            }
        }

        this.addAttribute(name, new BufferAttribute(array, length))

        this.attributes[name].needsUpdate = true
    }
}
