#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod rand;
mod deadstones;
mod pseudo_board;

use rand::Rand;
use pseudo_board::*;

#[wasm_bindgen]
pub fn guess(data: Vec<Sign>, width: usize, finished: bool, iterations: usize) -> Vec<i32> {
    let board = PseudoBoard::new(data, width);

    deadstones::guess(board, finished, iterations)
    .into_iter()
    .map(|x| x as i32)
    .collect()
}

#[wasm_bindgen]
pub fn get_probability_map(data: Vec<Sign>, width: usize, iterations: usize) -> Vec<f32> {
    let board = PseudoBoard::new(data, width);
    
    deadstones::get_probability_map(board, iterations)
}

#[wasm_bindgen]
pub fn play_till_end(data: Vec<Sign>, width: usize, sign: Sign) -> Vec<Sign> {
    let board = PseudoBoard::new(data, width);

    deadstones::play_till_end(board, sign, &mut Rand::new(978236)).data
}

#[wasm_bindgen]
pub fn get_floating_stones(data: Vec<Sign>, width: usize) -> Vec<i32> {
    let board = PseudoBoard::new(data, width);

    board.get_floating_stones()
    .into_iter()
    .map(|x| x as i32)
    .collect()
}
