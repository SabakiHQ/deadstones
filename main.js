const Board = require('./pseudoBoard')

exports.guess = function(board, scoring = false, iterations = 50) {
    let boardClone = board.clone()

    if (scoring) {
        let floating = boardClone.getFloatingStones()
        floating.forEach(v => boardClone.set(v, 0))
    }

    let map = exports.getProbabilityMap(boardClone, iterations)
    let done = []
    let result = []

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            let vertex = [x, y]
            let sign = board.get(vertex)

            if (sign === 0 || done.some(equals(vertex))) continue

            let chain = getChain(board, vertex)
            let probability = chain.map(([i, j]) => map[j][i]).reduce((sum, x) => sum + x) / chain.length
            let newSign = probability < 0.5 ? -1 : probability > 0.5 ? 1 : 0

            if (newSign === -sign) result.push(...chain)

            done.push(vertex)
        }
    }

    if (!scoring) return result

    // Preserve life & death status of related chains

    done.length = 0
    let updatedResult = []

    for (let vertex of result) {
        if (done.some(equals(vertex))) continue

        let related = board.getRelatedChains(vertex)
        let deadProbability = related.filter(v => result.some(equals(v))).length / related.length

        if (deadProbability > 0.5) {
            updatedResult.push(...related)
        }

        done.push(...related)
    }

    return updatedResult
}

exports.playTillEnd = function(board, sign, iterations = Infinity) {
    board = board.clone()

    let freeVertices = []
    let illegalVertices = []

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            if (board.get([x, y]) !== 0) continue
            freeVertices.push([x, y])
        }
    }

    let finished = [false, false]

    while (iterations > 0 && freeVertices.length > 0 && finished.includes(false)) {
        let madeMove = false

        while (freeVertices.length > 0) {
            let randomIndex = Math.floor(Math.random() * freeVertices.length)
            let vertex = freeVertices[randomIndex]
            let freedVertices = makePseudoMove(board, sign, vertex, false)

            freeVertices.splice(randomIndex, 1)

            if (freedVertices != null) {
                freeVertices.push(...freedVertices)

                finished[-sign > 0 ? 0 : 1] = false
                madeMove = true

                break
            } else {
                illegalVertices.push(vertex)
            }
        }

        finished[sign > 0 ? 0 : 1] = !madeMove

        freeVertices.push(...illegalVertices)
        illegalVertices.length = 0

        sign = -sign
        iterations--
    }

    return board
}

exports.getProbabilityMap = function(board, iterations) {
    let pmap = [...Array(board.height)].map(_ => Array(board.width).fill(0))
    let nmap = [...Array(board.height)].map(_ => Array(board.width).fill(0))
    let result = [...Array(board.height)].map(_ => Array(board.width).fill(0.5))

    for (let i = 0; i < iterations; i++) {
        let sign = Math.sign(Math.random() - 0.5)
        let areaMap = fixHoles(exports.playTillEnd(board, sign))

        for (let x = 0; x < areaMap.width; x++) {
            for (let y = 0; y < areaMap.height; y++) {
                let s = areaMap.get([x, y])
                if (s < 0) nmap[y][x]++
                else if (s > 0) pmap[y][x]++
            }
        }
    }

    for (let x = 0; x < board.width; x++) {
        for (let y = 0; y < board.height; y++) {
            if (pmap[y][x] + nmap[y][x] === 0) continue
            result[y][x] = pmap[y][x] / (pmap[y][x] + nmap[y][x])
        }
    }

    return result
}
