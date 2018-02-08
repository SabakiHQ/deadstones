const {equals, equalsSign, getNeighbors} = require('./helper')

class PseudoBoard {
    constructor(data) {
        this.data = data
        this.height = data.length
        this.width = data.length === 0 ? 0 : data[0].length
    }

    get([x, y]) {
        return this.data[y] != null ? this.data[y][x] : undefined
    }

    set([x, y], sign) {
        this.data[y][x] = sign
    }

    isPointChain(vertex) {
        return !getNeighbors(vertex).some(equalsSign(this, this.get(vertex)))
    }

    getConnectedComponent(vertex, signs, result = null) {
        if (result == null) result = [vertex]
        let neighbors = getNeighbors(vertex)

        for (let i = 0; i < neighbors.length; i++) {
            let v = neighbors[i]
            if (!signs.includes(this.get(v)) || result.some(equals(v))) continue

            result.push(v)
            this.getConnectedComponent(v, signs, result)
        }

        return result
    }

    getRelatedChains(vertex) {
        let area = this.getConnectedComponent(vertex, [this.get(vertex), 0])
        return area.filter(equalsSign(this, this.get(vertex)))
    }

    getChain(vertex) {
        let sign = this.get(vertex)
        return this.getConnectedComponent(vertex, [sign])
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

    getFloatingStones() {
        let done = {}
        let result = []
        let isNegative = v => this.get(v) === -1
        let isPositive = v => this.get(v) === 1
        let markAsDone = v => done[v] = true

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let vertex = [i, j]
                if (this.get(vertex) !== 0 || vertex in done) continue

                let posArea = this.getConnectedComponent(vertex, [0, -1])
                let negArea = this.getConnectedComponent(vertex, [0, 1])
                let posDead = posArea.filter(isNegative)
                let negDead = negArea.filter(isPositive)
                let posDiff = posArea.filter(v => !posDead.some(equals(v)) && !negArea.some(equals(v)))
                let negDiff = negArea.filter(v => !negDead.some(equals(v)) && !posArea.some(equals(v)))

                let sign = 0
                let actualArea, actualDead

                if (negDiff.length <= 1 && negDead.length <= posDead.length) {
                    sign--
                    actualArea = negArea
                    actualDead = negDead
                }

                if (posDiff.length <= 1 && posDead.length <= negDead.length) {
                    sign++
                    actualArea = posArea
                    actualDead = posDead
                }

                if (sign === 0) {
                    actualArea = this.getChain(vertex)
                    actualDead = []
                }

                actualArea.forEach(markAsDone)
                result.push(...actualDead)
            }
        }

        return result
    }
}

module.exports = PseudoBoard
