const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('should not mutate board data', async t => {
    let boardJSON = JSON.stringify(data.finished)
    await deadstones.playTillEnd(data.finished, -1)

    t.assert(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('should not have empty vertices', async t => {
    let finished = await deadstones.playTillEnd(data.unfinished, 1)

    t.assert(finished.every(row => row.every(x => x === 1 || x === -1)))
    t.end()
})
