//! # Magic Utils

extern crate proc_macro;

mod helpers;
mod macros;

use proc_macro2::TokenStream;
use std::env;
use syn::DeriveInput;

fn debug_print_generated(ast: &DeriveInput, tokens: &TokenStream) {
    let debug = env::var("MAGIC_UTILS_DEBUG");
    if let Ok(s) = debug {
        if s == "1" {
            println!("{tokens}");
        }

        if ast.ident == s {
            println!("{tokens}");
        }
    }
}

#[proc_macro_derive(EnumString, attributes(magic))]
pub fn from_string(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let ast = syn::parse_macro_input!(input as DeriveInput);
    let tokens =
        macros::from_string::from_string_inner(&ast).unwrap_or_else(|err| err.to_compile_error());
    debug_print_generated(&ast, &tokens);
    tokens.into()
}
