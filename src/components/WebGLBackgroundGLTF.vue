<template>
    <div class="webgl--background">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
    import { WebGLRenderer } from 'three-full/sources/renderers/WebGLRenderer'
    import { Scene } from 'three-full/sources/scenes/Scene'
    import { PerspectiveCamera } from 'three-full/sources/cameras/PerspectiveCamera'
    import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'
    import { Clock } from 'three-full/sources/core/Clock'
    import { Color } from 'three-full/sources/math/Color'
    import { Vector2 } from 'three-full/sources/math/Vector2'
    import { Vector3 } from 'three-full/sources/math/Vector3'
    import { GLTFLoader } from 'three-full/sources/loaders/GLTFLoader'
    import { DRACOLoader } from 'three-full/sources/loaders/DRACOLoader'
    import { Raycaster } from 'three-full/sources/core/Raycaster'
    import { FrontSide } from 'three-full/sources/constants'
    import { TextureLoader } from 'three-full/sources/loaders/TextureLoader'
    import { promiseLoad, promiseParse } from '@/3d/utils/loaderPromise'
    import { RawShaderMaterial } from 'three-full/sources/materials/RawShaderMaterial'
    // import { Mesh } from 'three-full/sources/objects/Mesh'
    import { to } from 'await-to-js'

    import MouseListener from '@/utils/MouseListener'
    import Viewport from '@/mixins/Viewport'
    import RAF from '@/utils/RAF'

    import Particles from '@/3d/particles/Particles'

    import GradientTexture from '@/assets/texture/gradient-texture.jpg'

    import anime from 'animejs'
    import sortBy from 'lodash/sortBy'

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

            loadGLTF (file) {
                return new Promise(async (resolve, reject) => {
                    if (file) {
                        let gltfFile
                        if (typeof file === 'function') {
                            let error
                            [error, gltfFile] = await to(file())
                            if (error) {
                                reject(error)
                                return
                            }
                            gltfFile = gltfFile.default
                        } else {
                            gltfFile = file
                        }
                        let loader = new GLTFLoader()
                        // window.require = require
                        window.DRACOLoader = DRACOLoader
                        DRACOLoader.setDecoderPath('/static/js/libs/draco/gltf/')
                        DRACOLoader.setDecoderConfig({ type: 'js' })
                        loader.setDRACOLoader(new DRACOLoader())

                        if (gltfFile.indexOf('.glb') === gltfFile.length - 4) {
                            // load glb scene
                            let [error, gltf] = await to(promiseLoad(loader, gltfFile))
                            if (error) {
                                reject(error)
                                return
                            }
                            resolve(gltf)
                        } else {
                            // load gltf scene
                            let [error, gltf] = await to(promiseParse(loader, gltfFile, ''))
                            if (error) {
                                reject(error)
                                return
                            }
                            resolve(gltf)
                        }
                    } else {
                        reject(new Error('No GLTF specified'))
                    }
                })
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
                /* eslint-enable */

                let texture = new TextureLoader().load(GradientTexture)
                let material = null

                /* particles */

                this.particles = new Particles()
                this.scene.add(this.particles)

                if (this.viewPort.width >= variables.resolutionlg) {
                    material = new RawShaderMaterial({
                        uniforms: {
                            map: {
                                value: null,
                                type: 't'
                            }
                        },
                        vertexShader: vertexShaderContent,
                        fragmentShader: fragmentShaderContent,
                        side: FrontSide,
                        fog: false,
                        lights: false,
                        transparent: false
                    })
                } else {
                    material = new MeshBasicMaterial({
                        map: null,
                        side: FrontSide,
                        fog: false,
                        lights: false,
                        transparent: false
                    })
                }

                let gltf = await this.loadGLTF(() => import('@/3d/assets/gltf/ddd.gltf'))

                this.cube = gltf.scene.children[0]

                this.viewPort.width <= variables.resolutionsm
                    ? this.cube.scale.set(4, 4, 4)
                    : this.cube.scale.set(5, 5, 5)

                let pi2 = -Math.PI

                for (let i = 0; i < this.cube.children.length; i++) {
                    this.cube.children[i].material = material.clone()

                    if (this.viewPort.width >= variables.resolutionlg) {
                        this.cube.children[i].material.uniforms.map.value = texture
                        this.cube.children[i].material.uniforms.map.value.center = new Vector2(0.5, 0.5)
                        this.cube.children[i].material.uniforms.map.value.rotation = pi2 / (this.cube.children.length - 1) * (i / 2)
                    } else {
                        this.cube.children[i].material.map = texture
                        this.cube.children[i].material.map.center = new Vector2(0.5, 0.5)
                        this.cube.children[i].material.map.rotation = pi2 / (this.cube.children.length - 1) * (i / 2)
                    }
                }

                this.scene.add(this.cube)

                this.staggerArrayRotation = []
                this.staggerArrayScale = []
                this.staggerArrayPosition = []

                this.cube.children = sortBy(this.cube.children, (o) => parseInt(o.name))

                for (let i = 0; i < this.cube.children.length; i++) {
                    this.staggerArrayRotation.push(this.cube.children[i].rotation)
                    this.staggerArrayScale.push(this.cube.children[i].scale)
                    this.staggerArrayPosition.push(this.cube.children[i].position)
                }

                this._scrollPositionAnimation = anime({
                    targets: [this.staggerArrayPosition],
                    x: () => '*= ' + anime.random(-5, 5),
                    z: () => '*= ' + anime.random(-5, 5),
                    easing: 'easeOutQuart',
                    duration: 1200,
                    autoplay: false,
                    complete: () => {
                        if (this.mode === 'other') {
                            this.scene.remove(this.cube)
                        }
                    }
                })

                this._scrollScaleAnimation = anime({
                    targets: [this.staggerArrayScale],
                    x: 0.001,
                    y: 0.001,
                    z: 0.001,
                    easing: 'easeOutQuart',
                    duration: 1200,
                    autoplay: false
                })

                this._scrollRotationAnimation = anime({
                    targets: [this.staggerArrayRotation],
                    x: () => '+= ' + anime.random(-Math.PI * 4, Math.PI * 4),
                    y: () => '+= ' + anime.random(-Math.PI * 4, Math.PI * 4),
                    easing: 'easeOutQuart',
                    duration: 1200,
                    autoplay: false
                })

                anime({
                    targets: [this.staggerArrayRotation],
                    z: '+=' + Math.PI * 2,
                    duration: 1250,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(30, { easing: 'easeInOutQuad', from: 'center' })
                })

                anime({
                    targets: [this.staggerArrayScale],
                    x: [0.001, 1],
                    y: [0.001, 1],
                    z: [0.001, 1],
                    duration: 1250,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(30, { easing: 'easeInOutQuad', from: 'center' }),
                    complete: () => {
                        this.animating = false
                    }
                })

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