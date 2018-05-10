use wasm_bindgen::prelude::*;
use vertex::*;
use pseudo_board::*;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

pub fn play_till_end(data: BoardData, sign: i8) -> BoardData {
    let mut sign = sign;
    let mut board = PseudoBoard::new(data);
    let mut free_vertices = vec![];
    let mut illegal_vertices = vec![];

    for x in 0..board.width {
        for y in 0..board.height {
            if board.get(Vertex(x, y)).unwrap() == 0 {
                free_vertices.push(Vertex(x, y));
            }
        }
    }

    let mut finished = vec![false, false];

    while free_vertices.len() > 0 && finished.contains(&false) {
        let mut made_move = false;

        while free_vertices.len() > 0 {
            let random_index = (random() * free_vertices.len() as f64).floor() as usize;
            let vertex = free_vertices[random_index];

            free_vertices.remove(random_index);

            if let Some(mut freed_vertices) = board.make_pseudo_move(sign, vertex) {
                free_vertices.append(&mut freed_vertices);

                finished[if sign < 0 { 0 } else { 1 }] = false;
                made_move = true;

                break;
            } else {
                illegal_vertices.push(vertex);
            }
        }

        finished[if sign < 0 { 1 } else { 0 }] = !made_move;

        free_vertices.append(&mut illegal_vertices);
        sign = -sign;
    }

    for x in 0..board.width {
        for y in 0..board.height {
            let vertex = Vertex(x, y);
            if board.get(vertex).unwrap() != 0 {
                continue;
            }

            let neighbors = get_neighbors(vertex);
            let mut sign = 0;

            for v in neighbors.into_iter() {
                let s = board.get(v).unwrap();

                if s == 1 || s == -1 {
                    sign = s;
                    break;
                }
            }

            if sign != 0 {
                board.set(vertex, sign);
            }
        }
    }

    board.data
}

pub fn get_floating_stones(data: BoardData) -> Vec<Vertex> {
    PseudoBoard::new(data).get_floating_stones()
}
