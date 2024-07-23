// #![allow(unused)]
use crate::derive_filter_nodes::derive_filter_nodes_inner;
use proc_macro::TokenStream;

mod derive_filter_nodes;
mod utils;

#[proc_macro_derive(FilterNodes, attributes(modql))]
pub fn derive_filter_nodes(input: TokenStream) -> TokenStream {
    derive_filter_nodes_inner(input)
}
