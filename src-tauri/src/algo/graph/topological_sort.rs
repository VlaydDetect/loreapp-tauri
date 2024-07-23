use std::collections::{HashMap, HashSet};
use std::hash::Hash;

type GraphStruct<T> = HashMap<T, HashSet<T>>;

pub struct State<T> {
    depends_on: GraphStruct<T>,
    dependents: GraphStruct<T>,
    no_deps: Vec<T>,
}

#[inline]
pub fn add_edge<T>(graph: &mut GraphStruct<T>, from: T, to: T)
    where T: Eq + Hash + Copy
{
    graph
        .entry(from)
        .and_modify(|pointees| {
            pointees.insert(to);
        })
        .or_insert_with(|| {
            let mut s = HashSet::new();
            s.insert(to);
            s
        });
}

impl<T> State<T>
    where T: Eq + Hash
{
    pub fn get_dependents(&self, dependency: &T) -> Option<&HashSet<T>> {
        self.dependents.get(dependency)
    }

    pub fn is_resolved(&self) -> bool {
        self.depends_on.is_empty()
    }
}

impl<T> State<T>
    where T: Eq + Hash + Copy
{
    pub fn resolve(&mut self, dependent: &T, dependency: &T) {
        if let Some(dependencies) = self.depends_on.get_mut(dependent) {
            dependencies.remove(&dependency);

            if dependencies.is_empty() {
                self.no_deps.push(*dependent);

                // to be able to report unresolved
                self.depends_on.remove(dependent);
            }
        }
    }

    pub fn unresolved(&self) -> impl Iterator<Item = &T> {
        self.depends_on.keys()
    }
}

pub fn topological_sort<T, Id>(deps: T) -> Result<Vec<Id>, Box<dyn std::error::Error>>
    where Id: Eq + Hash + Copy,
          State<Id>: From<T>
{
    let mut res = vec![];
    let mut state = State::from(deps);

    while let Some(node) = state.no_deps.pop() {
        res.push(node);

        if let Some(dependents) = state.get_dependents(&node) {
            for dependent in dependents.clone() {
                state.resolve(&dependent, &node);
            }
        }
    }

    match state.is_resolved() {
        true => Ok(res),
        false => Err(Box::from("The graph topology cannot be constructed")),
    }
}
