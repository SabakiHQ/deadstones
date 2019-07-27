const wasm = require('./wasm')

const parseBoard = data => ({
    newData: [].concat(...data),
    width: data.length > 0 ? data[0].length : 0
})

const parseVertices = (indices, width) => [...indices].map(i => {
    let x = i % width
    return [x, (i - x) / width]
})

const parseGrid = (values, width) => {
    return [...Array(values.length / width)].map((_, y) => {
        let start = y * width
        return [...Array(width)].map((_, x) => values[start + x])
    })
}

exports.useFetch = function(path) {
    wasm.fetchPath = path

    return exports
}

exports.guess = async function(data, {finished = false, iterations = 100} = {}) {
    let {newData, width} = parseBoard(data)
    let indices = (await wasm).guess(newData, width, finished, iterations, Date.now())

    return parseVertices(indices, width)
},

exports.playTillEnd = async function(data, sign) {
    let {newData, width} = parseBoard(data)
    let values = (await wasm).playTillEnd(newData, width, sign, Date.now())

    return parseGrid(values, width)
},

exports.getProbabilityMap = async function(data, iterations) {
    let {newData, width} = parseBoard(data)
    let values = (await wasm).getProbabilityMap(newData, width, iterations, Date.now())

    return parseGrid(values, width)
},

exports.getFloatingStones = async function(data) {
    let {newData, width} = parseBoard(data)
    let indices = (await wasm).getFloatingStones(newData, width)

    return parseVertices(indices, width)
}
