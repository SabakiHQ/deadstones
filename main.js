const {equals, add} = require('./helper')
const Board = require('./pseudoBoard')

exports.getFloatingStones = function(data) {
    return new Board(data).getFloatingStones()
}

exports.guess = function(data, {endOfGame = false, iterations = 50} = {}) {
    let board = new Board(data)

    if (endOfGame) {
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
            let newSign = probability < 0.5 ? -1 : probability > 0.5 ? 1 : 0

            if (newSign === -sign) result.push(...chain)

            done[vertex] = true
        }
    }

    if (!endOfGame) return result

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

exports.playTillEnd = function(data, sign, {maxMoves = Infinity} = {}) {
    let board = new Board(data)
    let freeVertices = []
    let illegalVertices = []

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            if (board.get([x, y]) !== 0) continue
            freeVertices.push([x, y])
        }
    }

    let finished = [false, false]

    while (maxMoves > 0 && freeVertices.length > 0 && finished.includes(false)) {
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
        maxMoves--
    }

    return board
}

exports.getProbabilityMap = function(data, iterations) {
    let height = data.length
    let width = data.length === 0 ? 0 : data[0].length
    let countMap = [...Array(height)].map(_ => [...Array(width)].map(__ => ({p: 0, n: 0})))
    let result = [...Array(height)].map(_ => Array(width).fill(0.5))

    for (let i = 0; i < iterations; i++) {
        let sign = Math.sign(Math.random() - 0.5)
        let areaMap = exports.playTillEnd(data, sign).fixHoles().data

        for (let x = 0; x < areaMap.width; x++) {
            for (let y = 0; y < areaMap.height; y++) {
                let s = areaMap[y][x]
                if (s === -1) countMap[y][x].n++
                else if (s === 1) countMap[y][x].p++
            }
        }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let {n, p} = countMap[y][x]
            if (p + n !== 0) result[y][x] = p / (p + n)
        }
    }

    return result
}
