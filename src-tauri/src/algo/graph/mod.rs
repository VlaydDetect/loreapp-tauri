use std::collections::{HashMap};
use std::hash::Hash;

mod topological_sort;

pub struct Graph<VId, E = (), V = ()> {
    vertices: HashMap<VId, V>,
    adjacency: HashMap<VId, Vec<(VId, E)>>
}

impl<VId, E, V> Graph<VId, E, V>
    where VId: Eq + Hash,
          V: Hash,
{
    pub fn new() -> Graph<VId, E, V> {
        Graph {
            vertices: HashMap::new(),
            adjacency: HashMap::new(),
        }
    }

    pub fn push_vertex(&mut self, vid: VId, vertex: V) {
        self.vertices.insert(vid, vertex);
    }

    pub fn push_edge(&mut self, from: VId, to: VId, edge: E) {
        let adjacency_to_from = self.adjacency.entry(from).or_default();
        adjacency_to_from.push((to, edge));
    }
}

impl<VId, E> Graph<VId, E, ()>
    where VId: Eq + Hash,
{
    pub fn push_vid(&mut self, vid: VId) {
        self.vertices.insert(vid, ());
    }
}

impl<VId, E, V> Graph<VId, E, V>
    where VId: Eq + Hash + Clone,
          V: Hash,
          E: Clone,
{
    pub fn push_undirected_edge(&mut self, from: VId, to: VId, edge: E) {
        self.push_edge(from.clone(), to.clone(), edge.clone());
        self.push_edge(to, from, edge);
    }
}
