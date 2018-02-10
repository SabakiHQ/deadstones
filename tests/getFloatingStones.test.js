const t = require('tap')
const deadstones = require('..')
const data = require('./data')

t.test('finished game', t => {
    t.deepEqual(deadstones.getFloatingStones(data.finished).sort(), [
        [10, 5], [13, 13], [13, 14], [14, 7], [18, 13], 
        [2, 13], [2, 14], [5, 13], [6, 13], [9, 3], [9, 5]
    ])

    t.end()
})

t.test('unfinished game', t => {
    t.deepEqual(deadstones.getFloatingStones(data.unfinished), [[0, 1]])

    t.end()
})
