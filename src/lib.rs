#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate rand;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate wasm_bindgen;

use rand::Rng;
use wasm_bindgen::prelude::*;

mod vertex;
mod pseudo_board;
mod deadstones;

#[wasm_bindgen]
pub fn get_floating_stones(input: &str) -> String {
    String::new()
}
