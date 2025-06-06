//! # Magic Utils

mod additional_attributes;

use core::iter::FusedIterator;

#[cfg(feature = "phf")]
#[doc(hidden)]
pub use phf as _private_phf_reexport_for_macro_if_phf_feature;

/// The `ParseError` enum is a collection of all the possible reasons
/// an enum can fail to parse from a string.
#[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
pub enum ParseError {
    VariantNotFound,
}

impl std::fmt::Display for ParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        // We could use our macro here, but this way we don't take a dependency on the
        // macros crate.
        match self {
            ParseError::VariantNotFound => write!(f, "Matching variant not found"),
        }
    }
}

impl std::error::Error for ParseError {
    fn description(&self) -> &str {
        match self {
            ParseError::VariantNotFound => {
                "Unable to find a variant of the given enum matching the string given. Matching \
                 can be extended with the Serialize attribute and is case sensitive."
            }
        }
    }
}

/// This trait designates that an `Enum` can be iterated over. It can
/// be auto generated using the [`EnumIter`](derive.EnumIter.html) derive macro.
///
/// # Example
///
/// ```rust
/// # use std::fmt::Debug;
/// // You need to bring the type into scope to use it!!!
/// use magic_utils::{EnumIter, IntoEnumIterator};
///
/// #[derive(EnumIter, Debug)]
/// enum Color {
///     Red,
///     Green { range: usize },
///     Blue(usize),
///     Yellow,
/// }
///
/// // Iterate over the items in an enum and perform some function on them.
/// fn generic_iterator<E, F>(pred: F)
/// where
///     E: IntoEnumIterator,
///     F: Fn(E),
/// {
///     for e in E::iter() {
///         pred(e)
///     }
/// }
///
/// generic_iterator::<Color, _>(|color| println!("{:?}", color));
/// ```
pub trait IntoEnumIterator: Sized {
    type Iterator: Iterator<Item = Self>
        + Clone
        + DoubleEndedIterator
        + ExactSizeIterator
        + FusedIterator;

    fn iter() -> Self::Iterator;
}

pub trait VariantIterator: Sized {
    type Iterator: Iterator<Item = Self>;

    fn iter() -> Self::Iterator;
}

pub trait VariantMetadata {
    const VARIANT_COUNT: usize;
    const VARIANT_NAMES: &'static [&'static str];

    fn variant_name(&self) -> &'static str;
}

/// Associates additional pieces of information with an Enum. This can be
/// autoimplemented by deriving `EnumMessage` and annotating your variants with
/// `#[magic(message="...")]`.
///
/// # Example
///
/// ```rust
/// # use std::fmt::Debug;
/// // You need to bring the type into scope to use it!!!
/// use magic_utils::EnumMessage;
///
/// #[derive(PartialEq, Eq, Debug, EnumMessage)]
/// enum Pet {
///     #[magic(message="I have a dog")]
///     #[magic(detailed_message="My dog's name is Spots")]
///     Dog,
///     /// I am documented.
///     #[magic(message="I don't have a cat")]
///     Cat,
/// }
///
/// let my_pet = Pet::Dog;
/// assert_eq!("I have a dog", my_pet.get_message().unwrap());
/// ```
pub trait EnumMessage {
    fn get_message(&self) -> Option<&'static str>;
    fn get_detailed_message(&self) -> Option<&'static str>;

    /// Get the doc comment associated with a variant if it exists.
    fn get_documentation(&self) -> Option<&'static str>;
    fn get_serializations(&self) -> &'static [&'static str];
}

/// `EnumProperty` is a trait that makes it possible to store additional information
/// with enum variants. This trait is designed to be used with the macro of the same
/// name in the `magic_utils_macros` crate. Currently, the only string literals are supported
/// in attributes, the other methods will be implemented as additional attribute types
/// become stabilized.
///
/// # Example
///
/// ```rust
/// # use std::fmt::Debug;
/// // You need to bring the type into scope to use it!!!
/// use magic_utils::EnumProperty;
///
/// #[derive(PartialEq, Eq, Debug, EnumProperty)]
/// enum Class {
///     #[magic(props(Teacher="Ms.Frizzle", Room="201"))]
///     History,
///     #[magic(props(Teacher="Mr.Smith"))]
///     #[magic(props(Room="103"))]
///     Mathematics,
///     #[magic(props(Time="2:30"))]
///     Science,
/// }
///
/// let history = Class::History;
/// assert_eq!("Ms.Frizzle", history.get_str("Teacher").unwrap());
/// ```
pub trait EnumProperty {
    fn get_str(&self, prop: &str) -> Option<&'static str>;
    fn get_int(&self, _prop: &str) -> Option<usize> {
        Option::None
    }

    fn get_bool(&self, _prop: &str) -> Option<bool> {
        Option::None
    }
}

/// A trait for capturing the number of variants in Enum. This trait can be autoderived by
/// `magic_utils_macros`.
pub trait EnumCount {
    const COUNT: usize;
}

/// A trait for retrieving the names of each variant in Enum. This trait can
/// be autoderived by `magic_utils_macros`.
pub trait VariantNames {
    /// Names of the variants of this enum
    const VARIANTS: &'static [&'static str];
}

/// A trait for retrieving a static array containing all the variants in an Enum.
/// This trait can be autoderived by `magic_utils_macros`. For derived usage, all the
/// variants in the enumerator need to be unit-types, which means you can't autoderive
/// enums with inner data in one or more variants. Consider using it alongside
/// [`EnumDiscriminants`] if you require inner data but still want to have an
/// static array of variants.
pub trait VariantArray: ::core::marker::Sized + 'static {
    const VARIANTS: &'static [Self];
}

#[cfg(feature = "derive")]
pub use magic_utils_macros::*;

macro_rules! DocumentMacroRexports {
    ($($export:ident),+) => {
        $(
            #[cfg(all(docsrs, feature = "derive"))]
            #[cfg_attr(docsrs, doc(cfg(feature = "derive")))]
            pub use magic_utils_macros::$export;
        )+
    };
}

// We actually only re-export these items individually if we're building
// for docsrs. You can do a weird thing where you rename the macro
// and then reference it through strum. The renaming feature should be deprecated now that
// 2018 edition is almost 2 years old, but we'll need to give people some time to do that.
DocumentMacroRexports! {
    AsRefStr,
    Display,
    EnumCount,
    EnumDiscriminants,
    EnumIter,
    EnumMessage,
    EnumProperty,
    EnumString,
    VariantNames,
    FromRepr,
    IntoStaticStr,
    VariantArray
}
