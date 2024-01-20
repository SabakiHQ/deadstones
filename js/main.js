import {loadWasm} from './wasm.js'
let fetchPath = null

const parseBoard = data => ({
    newData: [].concat(...data),
    width: data.length > 0 ? data[0].length : 0
})

const parseVertices = (indices, width) => [...indices].map(i => {
    const x = i % width
    return [x, (i - x) / width]
})

const parseGrid = (values, width) => {
    return [...Array(values.length / width)].map((_, y) => {
        const start = y * width
        return [...Array(width)].map((_, x) => values[start + x])
    })
}

const useFetch = function(path) {
    fetchPath = path
}

const guess = async function(data, {finished = false, iterations = 100} = {}) {
    const wasm = await loadWasm(fetchPath)
    const {newData, width} = parseBoard(data)
    const indices = wasm.guess(newData, width, finished, iterations, Date.now())

    return parseVertices(indices, width)
}

const playTillEnd = async function(data, sign) {
    const wasm = await loadWasm(fetchPath)
    const {newData, width} = parseBoard(data)
    const values = wasm.playTillEnd(newData, width, sign, Date.now())

    return parseGrid(values, width)
}

const getProbabilityMap = async function(data, iterations) {
    const wasm = await loadWasm(fetchPath)
    const {newData, width} = parseBoard(data)
    const values = wasm.getProbabilityMap(newData, width, iterations, Date.now())

    return parseGrid(values, width)
}

const getFloatingStones = async function(data) {
    const wasm = await loadWasm(fetchPath)
    const {newData, width} = parseBoard(data)
    const indices = wasm.getFloatingStones(newData, width)

    return parseVertices(indices, width)
}

export default {
    useFetch,
    guess,
    playTillEnd,
    getProbabilityMap,
    getFloatingStones
}