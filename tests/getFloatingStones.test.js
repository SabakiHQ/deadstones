const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('should not mutate board data', async t => {
    let boardJSON = JSON.stringify(data.finished)
    await deadstones.getFloatingStones(data.finished)

    t.ok(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('finished game', async t => {
    let floatingStones = await deadstones.getFloatingStones(data.finished)

    t.same(floatingStones.sort(), [
        [10, 5], [13, 13], [13, 14], [14, 7], [18, 13], 
        [2, 13], [2, 14], [5, 13], [6, 13], [9, 3], [9, 5]
    ])

    t.end()
})

t.test('unfinished game', async t => {
    t.same(await deadstones.getFloatingStones(data.unfinished), [[0, 1]])
    t.end()
})
