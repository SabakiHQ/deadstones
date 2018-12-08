pub type Sign = i8;
pub type Vertex = usize;

#[derive(Clone)]
pub struct PseudoBoard {
    pub data: Vec<Sign>,
    pub width: usize
}

impl PseudoBoard {
    pub fn get(&self, v: Vertex) -> Option<Sign> {
        self.data.get(v).cloned()
    }

    pub fn set(&mut self, v: Vertex, sign: Sign) {
        if let Some(x) = self.data.get_mut(v) {
            *x = sign;
        }
    }

    pub fn get_neighbors(&self, v: Vertex) -> Vec<Vertex> {
        let mut result = vec![v - self.width, v + self.width];
        let x = v % self.width;

        if x > 0 {
            result.push(v - 1);
        }

        if x < self.width - 1 {
            result.push(v + 1);
        }

        result
    }

    fn get_connected_component_inner(
        &self,
        vertex: Vertex,
        signs: &[Sign],
        result: &mut Vec<Vertex>
    ) {
        result.push(vertex);

        for neighbor in self.get_neighbors(vertex).into_iter() {
            let s = match self.get(neighbor) {
                Some(x) => x,
                None => continue
            };

            if signs.contains(&s) && !result.contains(&neighbor) {
                self.get_connected_component_inner(neighbor, signs, result);
            }
        }
    }

    pub fn get_connected_component(&self, vertex: Vertex, signs: &[Sign]) -> Vec<Vertex> {
        let mut result = vec![];
        self.get_connected_component_inner(vertex, signs, &mut result);
        result
    }

    pub fn get_related_chains(&self, vertex: Vertex) -> Vec<Vertex> {
        let sign = match self.get(vertex) {
            Some(x) => x,
            None => return vec![]
        };

        self.get_connected_component(vertex, &[sign, 0])
        .into_iter()
        .filter(|&v| self.get(v) == Some(sign))
        .collect()
    }

    pub fn get_chain(&self, vertex: Vertex) -> Vec<Vertex> {
        let sign = match self.get(vertex) {
            Some(x) => x,
            None => return vec![]
        };

        self.get_connected_component(vertex, &[sign])
    }

    fn has_liberties_inner(
        &self,
        vertex: Vertex,
        visited: &mut Vec<Vertex>,
        sign: Sign
    ) -> bool {
        visited.push(vertex);

        for neighbor in self.get_neighbors(vertex).into_iter() {
            match self.get(neighbor) {
                Some(0) => return true,
                Some(x) if x == sign && !visited.contains(&neighbor) => {
                    if self.has_liberties_inner(neighbor, visited, sign) {
                        return true;
                    }
                },
                _ => {}
            }
        }

        false
    }

    pub fn has_liberties(&self, vertex: Vertex) -> bool {
        self.has_liberties_inner(vertex, &mut vec![], match self.get(vertex) {
            Some(x) => x,
            None => return false
        })
    }

    pub fn make_pseudo_move(&mut self, sign: Sign, vertex: Vertex) -> Option<Vec<Vertex>> {
        let neighbors = self.get_neighbors(vertex);
        let mut check_capture = false;
        let mut check_multi_dead_chains = false;

        if neighbors.iter().all(|&neighbor| {
            let s = self.get(neighbor);
            s == None || s == Some(sign)
        }) {
            return None;
        }

        self.set(vertex, sign);

        if !self.has_liberties(vertex) {
            let is_point_chain = neighbors.iter()
                .all(|&n| self.get(n) != Some(sign));

            if is_point_chain {
                check_multi_dead_chains = true;
            } else {
                check_capture = true;
            }
        }

        let mut dead = vec![];
        let mut dead_chains = 0;

        for neighbor in neighbors.into_iter() {
            if self.get(neighbor) != Some(-sign) || self.has_liberties(neighbor) {
                continue;
            }

            let chain = self.get_chain(neighbor);
            dead_chains += 1;

            for c in chain.into_iter() {
                self.set(c, 0);
                dead.push(c);
            }
        }

        if check_multi_dead_chains && dead_chains <= 1
        || check_capture && dead.len() == 0 {
            for &d in &dead {
                self.set(d, -sign);
            }

            self.set(vertex, 0);
            return None;
        }

        Some(dead)
    }

    pub fn get_floating_stones(&self) -> Vec<Vertex> {
        let mut done = vec![];
        let mut result = vec![];

        for vertex in 0..self.data.len() {
            if self.get(vertex) != Some(0) || done.contains(&vertex) {
                continue;
            }

            let pos_area = self.get_connected_component(vertex, &[0, -1]);
            let neg_area = self.get_connected_component(vertex, &[0, 1]);
            let pos_dead = pos_area.iter().cloned()
                .filter(|&v| self.get(v) == Some(-1)).collect::<Vec<_>>();
            let neg_dead = neg_area.iter().cloned()
                .filter(|&v| self.get(v) == Some(1)).collect::<Vec<_>>();
            let pos_diff = pos_area.iter()
                .filter(|&v| !pos_dead.contains(v) && !neg_area.contains(v)).count();
            let neg_diff = neg_area.iter()
                .filter(|&v| !neg_dead.contains(v) && !pos_area.contains(v)).count();

            let favor_neg = neg_diff <= 1 && neg_dead.len() <= pos_dead.len();
            let favor_pos = pos_diff <= 1 && pos_dead.len() <= neg_dead.len();

            let (mut actual_area, mut actual_dead) = match (favor_neg, favor_pos) {
                (false, true) => (pos_area, pos_dead),
                (true, false) => (neg_area, neg_dead),
                _ => (self.get_chain(vertex), vec![])
            };

            done.append(&mut actual_area);
            result.append(&mut actual_dead);
        }

        result
    }
}
