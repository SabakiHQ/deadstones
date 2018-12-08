extern crate wasm_bindgen;

mod rand;
mod deadstones;
mod pseudo_board;

use rand::Rand;
use pseudo_board::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn guess(data: Vec<Sign>, width: usize, finished: bool, iterations: usize, seed: u32) -> Vec<u32> {
    let board = PseudoBoard {data, width};

    deadstones::guess(board, finished, iterations, &mut Rand::new(seed))
    .into_iter()
    .map(|x| x as u32)
    .collect()
}

#[wasm_bindgen]
pub fn get_probability_map(data: Vec<Sign>, width: usize, iterations: usize, seed: u32) -> Vec<f32> {
    let board = PseudoBoard {data, width};

    deadstones::get_probability_map(&board, iterations, &mut Rand::new(seed))
}

#[wasm_bindgen]
pub fn play_till_end(data: Vec<Sign>, width: usize, sign: Sign, seed: u32) -> Vec<Sign> {
    let board = PseudoBoard {data, width};

    deadstones::play_till_end(board, sign, &mut Rand::new(seed)).data
}

#[wasm_bindgen]
pub fn get_floating_stones(data: Vec<Sign>, width: usize) -> Vec<u32> {
    let board = PseudoBoard {data, width};

    board.get_floating_stones()
    .into_iter()
    .map(|x| x as u32)
    .collect()
}
