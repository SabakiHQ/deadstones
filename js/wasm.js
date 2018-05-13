const make = wasm => {
    let result = {}

    let cachegetUint8Memory = null;
    function getUint8Memory() {
        if (cachegetUint8Memory === null ||
            cachegetUint8Memory.buffer !== wasm.memory.buffer)
            cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
        return cachegetUint8Memory;
    }

    let cachegetUint64Memory = null;
    function getUint64Memory() {
        if (cachegetUint64Memory === null ||
            cachegetUint64Memory.buffer !== wasm.memory.buffer)
            cachegetUint64Memory = new BigUint64Array(wasm.memory.buffer);
        return cachegetUint64Memory;
    }

    function passArray8ToWasm(arg) {
        const ptr = wasm.__wbindgen_malloc(arg.length * 1);
        getUint8Memory().set(arg, ptr / 1);
        return [ptr, arg.length];
    }

    let cachegetUint32Memory = null;
    function getUint32Memory() {
        if (cachegetUint32Memory === null ||
            cachegetUint32Memory.buffer !== wasm.memory.buffer)
            cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
        return cachegetUint32Memory;
    }

    function getArrayU32FromWasm(ptr, len) {
        return getUint32Memory().subarray(ptr / 4, ptr / 4 + len);
    }

    let cachedGlobalArgumentPtr = null;
    function globalArgumentPtr() {
        if (cachedGlobalArgumentPtr === null)
            cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
        return cachedGlobalArgumentPtr;
    }

    result.guess = function(arg0, arg1, arg2, arg3, arg4) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.guess(retptr, ptr0, len0, arg1, arg2 ? 1 : 0, arg3, arg4);
        const mem = getUint32Memory();
        const ptr = mem[retptr / 4];
        const len = mem[retptr / 4 + 1];
        const realRet = getArrayU32FromWasm(ptr, len);
        wasm.__wbindgen_free(ptr, len * 4);
        return realRet;
    };

    let cachegetFloat32Memory = null;
    function getFloat32Memory() {
        if (cachegetFloat32Memory === null ||
            cachegetFloat32Memory.buffer !== wasm.memory.buffer)
            cachegetFloat32Memory = new Float32Array(wasm.memory.buffer);
        return cachegetFloat32Memory;
    }

    function getArrayF32FromWasm(ptr, len) {
        return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len);
    }

    result.get_probability_map = function(arg0, arg1, arg2, arg3) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.get_probability_map(retptr, ptr0, len0, arg1, arg2, arg3);
        const mem = getUint32Memory();
        const ptr = mem[retptr / 4];
        const len = mem[retptr / 4 + 1];
        const realRet = getArrayF32FromWasm(ptr, len);
        wasm.__wbindgen_free(ptr, len * 4);
        return realRet;
    };

    let cachegetInt8Memory = null;
    function getInt8Memory() {
        if (cachegetInt8Memory === null ||
            cachegetInt8Memory.buffer !== wasm.memory.buffer)
            cachegetInt8Memory = new Int8Array(wasm.memory.buffer);
        return cachegetInt8Memory;
    }

    function getArrayI8FromWasm(ptr, len) {
        return getInt8Memory().subarray(ptr / 1, ptr / 1 + len);
    }

    result.play_till_end = function(arg0, arg1, arg2, arg3) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.play_till_end(retptr, ptr0, len0, arg1, arg2, arg3);
        const mem = getUint32Memory();
        const ptr = mem[retptr / 4];
        const len = mem[retptr / 4 + 1];
        const realRet = getArrayI8FromWasm(ptr, len);
        wasm.__wbindgen_free(ptr, len * 1);
        return realRet;
    };

    result.get_floating_stones = function(arg0, arg1) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
        const retptr = globalArgumentPtr();
        wasm.get_floating_stones(retptr, ptr0, len0, arg1);
        const mem = getUint32Memory();
        const ptr = mem[retptr / 4];
        const len = mem[retptr / 4 + 1];
        const realRet = getArrayU32FromWasm(ptr, len);
        wasm.__wbindgen_free(ptr, len * 4);
        return realRet;
    };

    const TextDecoder2 = typeof TextDecoder === 'undefined' ? require('util').TextDecoder : TextDecoder;

    let cachedDecoder = new TextDecoder2('utf-8');

    function getStringFromWasm(ptr, len) {
        return cachedDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
    }

    result.__wbindgen_throw = function(ptr, len) {
        throw new Error(getStringFromWasm(ptr, len));
    };

    return result
}

module.exports = Promise.resolve().then(() => {
    const {join} = require('path');
    const {readFileSync} = require('fs');
    const buffer = readFileSync(join(__dirname, '..', 'wasm', 'deadstones_bg.wasm'));

    return WebAssembly.instantiate(buffer, {'./deadstones': make()});
}).then(module => make(module.instance.exports))
