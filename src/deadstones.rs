use rand::{self, Rng};
use vertex::*;
use pseudo_board::*;

pub fn guess(data: BoardData, finished: bool, iterations: usize) -> Vec<Vertex> {
    let mut board = PseudoBoard::new(data);
    let mut result = vec![];
    let mut floating = vec![];

    if finished {
        floating = board.get_floating_stones();

        for &v in &floating {
            board.set(v, 0);
        }
    }

    let map = get_probability_map(board.data.clone(), iterations);
    let mut done = vec![];

    for x in 0..board.width {
        for y in 0..board.height {
            let vertex = Vertex(x, y);
            let s = board.get(vertex).unwrap();

            if s == 0 || done.contains(&vertex) {
                continue;
            }

            let chain = board.get_chain(vertex);
            let probability = chain.iter()
                .map(|&Vertex(x, y)| map[y][x])
                .sum::<f32>() / chain.len() as f32;
            let new_sign = probability.signum() as i8;

            for &v in &chain {
                result.push(v);
                done.push(v);
            }
        }
    }

    if !finished {
        result.append(&mut floating);
        return result;
    }

    // Preserve life & death status of related chains

    let mut done = vec![];
    let mut updated_result = floating;

    for &vertex in &result {
        if done.contains(&vertex) {
            continue;
        }

        let related = board.get_related_chains(vertex);
        let dead_probability = related.iter().filter(|&v| result.contains(v)).count() as f32 / related.len() as f32;

        for &v in &related {
            if dead_probability > 0.5 {
                updated_result.push(v);
            }

            done.push(v);
        }
    }

    updated_result
}

pub fn get_probability_map(data: BoardData, iterations: usize) -> Vec<Vec<f32>> {
    let board = PseudoBoard::new(data);
    let mut rng = rand::thread_rng();
    let mut result = (0..board.height).map(|_| {
        (0..board.width).map(|_| (0, 0)).collect::<Vec<_>>()
    }).collect::<Vec<_>>();

    for i in 0..iterations {
        let s = if rng.gen() { 1 } else { -1 };
        let area_map = play_till_end(board.data.clone(), s);

        for x in 0..board.width {
            for y in 0..board.height {
                let s = area_map[y][x];

                if s == -1 {
                    result[y][x].0 += 1;
                } else if s == 1 {
                    result[y][x].1 += 1;
                }
            }
        }
    }

    result.into_iter()
    .map(|row| {
        row.into_iter()
        .map(|(n, p)| match p + n {
            0 => 0f32,
            _ => p as f32 / (p + n) as f32
        })
        .collect()
    })
    .collect()
}

pub fn play_till_end(data: BoardData, sign: i8) -> BoardData {
    let mut rng = rand::thread_rng();
    let mut sign = sign;
    let mut board = PseudoBoard::new(data);
    let mut illegal_vertices = vec![];
    let width = board.width;
    let height = board.height;
    
    let mut free_vertices = (0..width).flat_map(|x| {
        (0..height).map(move |y| Vertex(x, y))
    })
    .filter(|&v| board.get(v).unwrap() == 0)
    .collect::<Vec<_>>();

    let mut finished = vec![false, false];

    while free_vertices.len() > 0 && finished.contains(&false) {
        let mut made_move = false;

        while free_vertices.len() > 0 {
            let random_index = rng.gen_range(0, free_vertices.len());
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

    // Patch holes

    let vertices = (0..width).flat_map(|x| {
        (0..height).map(move |y| Vertex(x, y))
    });

    for vertex in vertices {
        if board.get(vertex).unwrap() != 0 {
            continue;
        }

        let neighbors = get_neighbors(vertex);
        let mut sign = 0;

        for v in neighbors.into_iter() {
            let s = match board.get(v) {
                Some(x) => x,
                None => continue
            };

            if s == 1 || s == -1 {
                sign = s;
                break;
            }
        }

        if sign != 0 {
            board.set(vertex, sign);
        }
    }

    board.data
}

pub fn get_floating_stones(data: BoardData) -> Vec<Vertex> {
    PseudoBoard::new(data).get_floating_stones()
}
