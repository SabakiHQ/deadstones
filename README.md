# deadstones [![Build Status](https://travis-ci.org/SabakiHQ/deadstones.svg?branch=master)](https://travis-ci.org/SabakiHQ/deadstones)

Simple Monte Carlo functions to determine dead stones on a Go board.

## Installation

Use npm to install:

~~~
$ npm install @sabaki/deadstones
~~~

To use this module, require it as follows:

~~~js
const deadstones = require('@sabaki/deadstones')
~~~

This module supports fetching the WASM file via `fetch` on the web if no node environment is found. Use a bundler like webpack and call the following method right after `import` or `require`:

~~~js
deadstones.useFetch('./path/to/deadstones_bg.wasm')
~~~

## Building

Make sure you have the Rust toolchain installed via `rustup`. This project uses nightly Rust and the native WASM target which you can acquire with:

~~~
$ rustup default nightly
$ rustup target add wasm32-unknown-unknown
~~~

This project uses [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) which you can install via Cargo:

~~~
$ cargo install -f wasm-bindgen-cli
~~~

Make sure you have Node.js 8 or higher and npm installed. Clone this repository and install its dependencies with npm:

~~~sh
$ git clone https://github.com/SabakiHQ/deadstones
$ cd deadstones
$ npm install
~~~

To build WASM binaries and to start tests, use the following commands:

~~~
$ npm run build
$ npm test
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

Board positions are represented by an array of the form `[x, y]` where `x` and `y` are non-negative integers, zero-based coordinates of the vertex. `[0, 0]` denotes the top left position of the board.

This module exposes four functions:

### `async deadstones.guess(data[, options])`

- `data` - [Board data](#board-data)
- `options` `<Object>` *(optional)*
    - `finished` `<boolean>` *(optional)* - Default: `false`

      If set `true`, deadstones will assume that player areas have been completely surrounded, yielding better results.
    - `iterations` `<integer>` *(optional)* - Default: `100`

      The number of random playthroughs to make.

Returns an array of vertices that Sabaki thinks are dead.

### `async deadstones.getProbabilityMap(data, iterations)`

- `data` - [Board data](#board-data)
- `iterations` `<integer>` - The number of random playthroughs to make.

Returns an array of arrays of the same size as `data`. Each entry is a number between `-1` and `1` and corresponds to a vertex. A number closer to `-1` is more likely controlled by white and a number closer to `1` is more likely controlled by black.

### `async deadstones.playTillEnd(data, sign)`

- `data` - [Board data](#board-data)
- `sign` `-1` | `1` - White player corresponds to `-1`, black player is represented by `1`.

Makes random alternating moves, starting with the player determined by sign, until only eye filling moves can be made. Then all eyes that are left will be filled with the corresponding color. This final board arrangement data will be returned.

### `async deadstones.getFloatingStones(data)`

- `data` - [Board data](#board-data)

A fast function that returns an array of vertices of stones that are inside enemy territory and do not surround more than one point of territory themselves.
