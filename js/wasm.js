const make = wasm => {
    let result = {}

    /* tslint:disable */
    var wasm;

    let cachegetUint8Memory = null;
    function getUint8Memory() {
        if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory;
    }

    function passArray8ToWasm(arg) {
        const ptr = wasm.__wbindgen_malloc(arg.length * 1);
        getUint8Memory().set(arg, ptr / 1);
        return [ptr, arg.length];
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

    let cachedGlobalArgumentPtr = null;
    function globalArgumentPtr() {
        if (cachedGlobalArgumentPtr === null) {
            cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
        }
        return cachedGlobalArgumentPtr;
    }
    /**
    * @param {Int8Array} arg0
    * @param {number} arg1
    * @param {boolean} arg2
    * @param {number} arg3
    * @param {number} arg4
    * @returns {Uint32Array}
    */
    result.guess = function(arg0, arg1, arg2, arg3, arg4) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.guess(retptr, ptr0, len0, arg1, arg2 ? 1 : 0, arg3, arg4);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU32FromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 4);
        return realRet;

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
    * @param {Int8Array} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @param {number} arg3
    * @returns {Float32Array}
    */
    result.get_probability_map = function(arg0, arg1, arg2, arg3) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.get_probability_map(retptr, ptr0, len0, arg1, arg2, arg3);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayF32FromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 4);
        return realRet;

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
    * @param {Int8Array} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @param {number} arg3
    * @returns {Int8Array}
    */
    result.play_till_end = function(arg0, arg1, arg2, arg3) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.play_till_end(retptr, ptr0, len0, arg1, arg2, arg3);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayI8FromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 1);
        return realRet;

    };

    /**
    * @param {Int8Array} arg0
    * @param {number} arg1
    * @returns {Uint32Array}
    */
    result.get_floating_stones = function(arg0, arg1) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.get_floating_stones(retptr, ptr0, len0, arg1);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU32FromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 4);
        return realRet;

    };

    const TextDecoder = require('util').TextDecoder;

    let cachedDecoder = new TextDecoder('utf-8');

    function getStringFromWasm(ptr, len) {
        return cachedDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
    }

    result.__wbindgen_throw = function(ptr, len) {
        throw new Error(getStringFromWasm(ptr, len));
    };

    return result
}

let importObj = {'./deadstones': make()}

module.exports = exports = new Promise((resolve, reject) => {
    const {join} = require('path')
    const {readFile} = require('fs')

    readFile(join(__dirname, '..', 'wasm', 'deadstones_bg.wasm'), (err, buffer) => {
        if (err) return reject(err)

        resolve(WebAssembly.instantiate(buffer, importObj))
    })
}).catch(() =>
    fetch(exports.fetchPath)
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.instantiate(buffer, importObj))
).then(module => make(module.instance.exports))

exports.fetchPath = null
