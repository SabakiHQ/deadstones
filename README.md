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
    - `endOfGame` `<Boolean>` *(optional)* - Default: `false`

      If set `true`, deadstones will assume that player areas have been completely surrounded, yielding better results.
    - `iterations` `<Number>` *(optional)* - Default: `50`

      The number of random playthroughs to make.

### `deadstones.getProbabilityMap(data, iterations)`

- `data` - Board data
- `iterations` `<Number>` - The number of random playthroughs to make.

### `deadstones.playTillEnd(data, sign)`

- `data` - Board data

### `deadstones.getFloatingStones(data)`

- `data` - Board data
