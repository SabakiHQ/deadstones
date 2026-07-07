// Hand-written loader + marshalling glue for the wasm-bindgen output.
//
// We don't ship wasm-pack's generated `deadstones.js`, because that file only
// works in one environment at a time (the `nodejs` target reads the binary with
// `fs.readFileSync`; the `web` target only fetches). This package needs to work
// in Node *and* in a browser/Electron bundle, so we load the raw
// `deadstones_bg.wasm` ourselves.
//
// `loadWasm(fetchPath)` loads lazily (on the first guess()/etc. call, not on
// import) and caches the instance. When a `fetchPath` is given via useFetch() it
// loads with `fetch` and never touches `fs`, so bundling for the browser doesn't
// hit the `require('fs')` path at runtime (issue #1). With no fetchPath it reads
// the binary from disk, keeping out-of-the-box Node support. (Lazy/fetch-first
// design from @adamreisnz's PR #9.)
//
// The `make()` marshalling below mirrors the code wasm-pack emits for the four
// exported functions. It's tied to the wasm-bindgen ABI, so when wasm-bindgen is
// upgraded, rebuild (`npm run build`) and re-sync this file against the
// regenerated `wasm/deadstones.js`.

const make = wasm => {
    let result = {}

    let WASM_VECTOR_LEN = 0

    let cachegetUint8Memory = null
    function getUint8Memory() {
        if (cachegetUint8Memory === null || cachegetUint8Memory.byteLength === 0) {
            cachegetUint8Memory = new Uint8Array(wasm.memory.buffer)
        }
        return cachegetUint8Memory
    }

    function passArray8ToWasm(arg) {
        const ptr = wasm.__wbindgen_malloc(arg.length * 1, 1) >>> 0
        getUint8Memory().set(arg, ptr / 1)
        WASM_VECTOR_LEN = arg.length
        return ptr
    }

    let cachegetUint32Memory = null
    function getUint32Memory() {
        if (cachegetUint32Memory === null || cachegetUint32Memory.byteLength === 0) {
            cachegetUint32Memory = new Uint32Array(wasm.memory.buffer)
        }
        return cachegetUint32Memory
    }

    function getArrayU32FromWasm(ptr, len) {
        ptr = ptr >>> 0
        return getUint32Memory().subarray(ptr / 4, ptr / 4 + len)
    }

    let cachegetFloat32Memory = null
    function getFloat32Memory() {
        if (cachegetFloat32Memory === null || cachegetFloat32Memory.byteLength === 0) {
            cachegetFloat32Memory = new Float32Array(wasm.memory.buffer)
        }
        return cachegetFloat32Memory
    }

    function getArrayF32FromWasm(ptr, len) {
        ptr = ptr >>> 0
        return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len)
    }

    let cachegetInt8Memory = null
    function getInt8Memory() {
        if (cachegetInt8Memory === null || cachegetInt8Memory.byteLength === 0) {
            cachegetInt8Memory = new Int8Array(wasm.memory.buffer)
        }
        return cachegetInt8Memory
    }

    function getArrayI8FromWasm(ptr, len) {
        ptr = ptr >>> 0
        return getInt8Memory().subarray(ptr / 1, ptr / 1 + len)
    }

    /**
    * @param {Int8Array} data
    * @param {number} width
    * @param {boolean} finished
    * @param {number} iterations
    * @param {number} seed
    * @returns {Uint32Array}
    */
    result.guess = function(data, width, finished, iterations, seed) {
        const ptr0 = passArray8ToWasm(data)
        const len0 = WASM_VECTOR_LEN
        const ret = wasm.guess(ptr0, len0, width, finished, iterations, seed)
        const v = getArrayU32FromWasm(ret[0], ret[1]).slice()
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
        return v
    }

    /**
    * @param {Int8Array} data
    * @param {number} width
    * @param {number} iterations
    * @param {number} seed
    * @returns {Float32Array}
    */
    result.getProbabilityMap = function(data, width, iterations, seed) {
        const ptr0 = passArray8ToWasm(data)
        const len0 = WASM_VECTOR_LEN
        const ret = wasm.getProbabilityMap(ptr0, len0, width, iterations, seed)
        const v = getArrayF32FromWasm(ret[0], ret[1]).slice()
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
        return v
    }

    /**
    * @param {Int8Array} data
    * @param {number} width
    * @param {number} sign
    * @param {number} seed
    * @returns {Int8Array}
    */
    result.playTillEnd = function(data, width, sign, seed) {
        const ptr0 = passArray8ToWasm(data)
        const len0 = WASM_VECTOR_LEN
        const ret = wasm.playTillEnd(ptr0, len0, width, sign, seed)
        const v = getArrayI8FromWasm(ret[0], ret[1]).slice()
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
        return v
    }

    /**
    * @param {Int8Array} data
    * @param {number} width
    * @returns {Uint32Array}
    */
    result.getFloatingStones = function(data, width) {
        const ptr0 = passArray8ToWasm(data)
        const len0 = WASM_VECTOR_LEN
        const ret = wasm.getFloatingStones(ptr0, len0, width)
        const v = getArrayU32FromWasm(ret[0], ret[1]).slice()
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
        return v
    }

    return result
}

let loadedWasm = null

module.exports.loadWasm = async function(fetchPath) {
    // Cached after the first load.
    if (loadedWasm) return loadedWasm

    // Assigned once the module is instantiated; the import closure below reads it
    // lazily, so it's populated by the time `__wbindgen_start()` runs.
    let wasm

    const imports = {
        './deadstones_bg.js': {
            __wbindgen_init_externref_table() {
                const table = wasm.__wbindgen_externrefs
                const offset = table.grow(4)
                table.set(0, undefined)
                table.set(offset + 0, undefined)
                table.set(offset + 1, null)
                table.set(offset + 2, true)
                table.set(offset + 3, false)
            }
        }
    }

    let instance

    if (fetchPath) {
        // Browser / explicit path: fetch, never touch `fs`.
        const response = await fetch(fetchPath)

        try {
            instance = (await WebAssembly.instantiateStreaming(response, imports)).instance
        } catch (err) {
            const buffer = await response.arrayBuffer()
            instance = (await WebAssembly.instantiate(buffer, imports)).instance
        }
    } else {
        // Node: read the binary next to this package.
        const {join} = require('path')
        const {readFile} = require('fs')

        const buffer = await new Promise((resolve, reject) =>
            readFile(join(__dirname, '..', 'wasm', 'deadstones_bg.wasm'), (err, buffer) => {
                if (err) return reject(err)
                resolve(buffer)
            })
        )

        instance = (await WebAssembly.instantiate(buffer, imports)).instance
    }

    wasm = instance.exports
    wasm.__wbindgen_start()

    return loadedWasm = make(wasm)
}
