const {loadWasm} = require('./wasm')

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

let fetchPath = null

const useFetch = function(path) {
    fetchPath = path

    return module.exports
}

const guess = async function(data, {finished = false, iterations = 100} = {}) {
    let wasm = await loadWasm(fetchPath)
    let {newData, width} = parseBoard(data)
    let indices = wasm.guess(newData, width, finished, iterations, Date.now())

    return parseVertices(indices, width)
}

const playTillEnd = async function(data, sign) {
    let wasm = await loadWasm(fetchPath)
    let {newData, width} = parseBoard(data)
    let values = wasm.playTillEnd(newData, width, sign, Date.now())

    return parseGrid(values, width)
}

const getProbabilityMap = async function(data, iterations) {
    let wasm = await loadWasm(fetchPath)
    let {newData, width} = parseBoard(data)
    let values = wasm.getProbabilityMap(newData, width, iterations, Date.now())

    return parseGrid(values, width)
}

const getFloatingStones = async function(data) {
    let wasm = await loadWasm(fetchPath)
    let {newData, width} = parseBoard(data)
    let indices = wasm.getFloatingStones(newData, width)

    return parseVertices(indices, width)
}

module.exports = {
    useFetch,
    guess,
    playTillEnd,
    getProbabilityMap,
    getFloatingStones
}
