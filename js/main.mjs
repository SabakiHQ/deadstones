// ESM entry point. The implementation lives in the CJS main.js (single source of
// truth); this just re-exposes it as named + default ESM exports so consumers can
// `import {guess, useFetch} from '@sabaki/deadstones'`. Browser loading still goes
// through useFetch() + fetch, so no `fs` access happens at runtime.
import mod from './main.js'

export const useFetch = mod.useFetch
export const guess = mod.guess
export const playTillEnd = mod.playTillEnd
export const getProbabilityMap = mod.getProbabilityMap
export const getFloatingStones = mod.getFloatingStones

export default mod
