#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate rand;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod vertex;
mod pseudo_board;
mod deadstones;

use pseudo_board::*;

#[wasm_bindgen]
pub fn guess(data: &str, finished: bool, iterations: usize) -> String {
    let data: BoardData = serde_json::from_str(data).unwrap();
    let result = deadstones::guess(data, finished, iterations);

    serde_json::to_string(&result).unwrap()
}

#[wasm_bindgen]
pub fn get_probability_map(data: &str, iterations: usize) -> String {
    let data: BoardData = serde_json::from_str(data).unwrap();
    let result = deadstones::get_probability_map(data, iterations);

    serde_json::to_string(&result).unwrap()
}

#[wasm_bindgen]
pub fn play_till_end(data: &str, sign: i8) -> String {
    let data: BoardData = serde_json::from_str(data).unwrap();
    let result = deadstones::play_till_end(data, sign);

    serde_json::to_string(&result).unwrap()
}

#[wasm_bindgen]
pub fn get_floating_stones(data: &str) -> String {
    let data: BoardData = serde_json::from_str(data).unwrap();
    let result = deadstones::get_floating_stones(data);

    serde_json::to_string(&result).unwrap()
}
