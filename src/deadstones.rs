use vertex::*;
use pseudo_board::*;

pub fn guess<T>(data: BoardData, finished: bool, iterations: usize, random: T) -> Vec<Vertex>
where T: Fn() -> f32 {
    let mut board = PseudoBoard::new(data);
    let mut result = vec![];
    let mut floating = vec![];

    if finished {
        floating = board.get_floating_stones();

        for &v in &floating {
            board.set(v, 0);
        }
    }

    let map = get_probability_map(board.data.clone(), iterations, || random());
    let mut done = vec![];

    for x in 0..board.width {
        for y in 0..board.height {
            let vertex = Vertex(x, y);
            let sign = match board.get(vertex) {
                Some(x) => x,
                None => continue
            };

            if sign == 0 || done.contains(&vertex) {
                continue;
            }

            let chain = board.get_chain(vertex);
            let probability = chain.iter()
                .map(|&Vertex(x, y)| map[y][x])
                .sum::<f32>() / chain.len() as f32;
            let new_sign = probability.signum() as Sign;

            for &v in &chain {
                if new_sign == -sign {
                    result.push(v);
                }

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

pub fn get_probability_map<T>(data: BoardData, iterations: usize, random: T) -> Vec<Vec<f32>>
where T: Fn() -> f32 {
    let board = PseudoBoard::new(data);
    let mut result = (0..board.height).map(|_| {
        (0..board.width).map(|_| (0u32, 0u32)).collect::<Vec<_>>()
    }).collect::<Vec<_>>();

    for _ in 0..iterations {
        let s = if random() - 0.5 < 0.0 { -1 } else { 1 };
        let area_map = play_till_end(board.data.clone(), s, || random());

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

pub fn play_till_end<T>(data: BoardData, sign: Sign, random: T) -> BoardData
where T: Fn() -> f32 {
    let mut sign = match sign {
        0 => return data,
        x => x
    };

    let mut board = PseudoBoard::new(data);
    let mut illegal_vertices = vec![];
    let width = board.width;
    let height = board.height;
    
    let mut free_vertices = (0..width).flat_map(|x| {
        (0..height).map(move |y| Vertex(x, y))
    })
    .filter(|&v| board.get(v) == Some(0))
    .collect::<Vec<_>>();

    let mut finished = vec![false, false];
    let mut iterations = 0;

    while free_vertices.len() > 0 && finished.contains(&false) && iterations < 10000 {
        let mut made_move = false;

        while free_vertices.len() > 0 {
            let random_index = (random() * free_vertices.len() as f32).floor() as usize;
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
        iterations += 1;
    }

    // Patch holes

    let vertices = (0..width).flat_map(|x| {
        (0..height).map(move |y| Vertex(x, y))
    });

    for vertex in vertices {
        if board.get(vertex) != Some(0) {
            continue;
        }

        let neighbors = vertex.get_neighbors();
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
