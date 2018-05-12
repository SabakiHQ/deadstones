use rand::Rand;
use pseudo_board::*;

pub fn guess(mut board: PseudoBoard, finished: bool, iterations: usize, rand: &mut Rand) -> Vec<Vertex> {
    let mut result = vec![];
    let mut floating = vec![];

    if finished {
        floating = board.get_floating_stones();

        for &v in &floating {
            board.set(v, 0);
        }
    }

    let map = get_probability_map(board.clone(), iterations, rand);
    let mut done = vec![];

    for vertex in 0..map.len() {
        let sign = match board.get(vertex) {
            Some(x) => x,
            None => continue
        };

        if sign == 0 || done.contains(&vertex) {
            continue;
        }

        let chain = board.get_chain(vertex);
        let probability = chain.iter()
            .filter_map(|&v| map.get(v).cloned())
            .sum::<f32>() / chain.len() as f32;
        let new_sign = probability.signum() as Sign;

        for &v in &chain {
            if new_sign == -sign {
                result.push(v);
            }

            done.push(v);
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
        let dead_probability = related.iter()
            .filter(|&v| result.contains(v)).count() as f32
            / related.len() as f32;

        for &v in &related {
            if dead_probability > 0.5 {
                updated_result.push(v);
            }

            done.push(v);
        }
    }

    updated_result
}

pub fn get_probability_map(board: PseudoBoard, iterations: usize, rand: &mut Rand) -> Vec<f32> {
    let mut result = board.data.iter().map(|_| (0, 0)).collect::<Vec<_>>();

    for _ in 0..iterations {
        let sign = if rand.float() - 0.5 < 0.0 { -1 } else { 1 };
        let area_map = play_till_end(board.clone(), sign, rand);

        for i in 0..area_map.data.len() {
            let s = match area_map.get(i) {
                Some(x) => x,
                None => continue
            };

            if let Some(mut slots) = result.get_mut(i) {
                if s == -1 {
                    slots.0 += 1;
                } else if s == 1 {
                    slots.1 += 1;
                }
            }
        }
    }

    result.into_iter()
    .map(|(n, p)| match p + n {
        0 => 0.0,
        _ => (p as f32 / (p + n) as f32) * 2.0 - 1.0
    })
    .collect()
}

pub fn play_till_end(mut board: PseudoBoard, mut sign: Sign, rand: &mut Rand) -> PseudoBoard {
    let mut illegal_vertices = vec![];
    let mut free_vertices = (0..board.data.len())
        .filter(|&v| board.get(v) == Some(0))
        .collect::<Vec<_>>();

    let mut finished = vec![false, false];

    while free_vertices.len() > 0 && finished.contains(&false) {
        let mut made_move = false;

        while free_vertices.len() > 0 {
            let random_index = rand.range(0, free_vertices.len() as i32) as usize;
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

        finished[if sign > 0 { 0 } else { 1 }] = !made_move;

        free_vertices.append(&mut illegal_vertices);
        sign = -sign;
    }

    // Patch holes

    for vertex in 0..board.data.len() {
        if board.get(vertex) != Some(0) {
            continue;
        }

        let mut sign = 0;

        for n in board.get_neighbors(vertex).into_iter() {
            let s = board.get(n);

            if s == Some(1) || s == Some(-1) {
                sign = s.unwrap_or(0);
                break;
            }
        }

        if sign != 0 {
            board.set(vertex, sign);
        }
    }

    board
}
