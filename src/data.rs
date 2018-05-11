use vertex::*;
use pseudo_board::*;

pub fn parse_boarddata(data: &Vec<Sign>, width: usize) -> BoardData {
    let height = match data.len().checked_div(width) {
        Some(x) => x,
        None => return vec![]
    };

    (0..height).map(|y| {
        (&data[y * width..(y + 1) * width])
        .iter()
        .cloned()
        .collect()
    }).collect()
}

pub fn flatten_vertices(data: Vec<Vertex>) -> Vec<u32> {
    data.into_iter()
    .fold(Vec::new(), |mut acc, vertex| {
        acc.push(vertex.0 as u32);
        acc.push(vertex.1 as u32);
        acc
    })
}

pub fn flatten_board_data<T>(data: Vec<Vec<T>>) -> Vec<T> {
    data.into_iter()
    .fold(Vec::new(), |mut acc, mut row| {
        acc.append(&mut row);
        acc
    })
}
