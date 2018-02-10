# deadstones

Simple Monte Carlo functions to determine dead stones on a Go board. This is a work in progress.

## Installation

Use npm to install:

~~~
$ npm install @sabaki/deadstones
~~~

## API

This module exposes four functions:

### `deadstones.guess(data[, options])`

- `data` - Board data
- `options` `<Object>` *(optional)*
    - `finished` `<Boolean>` *(optional)* - Default: `false`

      If set `true`, deadstones will assume that player areas have been completely surrounded, yielding better results.
    - `iterations` `<Number>` *(optional)* - Default: `50`

      The number of random playthroughs to make.

Returns an array of stone vertices that Sabaki thinks are dead.

### `deadstones.getProbabilityMap(data, iterations)`

- `data` - Board data
- `iterations` `<Number>` - The number of random playthroughs to make.

Returns an array of arrays of the same size as `data`. Each entry is a number between `-1` and `1` and corresponds to a vertex. A number closer to `-1` is more likely controlled by white and a number closer to `1` is more likely controlled by black.

### `deadstones.playTillEnd(data, sign)`

- `data` - Board data
- `sign` `-1` | `1` - White player corresponds to `-1`, black player is represented by `1`.

Makes random alternating moves, starting with the player determined by sign, until only eye destroying moves can be made. Then all eyes that are left will be filled with the corresponding color. This final board arrangement data will be returned.

### `deadstones.getFloatingStones(data)`

- `data` - Board data

A fast method that returns an array of vertices of stones that do not surround more than one point of territory.
