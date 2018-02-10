const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('should not have empty vertices', t => {
    let finished = deadstones.playTillEnd(data.unfinished, 1)

    t.assert(finished.every(row => row.every(x => x !== 0)))

    t.end()
})
