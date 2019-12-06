<template>
    <div class="webgl--background">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
    import { WebGLRenderer } from 'three-full/sources/renderers/WebGLRenderer'
    import { Scene } from 'three-full/sources/scenes/Scene'
    import { PerspectiveCamera } from 'three-full/sources/cameras/PerspectiveCamera'

    import { Clock } from 'three-full/sources/core/Clock'
    import { Color } from 'three-full/sources/math/Color'
    import { Vector2 } from 'three-full/sources/math/Vector2'
    import { Vector3 } from 'three-full/sources/math/Vector3'

    import { Raycaster } from 'three-full/sources/core/Raycaster'

    import MouseListener from '@/utils/MouseListener'
    import Viewport from '@/mixins/Viewport'
    import RAF from '@/utils/RAF'

    import Particles from '@/3d/particles/Particles'


    import anime from 'animejs'


    // import variables from '../_variables.scss'

    // eslint-disable-next-line no-console

    const variables = {
        primaryColor: '#4df0e0',
        secondaryColor: '#48337b',
        neutralColor: '#f5f5f5',
        resolutionlg: 1400,
        resolutionmd: 1200,
        resolutionmlg: 1700,
        resolutionslg: 1500,
        resolutionsm: 992,
        resolutionxlg: 2000,
        resolutionxmlg: 1800,
        resolutionxs: 768,
        resolutionxxlg: 5000,

    };

    const SECTION_SPLASH = 1
    const SECTION_OTHER = 2

    export default {
        name: 'WebGLBackground',

        mixins: [Viewport],

        props: {
            mode: {
                type: String,
                required: false
            },

            section: {
                type: String,
                required: false
            }
        },

        mounted () {
            window.webglBackground = this;
            this.renderer = new WebGLRenderer({
                antialias: (this.viewPort.width > variables.resolutionsm),
                alpha: false,
                canvas: this.$refs['canvas']
            })

            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
            this.renderer.setSize(this.viewPort.width, this.viewPort.height)

            this.camera = new PerspectiveCamera(20, this.viewPort.width / this.viewPort.height, 1, 800)
            this.camera.position.z = 420

            this.clock = new Clock(true)

            this.scene = new Scene()
            this.scene.background = new Color(variables.secondaryColor)

            this._backgroundTweenColor = variables.secondaryColor
            this._particleTweenColor = variables.neutralColor

            this.px = 0
            this.py = 0

            this.setup()

            this.raycaster = new Raycaster()
            this.mouse = new Vector2()

            this._onMouseMove = this.onMouseMove.bind(this)

            MouseListener.add('move', this._onMouseMove)

            this.blockMouseRotation = false

            this.$events.$on('slider:mousedown', () => {
                this.blockMouseRotation = true
            })

            this.$events.$on('slider:mouseup', () => {
                this.blockMouseRotation = false
            })

        },

        activated () {
            RAF.add(this.render)
        },

        methods: {
            changeBackground (backgroundColor, particleColor) {
                anime({
                    targets: [this],
                    _backgroundTweenColor: backgroundColor,
                    duration: 500,
                    easing: 'easeOutQuad',
                    update: () => {
                        this.scene.background = new Color(this._backgroundTweenColor)
                    }
                })

                anime({
                    targets: [this],
                    _particleTweenColor: particleColor,
                    duration: 500,
                    easing: 'easeOutQuad',
                    update: () => {
                        this.particles.material.uniforms.color.value = new Color(this._particleTweenColor)
                    }
                })
            },

            step (step) {
                if (step === SECTION_SPLASH) {
                    this.changeBackground(variables.secondaryColor, variables.neutralColor)
                    this.scene.add(this.cube)

                    this._scrollPositionAnimation.reverse()
                    this._scrollPositionAnimation.completed = false
                    this._scrollPositionAnimation.play()

                    this._scrollScaleAnimation.reverse()
                    this._scrollScaleAnimation.completed = false
                    this._scrollScaleAnimation.play()

                    this._scrollRotationAnimation.reverse()
                    this._scrollRotationAnimation.completed = false
                    this._scrollRotationAnimation.play()
                }

                if (step === SECTION_OTHER) {
                    this.changeBackground(variables.neutralColor, variables.secondaryColor)

                    if (this._scrollPositionAnimation) {
                        if (this._scrollPositionAnimation.reversed) this._scrollPositionAnimation.reverse()
                        this._scrollPositionAnimation.play()
                    }

                    if (this._scrollScaleAnimation) {
                        if (this._scrollScaleAnimation.reversed) this._scrollScaleAnimation.reverse()
                        this._scrollScaleAnimation.play()
                    }

                    if (this._scrollRotationAnimation) {
                        if (this._scrollRotationAnimation.reversed) this._scrollRotationAnimation.reverse()
                        this._scrollRotationAnimation.play()
                    }
                }
            },



            async setup () {
                /* mesh */

                /* eslint-disable */
                let vertexShaderContent = `
        precision mediump float;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 scale;

        attribute vec2 uv;
        varying vec2 vUv;

        attribute vec3 position;

        void main()	{
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `

                let fragmentShaderContent = `
        precision mediump float;
        precision mediump int;

        uniform sampler2D map;
        varying vec2 vUv;

        void main()	{
          gl_FragColor = texture2D(map, vUv);
        }
      `


                /* particles */

                this.particles = new Particles()
                this.scene.add(this.particles);


                /* lights */

                this.animating = true

                this.prevIntersect = ''
            },

            resize (w, h) {
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
                this.renderer.setSize(w, h)
                this.camera.aspect = w / h
                this.camera.updateProjectionMatrix()
            },

            onMouseMove (e) {
                let pX = e.clientX - this.viewPort.width * 0.5
                let pY = e.clientY - this.viewPort.height * 0.5

                this.px = pX
                this.py = pY

                this.mouse.x = (e.clientX / this.viewPort.width) * 2 - 1
                this.mouse.y = -(e.clientY / this.viewPort.height) * 2 + 1
            },

            render () {
                const delta = this.clock.getDelta()

                let smoothing = 0.05
                let attenuation = 0.25

                if (this.viewPort.width > variables.resolutionsm && !this.blockMouseRotation) {
                    if (this.mode === 'other') {
                        this.camera.position.x += (this.px * (attenuation / 4) - this.camera.position.x) * smoothing
                        this.camera.position.y += (-this.py * (attenuation / 4) - this.camera.position.y) * smoothing
                    } else {
                        this.camera.position.x += (this.px * attenuation - this.camera.position.x) * smoothing
                        this.camera.position.y += (-this.py * attenuation - this.camera.position.y) * smoothing
                    }

                    this.camera.lookAt(new Vector3(0, 0, 0))
                }

                if (this.cube && this.mode === 'splash') {
                    this.raycaster.setFromCamera(this.mouse, this.camera)

                    let intersects = this.raycaster.intersectObjects(this.cube.children)

                    if (intersects.length && !this.animating && this.prevIntersect !== intersects[0].object.name) {
                        this.prevIntersect = intersects[0].object.name
                        this.animating = true

                        anime({
                            targets: [this.staggerArrayRotation],
                            z: '+=' + Math.PI,
                            duration: 950,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(13, { easing: 'easeInOutQuad', from: parseInt(intersects[0].object.name) }),
                            complete: () => {
                                this.animating = false
                            }
                        })
                    }
                }

                if (this.particles) {
                    this.particles.update(delta)
                }

                this.renderer.render(this.scene, this.camera)
            }
        },

        watch: {
            viewPort () {
                this.resize(this.viewPort.width, this.viewPort.height)
            },

            mode () {
                switch (this.mode) {
                    case 'splash':
                        this.step(1)
                        break
                    case 'other':
                        this.step(2)
                        break
                    default:
                        this.step(2)
                }
            },

            section () {
                switch (this.section) {
                    case 'intro':
                        this.changeBackground(variables.neutralColor, variables.secondaryColor)
                        break
                    case 'tickets':
                        this.changeBackground(variables.secondaryColor, variables.neutralColor)
                        break
                    case 'venue':
                        this.changeBackground(variables.neutralColor, variables.secondaryColor)
                        break
                    case 'contact':
                        this.changeBackground(variables.secondaryColor, variables.neutralColor)
                        break
                }
            }
        },

        deactivated () {
            RAF.remove(this.render)

            this.$events.$off('slider:mousedown')
            this.$events.$off('slider:mouseup')
        },

        beforeDestroy () {
            this.$events.$off('slider:mousedown')
            this.$events.$off('slider:mouseup')
        }
    }
</script>
<style scoped lang="scss">

</style>