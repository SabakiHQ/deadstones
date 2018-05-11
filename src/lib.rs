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
pub fn guess(data: &str, finished: bool, iterations: usize) -> String {
    let data = data::parse_boarddata(data);
    let result = deadstones::guess(data, finished, iterations, || random());

    data::stringify_vertex_list(&result)
}

#[wasm_bindgen]
pub fn get_probability_map(data: &str, iterations: usize) -> String {
    let data = data::parse_boarddata(data);
    let result = deadstones::get_probability_map(data, iterations, || random());

    data::stringify_grid(&result)
}

#[wasm_bindgen]
pub fn play_till_end(data: &str, sign: i8) -> String {
    let data = data::parse_boarddata(data);
    let result = deadstones::play_till_end(data, sign, || random());

    data::stringify_grid(&result)
}

#[wasm_bindgen]
pub fn get_floating_stones(data: &str) -> String {
    let data = data::parse_boarddata(data);
    let result = deadstones::get_floating_stones(data);

    data::stringify_vertex_list(&result)
}
