const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('should not mutate board data', async t => {
    let boardJSON = JSON.stringify(data.finished)
    await deadstones.guess(data.finished, {finished: true})

    t.ok(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('should detect some dead stones from unfinished games', async t => {
    let dead = await deadstones.guess(data.unfinished)

    t.ok(dead.length > 0)
    t.end()
})

t.test('should detect floating stones from finished games', async t => {
    let dead = await deadstones.guess(data.finished, {finished: true})
    let floating = await deadstones.getFloatingStones(data.finished)

    t.ok(floating.every(v => dead.some(([x, y]) => x === v[0] && y === v[1])))
    t.end()
})
