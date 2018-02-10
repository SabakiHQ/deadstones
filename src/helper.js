exports.equals = v => w => w[0] === v[0] && w[1] === v[1]
exports.equalsSign = (board, ...s) => v => s.includes(board.get(v))
exports.add = (x, y) => x + y
exports.getNeighbors = ([x, y]) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
