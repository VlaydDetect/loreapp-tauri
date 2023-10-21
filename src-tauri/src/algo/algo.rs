use std::borrow::Cow;

pub fn accumulate<T, F>(collection: &[T], predicate: F) -> T
    where
        T: Default + std::ops::Add<Output = T> + Copy,
        F: Fn(&T) -> bool,
{
    collection.into_iter().filter(|&x| predicate(x)).fold(T::default(), |acc, &x| acc + x)
}

pub fn copy<T, I, C>(iterable: I, container: &mut C)
    where
        T: Clone,
        I: IntoIterator<Item = T>,
        C: std::iter::Extend<T>,
{
    iterable.into_iter().for_each(|item| {
        container.extend(std::iter::once(item.clone()));
    });

    // for item in iterable {
    //     container.extend(std::iter::once(item.clone()));
    // }
}

pub fn copy_if<T, P, I, C>(iterable: I, container: &mut C, predicate: P)
    where
        T: Clone,
        P: Fn(&T) -> bool,
        I: IntoIterator<Item = T>,
        C: std::iter::Extend<T>,
{
    iterable.into_iter().for_each(|item| {
        if predicate(&item) {
            container.extend(std::iter::once(item.clone()));
        }
    });

    // for item in iterable {
    //     if predicate(&item) {
    //         container.extend(std::iter::once(item.clone()));
    //     }
    // }
}
