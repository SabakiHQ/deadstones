const t = require('tap')
const data = require('./data')

t.test('should not mutate board data', async t => {
    let deadstones = await require('..')
    let boardJSON = JSON.stringify(data.finished)

    deadstones.guess(data.finished, {finished: true})

    t.assert(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('should detect some dead stones from unfinished games', async t => {
    let deadstones = await require('..')
    let dead = deadstones.guess(data.unfinished)

    t.assert(dead.length > 0)
    t.end()
})

t.test('should detect floating stones from finished games', async t => {
    let deadstones = await require('..')
    let dead = deadstones.guess(data.finished, {finished: true})
    let floating = deadstones.getFloatingStones(data.finished)

    t.assert(floating.every(v => dead.some(([x, y]) => x === v[0] && y === v[1])))
    t.end()
})
