mod utils;

use crate::derive_filter_nodes::utils::get_modql_field_attr;
use crate::utils::{get_struct_fields, get_type_name};
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput, Ident};

pub fn derive_filter_nodes_inner(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);

    //// get struct name and fields
    let struct_name = &ast.ident;
    let fields = get_struct_fields(&ast);

    //// Properties to be collected
    let mut props: Vec<&Option<Ident>> = Vec::new(); // not needed for now.
    let mut prop_opval_idents: Vec<&Ident> = Vec::new();
    let mut props_opval_contexts: Vec<proc_macro2::TokenStream> = Vec::new();

    for field in fields.named.iter() {
        // NOTE: By macro limitation, we can do only type name match and it would not support type alias
        //       For now, assume Option is use as is, not even in a fully qualified way.
        //       We can add other variants of Option if proven needed
        let type_name = get_type_name(field);

        // NOTE: For now only convert the properties of types with option and OpVal
        if type_name.starts_with("Option ") && type_name.contains("OpVal") {
            if let Some(ident) = field.ident.as_ref() {
                prop_opval_idents.push(ident);

                // -- Extract the attributes
                let modql_field_attr = get_modql_field_attr(field).unwrap();

                // -- context_path
                let block_context = if let Some(context_path) = modql_field_attr.context_path {
                    quote! {
                        Some(#context_path.to_string())
                    }
                } else {
                    quote! { None }
                };
                props_opval_contexts.push(block_context);
            }
        } else {
            props.push(&field.ident);
        }
    }

    let ff_opt_node_pushes = quote! {
        #(
            if let Some(val) = self.#prop_opval_idents {
                let op_vals: Vec<surreal_qb::filter::OpVal> = val.0.into_iter().map(|n| n.into()).collect();
                let node = surreal_qb::filter::FilterNode{
                    context_path: #props_opval_contexts,
                    name: stringify!(#prop_opval_idents).to_string(),
                    opvals: op_vals,
                };
                nodes.push(node);
            }
        )*
    };

    //// Out code for the impl IntoFilterNodes
    let out_impl_into_filter_nodes = quote! {
        impl surreal_qb::filter::IntoFilterNodes for #struct_name {
            fn filter_nodes(self, context: Option<String>) -> Vec<surreal_qb::filter::FilterNode> {
                let mut nodes = Vec::new();
                #ff_opt_node_pushes
                nodes
            }
        }
    };

    //// Out code for the from struct for Vec<FilterNode>
    let out_into_filter_node = quote! {
        impl From<#struct_name> for Vec<surreal_qb::filter::FilterNode> {
            fn from(val: #struct_name) -> Self {
                surreal_qb::filter::IntoFilterNodes::filter_nodes(val, None)
            }
        }
    };

    let out_into_op_group = quote! {
        impl From<#struct_name> for surreal_qb::filter::FilterGroup {
            fn from(val: #struct_name) -> Self {
                let nodes: Vec<surreal_qb::filter::FilterNode> = val.into();
                nodes.into()
            }
        }
    };

    //// Out code for from struct for FilterGroups
    let out_into_op_groups = quote! {
        impl From<#struct_name> for surreal_qb::filter::FilterGroups {
            fn from(val: #struct_name) -> Self {
                let nodes: Vec<surreal_qb::filter::FilterNode> = val.into();
                nodes.into()
            }
        }
    };

    //// Final out code
    let output = quote! {
        #out_impl_into_filter_nodes
        #out_into_filter_node
        #out_into_op_group
        #out_into_op_groups
    };

    output.into()
}
