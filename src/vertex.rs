pub type Sign = i8;

#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub struct Vertex(pub usize, pub usize);

pub fn get_neighbors(Vertex(x, y): Vertex) -> Vec<Vertex> {
    vec![Vertex(x - 1, y), Vertex(x + 1, y), Vertex(x, y - 1), Vertex(x, y + 1)]
}
