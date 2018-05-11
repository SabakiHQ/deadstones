#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod deadstones;
mod vertex;
mod pseudo_board;

use vertex::*;
use pseudo_board::*;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

fn parse_data(input: &str) -> BoardData {
    input.split(';').map(|row| {
        row.split(',')
        .map(|sign| match sign.parse::<Sign>() {
            Ok(x) => x.signum() as Sign,
            Err(_) => 0
        })
        .collect()
    })
    .collect()
}

fn stringify_vertex_list(vertices: &Vec<Vertex>) -> String {
    vertices.iter()
    .map(|v| v.0.to_string() + "," + &v.1.to_string())
    .fold(String::new(), |acc, x| match acc.len() {
        0 => x,
        _ => acc + ";" + &x
    })
}

fn stringify_grid<T: ToString>(data: &Vec<Vec<T>>) -> String {
    data.iter()
    .map(|row| {
        row.iter()
        .map(|x| x.to_string())
        .fold(String::new(), |acc, x| match acc.len() {
            0 => x,
            _ => acc + "," + &x
        })
    })
    .fold(String::new(), |acc, x| match acc.len() {
        0 => x,
        _ => acc + ";" + &x
    })
}

#[wasm_bindgen]
pub fn guess(data: &str, finished: bool, iterations: usize) -> String {
    let data = parse_data(data);
    let result = deadstones::guess(data, finished, iterations, || random());

    stringify_vertex_list(&result)
}

#[wasm_bindgen]
pub fn get_probability_map(data: &str, iterations: usize) -> String {
    let data = parse_data(data);
    let result = deadstones::get_probability_map(data, iterations, || random());

    stringify_grid(&result)
}

#[wasm_bindgen]
pub fn play_till_end(data: &str, sign: Sign) -> String {
    let data = parse_data(data);
    let result = deadstones::play_till_end(data, sign, || random());

    stringify_grid(&result)
}

#[wasm_bindgen]
pub fn get_floating_stones(data: &str) -> String {
    let data = parse_data(data);
    let result = deadstones::get_floating_stones(data);

    stringify_vertex_list(&result)
}
