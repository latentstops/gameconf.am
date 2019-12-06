import { RawShaderMaterial } from 'three-full/sources/materials/RawShaderMaterial'
import { Vector4 } from 'three-full/sources/math/Vector4'
import { Color } from 'three-full/sources/math/Color'
import { TextureLoader } from 'three-full/sources/loaders/TextureLoader'

import ParticleTexture from '@/assets/texture/particle2.png'
import variables from '../../_variables.scss'

const ParticlesFs = `
precision highp float;

uniform sampler2D map;
uniform vec4 offsetRepeat;
uniform vec3 color;

void main() {
  gl_FragColor = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );
  gl_FragColor.rgb *= color.rgb;
}`

const ParticlesVs = `
uniform float time;
uniform float size;
uniform float scale;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float pulseSpeed;
attribute float orbitSpeed;
attribute float orbitSize;

void main() {

  vec3 animatedPosition = position;

  animatedPosition.x += sin(time * orbitSpeed) * orbitSize;
  animatedPosition.y += cos(time * orbitSpeed) * orbitSize;
  animatedPosition.z += cos(time * orbitSpeed) * orbitSize;

  vec3 transformed = vec3( animatedPosition );
  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

  gl_Position =  projectionMatrix * mvPosition;

  float animatedSize = size * ( scale / - mvPosition.z );

  animatedSize *= 1.0 + sin(time * pulseSpeed);

  gl_PointSize = animatedSize;
}`

export default class InstancedMaterial extends RawShaderMaterial {
    constructor (parameters = {}) {
        parameters.fragmentShader =
            parameters.fragmentShader || ParticlesFs
        parameters.vertexShader =
            parameters.vertexShader || ParticlesVs
        parameters.uniforms = parameters.uniforms || {}

        parameters.uniforms.scale = { type: 'f', value: 100.0 }
        parameters.uniforms.size = { type: 'f', value: 25 }
        parameters.uniforms.time = { type: 'f', value: 0 }
        parameters.uniforms.offsetRepeat = {
            type: 'v4',
            value: new Vector4(0, 0, 1, 1)
        }
        parameters.uniforms.map = {
            type: 't',
            value: new TextureLoader().load(ParticleTexture)
        }
        parameters.uniforms.color = { type: 'c', value: new Color(variables.neutralColor) }

        parameters.blending = 1 // additive
        parameters.depthWrite = false
        parameters.transparent = true

        super(parameters)
        this.type = 'ParticleMaterial'
    }

    update (dt) {
        this.uniforms.time.value += dt
    }
}

export { InstancedMaterial }
