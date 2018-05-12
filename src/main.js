const lib = require('../wasm/deadstones')

const parseBoard = data => [
    data.reduce((acc, x) => (acc.push(...x), acc), []),
    data.length > 0 ? data[0].length : 0
]

const parseVertices = (indices, width) => [...indices].map(i => [i % width, Math.floor(i / width)])
const parseGrid = (values, width) => [...Array(values.length / width)]
    .map((_, y) => [...values].slice(y * width, (y + 1) * width))

exports.guess = function(data, {finished = false, iterations = 100} = {}) {
    let [newData, width] = parseBoard(data)
    let indices = lib.guess(newData, width, finished, iterations, Date.now())

    return parseVertices(indices, width)
}

exports.playTillEnd = function(data, sign) {
    let [newData, width] = parseBoard(data)
    let values = lib.play_till_end(newData, width, sign, Date.now())

    return parseGrid(values, width)
}

exports.getProbabilityMap = function(data, iterations) {
    let [newData, width] = parseBoard(data)
    let values = lib.get_probability_map(newData, width, iterations, Date.now())

    return parseGrid(values, width)
}

exports.getFloatingStones = function(data) {
    let [newData, width] = parseBoard(data)
    let indices = lib.get_floating_stones(newData, width)

    return parseVertices(indices, width)
}
