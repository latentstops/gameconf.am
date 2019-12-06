/**
 * ES6 Promise Wrapper for threejs Loaders
 *
 * usage:
 *
 * import { promiseLoad, promiseParse } from 'loaderPromise'
 *
 * let gltfLoader = new GLTFLoader()
 * let gltf = await promiseParse(gltfLoader, gltfJSON, '')
 *
 * or
 *
 * let envMapLoader = new CubeTextureLoader()
 * let envMap = await promiseLoad(envMapLoader, [...images])
 *
 * @param loader
 * @param fn
 * @param args
 * @returns {Promise<any>}
 */
let execute = function (loader, fn, ...args) {
    return new Promise((resolve, reject) => {
        // define callbacks
        let onComplete = (result) => {
            resolve(result)
        }
        let onProgress = () => {
            // in es6 wen can't handle progress :\
        }
        let onError = (error) => {
            reject(error)
        }
        let loaderCallbacks = fn === 'load' ? [onComplete, onProgress, onError] : [onComplete, onError]
        loader[fn].apply(loader, args.concat(loaderCallbacks))
    })
}

let promiseLoad = function (loader, ...args) {
    return execute.apply(null, [loader, 'load'].concat(args))
}

let promiseParse = function (loader, ...args) {
    return execute.apply(null, [loader, 'parse'].concat(args))
}

export { promiseLoad, promiseParse }
