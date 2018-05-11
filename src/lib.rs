#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod deadstones;
mod data;
mod vertex;
mod pseudo_board;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

#[wasm_bindgen]
pub fn guess(data: Vec<i8>, width: usize, finished: bool, iterations: usize) -> Vec<u32> {
    let data = data::parse_boarddata(&data, width);
    let result = deadstones::guess(data, finished, iterations, || random());

    data::flatten_vertices(result)
}

#[wasm_bindgen]
pub fn get_probability_map(data: Vec<i8>, width: usize, iterations: usize) -> Vec<i32> {
    let data = data::parse_boarddata(&data, width);
    let result = deadstones::get_probability_map(data, iterations, || random());

    data::flatten_board_data(result)
}

#[wasm_bindgen]
pub fn play_till_end(data: Vec<i8>, width: usize, sign: i8) -> Vec<i8> {
    let data = data::parse_boarddata(&data, width);
    let result = deadstones::play_till_end(data, sign, || random());

    data::flatten_board_data(result)
}

#[wasm_bindgen]
pub fn get_floating_stones(data: Vec<i8>, width: usize) -> Vec<u32> {
    let data = data::parse_boarddata(&data, width);
    let result = deadstones::get_floating_stones(data);

    data::flatten_vertices(result)
}
