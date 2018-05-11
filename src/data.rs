use vertex::*;
use pseudo_board::*;

pub fn parse_boarddata(input: &str) -> BoardData {
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

pub fn stringify_vertex_list(vertices: &Vec<Vertex>) -> String {
    vertices.iter()
    .map(|v| v.0.to_string() + "," + &v.1.to_string())
    .fold(String::new(), |acc, x| match acc.len() {
        0 => x,
        _ => acc + ";" + &x
    })
}

pub fn stringify_grid<T: ToString>(data: &Vec<Vec<T>>) -> String {
    data.iter()
    .map(|row| {
        row.into_iter()
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
