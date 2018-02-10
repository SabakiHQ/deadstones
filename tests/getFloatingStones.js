const test = require('tape')
const deadstones = require('..')
const data = require('./data')

test('complex board situation', t => {
    t.deepEqual(deadstones.getFloatingStones(data.shuusaku).sort(), [
        [10, 5], [13, 13], [13, 14], [14, 7], [18, 13], 
        [2, 13], [2, 14], [5, 13], [6, 13], [9, 3], [9, 5]
    ])

    t.end()
})
