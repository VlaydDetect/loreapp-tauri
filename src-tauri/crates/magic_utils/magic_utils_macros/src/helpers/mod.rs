pub use self::case_style::snakify;
pub use self::inner_variant_props::HasInnerVariantProperties;
pub use self::type_props::HasTypeProperties;
pub use self::variant_props::HasMagicVariantProperties;

pub mod case_style;
pub mod inner_variant_props;
mod metadata;
pub mod type_props;
pub mod variant_props;

use proc_macro2::Span;
use quote::ToTokens;
use syn::spanned::Spanned;

pub fn non_enum_error() -> syn::Error {
    syn::Error::new(Span::call_site(), "This macro only supports enums.")
}

pub fn occurrence_error<T: ToTokens>(fst: T, snd: T, attr: &str) -> syn::Error {
    let mut e = syn::Error::new_spanned(
        snd,
        format!("Found multiple occurrences of magic({})", attr),
    );
    e.combine(syn::Error::new_spanned(fst, "first one here"));
    e
}
