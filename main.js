const {equals, getNeighbors, add} = require('./helper')
const Board = require('./pseudoBoard')

exports.guess = function(data, {finished = false, iterations = 50} = {}) {
    let board = new Board(data)

    if (finished) {
        let floating = board.getFloatingStones()
        floating.forEach(v => board.set(v, 0))
    }

    let map = exports.getProbabilityMap(board.data, iterations)
    let done = {}
    let result = []
    let toProbability = ([x, y]) => map[y][x]

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            let vertex = [x, y]
            let sign = board.get(vertex)

            if (sign === 0 || vertex in done) continue

            let chain = board.getChain(vertex)
            let probability = chain.map(toProbability).reduce(add) / chain.length
            let newSign = probability < 0 ? -1 : probability > 0 ? 1 : 0

            if (newSign === -sign) result.push(...chain)

            for (let v of chain) {
                done[v] = true
            }
        }
    }

    if (!finished) return result

    // Preserve life & death status of related chains

    done = {}
    let updatedResult = []

    for (let vertex of result) {
        if (vertex in done) continue

        let related = board.getRelatedChains(vertex)
        let deadProbability = related.filter(v => result.some(equals(v))).length / related.length

        if (deadProbability > 0.5) {
            updatedResult.push(...related)
        }

        for (let v of related) {
            done[v] = true
        }
    }

    return updatedResult
}

exports.playTillEnd = function(data, sign) {
    let board = new Board(data).clone()
    let freeVertices = []
    let illegalVertices = []

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            if (board.get([x, y]) !== 0) continue
            freeVertices.push([x, y])
        }
    }

    let finished = [false, false]

    while (freeVertices.length > 0 && finished.includes(false)) {
        let madeMove = false

        while (freeVertices.length > 0) {
            let randomIndex = Math.floor(Math.random() * freeVertices.length)
            let vertex = freeVertices[randomIndex]
            let freedVertices = board.makePseudoMove(sign, vertex)

            freeVertices.splice(randomIndex, 1)

            if (freedVertices != null) {
                freeVertices.push(...freedVertices)

                finished[sign === -1 ? 0 : 1] = false
                madeMove = true

                break
            } else {
                illegalVertices.push(vertex)
            }
        }

        finished[sign === 1 ? 0 : 1] = !madeMove

        freeVertices.push(...illegalVertices)
        illegalVertices.length = 0

        sign = -sign
    }

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            let vertex = [x, y]
            if (board.get(vertex) !== 0) continue

            let neighbors = getNeighbors(vertex)
            let sign = 0

            for (let v of neighbors) {
                let s = board.get(v)
                
                if (s === 1 || s === -1) {
                    sign = s
                    break;
                }
            }

            if (sign !== 0) board.set(vertex, sign)
        }
    }

    return board.data
}

exports.getProbabilityMap = function(data, iterations) {
    let height = data.length
    let width = data.length === 0 ? 0 : data[0].length
    let result = [...Array(height)].map(_ => [...Array(width)].map(__ => ({p: 0, n: 0})))

    for (let i = 0; i < iterations; i++) {
        let sign = Math.sign(Math.random() - 0.5)
        let areaMap = exports.playTillEnd(data, sign)

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let s = areaMap[y][x]
                if (s === -1) result[y][x].n++
                else if (s === 1) result[y][x].p++
            }
        }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let {n, p} = result[y][x]
            result[y][x] = p + n !== 0 ? (p / (p + n)) * 2 - 1 : 0
        }
    }

    return result
}

exports.getFloatingStones = function(data) {
    return new Board(data).getFloatingStones()
}
