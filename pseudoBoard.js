const equals = v => w => w[0] === v[0] && w[1] === v[1]
const equalsSign = (board, ...s) => v => s.includes(board.get(v))
const getNeighbors = ([x, y]) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]

module.exports = class PseudoBoard {
    constructor(data) {
        this.data = data
        this.height = data.length
        this.width = data.length === 0 ? 0 : data[0].length
    }

    get([x, y]) {
        return this.data[y] != null ? this.data[y][x] : undefined
    }

    set([x, y], sign) {
        if (this.data[y] != null) {
            this.data[y][x] = sign
        }

        return this
    }

    isPointChain(vertex) {
        return !getNeighbors(vertex).some(equalsSign(this, this.get(vertex)))
    }

    getChain(vertex, result = null, sign = null) {
        if (result == null) result = [vertex]
        if (sign == null) sign = this.get(vertex)

        let neighbors = getNeighbors(vertex)

        for (let i = 0; i < neighbors.length; i++) {
            let v = neighbors[i]
            if (this.get(v) !== sign || result.some(equals(v))) continue

            result.push(v)
            this.getChain(v, result, sign)
        }

        return result
    }

    hasLiberties(vertex, visited = [], sign = null) {
        if (sign == null) sign = this.get(vertex)

        let neighbors = getNeighbors(vertex)
        let friendlyNeighbors = []

        for (let i = 0; i < neighbors.length; i++) {
            let n = neighbors[i]
            let s = this.get(n)

            if (s === 0) {
                return true
            } else if (s === sign) {
                friendlyNeighbors.push(n)
            }
        }

        visited.push(vertex)

        for (let i = 0; i < friendlyNeighbors.length; i++) {
            let n = friendlyNeighbors[i]
            if (visited.some(equals(n))) continue

            if (this.hasLiberties(n, visited, sign)) return true
        }

        return false
    }

    makePseudoMove(sign, vertex) {
        let neighbors = getNeighbors(vertex)
        let checkCapture = false
        let checkMultipleDeadChains = false

        if (neighbors.every(equalsSign(this, sign, undefined)))
            return null

        this.set(vertex, sign)

        if (!this.hasLiberties(vertex)) {
            if (!neighbors.some(equalsSign(this, -sign))) {
                this.set(vertex, 0)
                return null
            } else if (this.isPointChain(vertex)) {
                checkMultipleDeadChains = true
            } else {
                checkCapture = true
            }
        }

        let dead = []
        let deadChains = 0

        for (let i = 0; i < neighbors.length; i++) {
            let n = neighbors[i]
            if (this.get(n) !== -sign || this.hasLiberties(n))
                continue

            let chain = this.getChain(n)
            dead.push(...chain)
            deadChains++

            for (let j = 0; j < chain.length; j++) {
                this.set(chain[j], 0)
            }
        }

        if (checkMultipleDeadChains && deadChains <= 1) {
            for (let j = 0; j < dead.length; j++) {
                this.set(dead[j], -sign)
            }

            this.set(vertex, 0)
            return null
        }

        if (checkCapture && dead.length === 0) {
            this.set(vertex, 0)
            return null
        }

        return dead
    }

    fixHoles() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let vertex = [x, y]
                if (this.get(vertex) !== 0) continue

                let neighbors = getNeighbors(vertex)
                let sign = 0
                let fix = true

                for (let i = 1; i < neighbors.length; i++) {
                    let n = neighbors[i]
                    let s = this.get(n)

                    if (s != null && s !== sign) {
                        if (sign === 0) {
                            sign = s
                        } else {
                            fix = false
                            break
                        }
                    }
                }

                if (fix) this.set(vertex, sign)
            }
        }

        return this
    }
}
