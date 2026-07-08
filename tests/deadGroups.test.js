const t = require('tap')
const deadstones = require('..')

// Regression tests for dead groups that the Monte Carlo playout used to miss
// because a lone stone filling an enemy group's last eye was treated as an
// illegal move, so the group could never be captured (issues #10 and #7).

// Issue #10: a single-eye white group, walled in by black, must read as dead.
// 9x9, all black except an 8-stone white ring around one central eye.
const singleEye = (() => {
  const board = [...Array(9)].map(() => Array(9).fill(1))
  for (const [x, y] of [[3, 3], [4, 3], [5, 3], [3, 4], [5, 4], [3, 5], [4, 5], [5, 5]]) {
    board[y][x] = -1
  }
  board[4][4] = 0
  return board
})()

const ringStones = [[3, 3], [4, 3], [5, 3], [3, 4], [5, 4], [3, 5], [4, 5], [5, 5]]

// Issue #7: the reporter's 13x13 position; the eight white stones in the lower
// left are dead but were never marked.
const reported7 = [
  [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, -1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, -1, -1, -1],
  [1, 1, 0, 1, 0, 1, -1, 1, 1, 1, -1, 0, 0],
  [0, 1, 0, 0, 1, 1, -1, 1, 0, 0, 1, -1, -1],
  [0, 0, 1, 1, -1, -1, -1, 1, 0, 1, 1, 1, -1],
  [0, 1, 1, 0, 1, -1, 0, -1, 1, 1, 1, -1, 0],
  [1, 0, 1, 1, 1, -1, 0, -1, -1, 0, 0, -1, -1],
  [0, 0, 1, 1, -1, -1, -1, 0, 0, -1, -1, -1, -1],
  [1, 1, 1, 0, 1, -1, -1, 0, 0, -1, 0, 0, -1],
  [0, 0, 1, 1, 1, 1, -1, -1, 0, -1, 1, 1, 1],
  [1, 1, -1, -1, 1, 1, 1, -1, 0, -1, -1, 1, -1],
  [1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, -1, 0, -1, 1, -1, 0, -1, 0, -1, 0, 0],
]

const lowerLeftGroup = [[2, 10], [3, 10], [1, 11], [2, 11], [3, 11], [4, 11], [2, 12], [4, 12]]

const containsAll = (dead, group) =>
  group.every(([x, y]) => dead.some(([a, b]) => a === x && b === y))

t.test('issue #10: single-eye group is detected as dead', async t => {
  let dead = await deadstones.guess(singleEye, {finished: true, iterations: 200})
  t.ok(containsAll(dead, ringStones), 'all eight ring stones should be dead')
  t.end()
})

t.test('issue #7: dead lower-left group is detected', async t => {
  let dead = await deadstones.guess(reported7, {finished: true, iterations: 200})
  t.ok(containsAll(dead, lowerLeftGroup), 'all eight lower-left stones should be dead')
  t.end()
})
