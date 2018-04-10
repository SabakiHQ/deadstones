# deadstones [![Build Status](https://travis-ci.org/SabakiHQ/deadstones.svg?branch=master)](https://travis-ci.org/SabakiHQ/deadstones)

Simple Monte Carlo functions to determine dead stones on a Go board.

## Installation

Use npm to install:

~~~
$ npm install @sabaki/deadstones
~~~

Then require it as follows:

~~~js
const deadstones = require('@sabaki/deadstones');
~~~

## API

### Board Data

The board arrangement is represented by an array of arrays. Each of those subarrays represent one row, all containing the same number of integers. `-1` denotes a white stone, `1` a black stone, and `0` represents an empty vertex

#### Example

~~~js
[[ 0,  0,  1,  0, -1, -1,  1,  0, 0],
 [ 1,  0,  1, -1, -1,  1,  1,  1, 0],
 [ 0,  0,  1, -1,  0,  1, -1, -1, 0],
 [ 1,  1,  1, -1, -1, -1,  1, -1, 0],
 [ 1, -1,  1,  1, -1,  1,  1,  1, 0],
 [-1, -1, -1, -1, -1,  1,  0,  0, 0],
 [ 0, -1, -1,  0, -1,  1,  1,  1, 1],
 [ 0,  0,  0,  0,  0, -1, -1, -1, 1],
 [ 0,  0,  0,  0,  0,  0,  0, -1, 0]]
~~~

### Vertex

Board positions are represented by an array of the form `[x, y]` where `x` and `y` are positive integers, zero-based coordinates of the vertex. `[0, 0]` denotes the top left position of the board.

This module exposes four functions:

### `deadstones.guess(data[, options])`

- `data` - [Board data](#board-data)
- `options` `<Object>` *(optional)*
    - `finished` `<Boolean>` *(optional)* - Default: `false`

      If set `true`, deadstones will assume that player areas have been completely surrounded, yielding better results.
    - `iterations` `<Number>` *(optional)* - Default: `50`

      The number of random playthroughs to make.

Returns an array of vertices that Sabaki thinks are dead.

### `deadstones.getProbabilityMap(data, iterations)`

- `data` - [Board data](#board-data)
- `iterations` `<Number>` - The number of random playthroughs to make.

Returns an array of arrays of the same size as `data`. Each entry is a number between `-1` and `1` and corresponds to a vertex. A number closer to `-1` is more likely controlled by white and a number closer to `1` is more likely controlled by black.

### `deadstones.playTillEnd(data, sign)`

- `data` - [Board data](#board-data)
- `sign` `-1` | `1` - White player corresponds to `-1`, black player is represented by `1`.

Makes random alternating moves, starting with the player determined by sign, until only eye destroying moves can be made. Then all eyes that are left will be filled with the corresponding color. This final board arrangement data will be returned.

### `deadstones.getFloatingStones(data)`

- `data` - [Board data](#board-data)

A fast function that returns an array of vertices of stones that are inside enemy territory and do not surround more than one point of territory themselves.
