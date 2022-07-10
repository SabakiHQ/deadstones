import { dirname } from 'path'
import { fileURLToPath } from 'url'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url));

const make = wasm => {
    let result = {}

    let cachegetUint8Memory = null;
    function getUint8Memory() {
        if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory;
    }

    let WASM_VECTOR_LEN = 0;

    function passArray8ToWasm(arg) {
        const ptr = wasm.__wbindgen_malloc(arg.length * 1);
        getUint8Memory().set(arg, ptr / 1);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    let cachegetInt32Memory = null;
    function getInt32Memory() {
        if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
            cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
        }
        return cachegetInt32Memory;
    }

    let cachegetUint32Memory = null;
    function getUint32Memory() {
        if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
            cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
        }
        return cachegetUint32Memory;
    }

    function getArrayU32FromWasm(ptr, len) {
        return getUint32Memory().subarray(ptr / 4, ptr / 4 + len);
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
        const retptr = 8;
        const ret = wasm.guess(retptr, passArray8ToWasm(data), WASM_VECTOR_LEN, width, finished, iterations, seed);
        const memi32 = getInt32Memory();
        const v0 = getArrayU32FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 4);
        return v0;
    };

    let cachegetFloat32Memory = null;
    function getFloat32Memory() {
        if (cachegetFloat32Memory === null || cachegetFloat32Memory.buffer !== wasm.memory.buffer) {
            cachegetFloat32Memory = new Float32Array(wasm.memory.buffer);
        }
        return cachegetFloat32Memory;
    }

    function getArrayF32FromWasm(ptr, len) {
        return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len);
    }
    /**
    * @param {Int8Array} data
    * @param {number} width
    * @param {number} iterations
    * @param {number} seed
    * @returns {Float32Array}
    */
    result.getProbabilityMap = function(data, width, iterations, seed) {
        const retptr = 8;
        const ret = wasm.getProbabilityMap(retptr, passArray8ToWasm(data), WASM_VECTOR_LEN, width, iterations, seed);
        const memi32 = getInt32Memory();
        const v0 = getArrayF32FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 4);
        return v0;
    };

    let cachegetInt8Memory = null;
    function getInt8Memory() {
        if (cachegetInt8Memory === null || cachegetInt8Memory.buffer !== wasm.memory.buffer) {
            cachegetInt8Memory = new Int8Array(wasm.memory.buffer);
        }
        return cachegetInt8Memory;
    }

    function getArrayI8FromWasm(ptr, len) {
        return getInt8Memory().subarray(ptr / 1, ptr / 1 + len);
    }
    /**
    * @param {Int8Array} data
    * @param {number} width
    * @param {number} sign
    * @param {number} seed
    * @returns {Int8Array}
    */
    result.playTillEnd = function(data, width, sign, seed) {
        const retptr = 8;
        const ret = wasm.playTillEnd(retptr, passArray8ToWasm(data), WASM_VECTOR_LEN, width, sign, seed);
        const memi32 = getInt32Memory();
        const v0 = getArrayI8FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
        return v0;
    };

    /**
    * @param {Int8Array} data
    * @param {number} width
    * @returns {Uint32Array}
    */
    result.getFloatingStones = function(data, width) {
        const retptr = 8;
        const ret = wasm.getFloatingStones(retptr, passArray8ToWasm(data), WASM_VECTOR_LEN, width);
        const memi32 = getInt32Memory();
        const v0 = getArrayU32FromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
        wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 4);
        return v0;
    };

    return result
}

const imports = {}

module.exports = exports = (async () => {
    let wasm

    try {
        const {join} = require('path')
        const {readFile} = require('fs')

        let buffer = await new Promise((resolve, reject) =>
            readFile(join(__dirname, '..', 'wasm', 'deadstones_bg.wasm'), (err, buffer) => {
                if (err) return reject(err)
                resolve(buffer)
            })
        )

        wasm = await WebAssembly.instantiate(buffer, imports)
    } catch (err) {
        let response = await fetch(exports.fetchPath)

        try {
            wasm = await WebAssembly.instantiateStreaming(response, imports)
        } catch (err) {
            let buffer = await response.arrayBuffer()
            wasm = await WebAssembly.instantiate(buffer, imports)
        }
    }

    return make(wasm.instance.exports)
})()

exports.fetchPath = null
