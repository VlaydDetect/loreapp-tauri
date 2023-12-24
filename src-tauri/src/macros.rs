use std::collections::HashSet;

#[macro_export]
macro_rules! ternary {
    ($test:expr => $true_expr:expr; $false_expr:expr) => {
        if $test {
            $true_expr
        } else {
            $false_expr
        }
    };
}

/**
    Create HashSet
 **/
#[macro_export]
macro_rules! set {
    ($($s:expr),*) => { HashSet::from([$($s),*]) };
}

// from: https://github.com/surrealdb/surrealdb.wasm/blob/main/src/mac/mod.rs
/**
    Create BTreeMap
**/
macro_rules! map {
    () => (
        ::std::collections::BTreeMap::new()
    );
    ($($k:expr => $v:expr),* $(,)?) => {{
		let mut m = ::std::collections::BTreeMap::new();
        $(m.insert($k, $v);)+
        m
    }};
}

pub(crate) use map;
pub(crate) use ternary;
pub(crate) use set;