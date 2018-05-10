pub type Sign = i8;

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Vertex(pub usize, pub usize);

impl Vertex {
    pub fn get_neighbors(&self) -> Vec<Vertex> {
        let (x, y) = (self.0, self.1);

        vec![Vertex(x - 1, y), Vertex(x + 1, y), Vertex(x, y - 1), Vertex(x, y + 1)]
    }
}

