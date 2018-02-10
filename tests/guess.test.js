const t = require('tap')
const deadstones = require('..')
const {equals} = require('../src/helper')
const data = require('./data')

t.test('should not mutate board data', t => {
    let boardJSON = JSON.stringify(data.finished)
    deadstones.guess(data.finished, {finished: true})

    t.assert(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('should detect some dead stones from unfinished games', t => {
    let dead = deadstones.guess(data.unfinished)

    t.assert(dead.length > 0)
    t.end()
})

t.test('should detect floating stones from finished games', t => {
    let dead = deadstones.guess(data.finished, {finished: true})
    let floating = deadstones.getFloatingStones(data.finished)

    t.assert(floating.every(v => dead.some(equals(v))))
    t.end()
})
