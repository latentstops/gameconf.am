import ParticleMaterial from './ParticleMaterial'
import ParticleGeometry from './ParticleGeometry'
import { Points } from 'three-full/sources/objects/Points'

export default class Particles extends Points {
    constructor () {
        let geometry = new ParticleGeometry(1024, 1000)
        let material = new ParticleMaterial()

        super(geometry, material)
    }

    update (dt) {
        this.material.update(dt)
        // let speed = dt / 16 * 0.3
        // this.rotation.x += 0.001 * speed
        // this.rotation.z += 0.00065 * speed
        // this.rotation.y += 0.00035 * speed
    }
}
