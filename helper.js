exports.equals = v => w => w[0] === v[0] && w[1] === v[1]
exports.equalsSign = (board, ...s) => v => s.includes(board.get(v))
