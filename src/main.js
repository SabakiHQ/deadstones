const lib = require('../wasm/deadstones')
const parse = (x, f) => x.split(';').map(y => y.split(',').map(f))
const stringify = x => x.map(y => y.join(',')).join(';')

exports.guess = function(data, {finished = false, iterations = 50} = {}) {
    return parse(lib.guess(stringify(data), finished, iterations), x => +x)
}

exports.playTillEnd = function(data, sign) {
    return parse(lib.play_till_end(stringify(data), sign), x => +x)
}

exports.getProbabilityMap = function(data, iterations) {
    return parse(lib.get_probability_map(stringify(data), iterations), x => +x / 1000)
}

exports.getFloatingStones = function(data) {
    return parse(lib.get_floating_stones(stringify(data)), x => +x)
}
