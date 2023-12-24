use crate::utils::{get_field_attribute, get_meta_value_string};
use syn::punctuated::Punctuated;
use syn::Field;
use syn::{Meta, Token};

pub struct MoqlFieldAttr {
    pub context_path: Option<String>,
}

pub fn get_modql_field_attr(field: &Field) -> Result<MoqlFieldAttr, syn::Error> {
    let attribute = get_field_attribute(field, "modql");

    let mut context_path: Option<String> = None;

    if let Some(attribute) = attribute {
        let nested = attribute.parse_args_with(Punctuated::<Meta, Token![,]>::parse_terminated)?;

        for meta in nested {
            match meta {
                // #[modql(context_path= "project")]
                Meta::NameValue(nv) => {
                    if nv.path.is_ident("context_path") {
                        context_path = get_meta_value_string(nv);
                    }
                }

                /* ... */
                _ => {
                    return Err(syn::Error::new_spanned(meta, "unrecognized field"));
                }
            }
        }
    }

    Ok(MoqlFieldAttr { context_path })
}
