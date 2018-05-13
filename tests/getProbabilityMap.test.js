const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('should not mutate board data', async t => {
    let boardJSON = JSON.stringify(data.finished)
    await deadstones.getProbabilityMap(data.finished, 50)

    t.assert(JSON.stringify(data.finished), boardJSON)
    t.end()
})

t.test('should contain values between -1 and 1', async t => {
    let map = await deadstones.getProbabilityMap(data.unfinished, 50)

    t.assert(map.every(row => row.every(x => -1 <= x && x <= 1)))
    t.end()
})
