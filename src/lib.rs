#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate wasm_bindgen;

mod vertex;
mod pseudo_board;
mod deadstones;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_floating_stones(input: &str) -> String {
    String::new()
}
