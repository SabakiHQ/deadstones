pub type Sign = i8;
pub type Vertex = usize;

#[derive(Debug, Clone)]
pub struct PseudoBoard {
    pub data: Vec<Sign>,
    pub width: usize,
    pub height: usize
}

impl PseudoBoard {
    pub fn new(data: Vec<Sign>, width: usize) -> PseudoBoard {
        let height = match data.len().checked_div(width) {
            Some(x) => x,
            None => 0
        };

        PseudoBoard {data, width, height}
    }

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

        if v % self.width > 0 {
            result.push(v - 1);
        }

        if v % self.width < self.width - 1 {
            result.push(v + 1);
        }

        result
    }

    fn get_connected_component_inner(
        &self,
        vertex: Vertex,
        signs: &[Sign],
        mut result: Vec<Vertex>
    ) -> Vec<Vertex> {
        for neighbor in self.get_neighbors(vertex).into_iter() {
            let s = match self.get(neighbor) {
                Some(x) => x,
                None => continue
            };

            if !signs.contains(&s) || result.contains(&neighbor) {
                continue;
            }

            result.push(neighbor);
            result = self.get_connected_component_inner(neighbor, signs, result);
        }

        result
    }

    pub fn get_connected_component(&self, vertex: Vertex, signs: &[Sign]) -> Vec<Vertex> {
        self.get_connected_component_inner(vertex, signs, vec![vertex])
    }

    pub fn get_related_chains(&self, vertex: Vertex) -> Vec<Vertex> {
        let sign = match self.get(vertex) {
            Some(x) => x,
            None => return vec![]
        };

        self.get_connected_component(vertex, &vec![sign, 0])
        .into_iter()
        .filter(|&v| self.get(v) == Some(sign))
        .collect()
    }

    pub fn get_chain(&self, vertex: Vertex) -> Vec<Vertex> {
        let sign = match self.get(vertex) {
            Some(x) => x,
            None => return vec![]
        };

        self.get_connected_component(vertex, &vec![sign])
    }

    fn has_liberties_inner(
        &self,
        vertex: Vertex,
        mut visited: Vec<Vertex>,
        sign: Sign
    ) -> (Vec<Vertex>, bool) {
        let neighbors = self.get_neighbors(vertex);
        let mut friendly_neighbors = vec![];

        for neighbor in neighbors.into_iter() {
            match self.get(neighbor) {
                Some(0) => return (visited, true),
                Some(s) if s == sign => friendly_neighbors.push(neighbor),
                _ => ()
            };
        }

        visited.push(vertex);

        for neighbor in friendly_neighbors.into_iter() {
            if visited.contains(&neighbor) {
                continue;
            }

            visited = match self.has_liberties_inner(neighbor, visited, sign) {
                (x, true) => return (x, true),
                (x, false) => x
            };
        }

        (visited, false)
    }

    pub fn has_liberties(&self, vertex: Vertex) -> bool {
        self.has_liberties_inner(vertex, vec![], match self.get(vertex) {
            Some(x) => x,
            None => return false
        }).1
    }

    pub fn make_pseudo_move(&mut self, sign: Sign, vertex: Vertex) -> Option<Vec<Vertex>> {
        if sign != 1 && sign != -1 {
            return None;
        }

        let neighbors = self.get_neighbors(vertex);
        let mut check_capture = false;

        if neighbors.iter().all(|&neighbor| {
            match self.get(neighbor) {
                None => true,
                Some(s) if s == sign => true,
                _ => false
            }
        }) {
            return None;
        }

        self.set(vertex, sign);

        if !self.has_liberties(vertex) {
            check_capture = true;
        }

        let mut dead = vec![];

        for &neighbor in neighbors.iter() {
            match self.get(neighbor) {
                Some(s) if s != -sign => continue,
                Some(_) if self.has_liberties(neighbor) => continue,
                _ => ()
            }

            let chain = self.get_chain(neighbor);

            for c in chain.into_iter() {
                self.set(c, 0);
                dead.push(c);
            }
        }

        if check_capture && dead.len() == 0 {
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

            let pos_area = self.get_connected_component(vertex, &vec![0, -1]);
            let neg_area = self.get_connected_component(vertex, &vec![0, 1]);
            let pos_dead = pos_area.iter().cloned()
                .filter(|&v| self.get(v) == Some(-1)).collect::<Vec<_>>();
            let neg_dead = neg_area.iter().cloned()
                .filter(|&v| self.get(v) == Some(1)).collect::<Vec<_>>();
            let pos_diff = pos_area.iter().cloned()
                .filter(|v| !pos_dead.contains(v) && !neg_area.contains(v)).count();
            let neg_diff = neg_area.iter().cloned()
                .filter(|v| !neg_dead.contains(v) && !pos_area.contains(v)).count();

            let mut sign = 0;

            if neg_diff <= 1 && neg_dead.len() <= pos_dead.len() {
                sign -= 1;
            }

            if pos_diff <= 1 && pos_dead.len() <= neg_dead.len() {
                sign += 1;
            }

            let (actual_area, mut actual_dead) = match sign {
                1 => (pos_area, pos_dead),
                -1 => (neg_area, neg_dead),
                _ => (self.get_chain(vertex), vec![])
            };

            for &v in actual_area.iter() {
                done.push(v);
            }

            result.append(&mut actual_dead);
        }

        result
    }
}
