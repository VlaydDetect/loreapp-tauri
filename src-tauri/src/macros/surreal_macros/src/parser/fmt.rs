use std::cell::Cell;
use std::fmt::{self, Display, Formatter};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

/// Implements `fmt::Display` by calling formatter on contents.
pub struct Fmt<T, F> {
    contents: Cell<Option<T>>,
    formatter: F,
}

impl<T, F: Fn(T, &mut Formatter<'_>) -> fmt::Result> Fmt<T, F> {
    pub fn new(t: T, formatter: F) -> Self {
        Self {
            contents: Cell::new(Some(t)),
            formatter,
        }
    }
}

impl<T, F: Fn(T, &mut Formatter<'_>) -> fmt::Result> Display for Fmt<T, F> {
    /// fmt is single-use only.
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let contents = self
            .contents
            .replace(None)
            .expect("only call Fmt::fmt once");
        (self.formatter)(contents, f)
    }
}

impl<I: IntoIterator<Item = T>, T: Display> Fmt<I, fn(I, &mut Formatter<'_>) -> fmt::Result> {
    /// Formats values with a comma and a space separating them.
    pub fn comma_separated(into_iter: I) -> Self {
        Self::new(into_iter, fmt_comma_separated)
    }

    /// Formats values with a verbar and a space separating them.
    pub fn verbar_separated(into_iter: I) -> Self {
        Self::new(into_iter, fmt_verbar_separated)
    }
}

fn fmt_comma_separated<T: Display, I: IntoIterator<Item = T>>(
    into_iter: I,
    f: &mut Formatter<'_>,
) -> fmt::Result {
    for (i, v) in into_iter.into_iter().enumerate() {
        if i > 0 {
            f.write_str(", ")?;
        }
        Display::fmt(&v, f)?;
    }
    Ok(())
}

fn fmt_verbar_separated<T: Display, I: IntoIterator<Item = T>>(
    into_iter: I,
    f: &mut Formatter<'_>,
) -> fmt::Result {
    for (i, v) in into_iter.into_iter().enumerate() {
        if i > 0 {
            f.write_str(" | ")?;
        }
        Display::fmt(&v, f)?;
    }
    Ok(())
}

thread_local! {
    // Avoid `RefCell`/`UnsafeCell` by using atomic types. Access is synchronized due to
    // `thread_local!` so all accesses can use `Ordering::Relaxed`.

    /// Whether pretty-printing.
    static PRETTY: AtomicBool = AtomicBool::new(false);
    /// The current level of indentation, in units of tabs.
    static INDENT: AtomicU32 = AtomicU32::new(0);
    /// Whether the next formatting action should be preceded by a newline and indentation.
    static NEW_LINE: AtomicBool = AtomicBool::new(false);
}

/// An adapter that, if enabled, adds pretty print formatting.
pub struct Pretty<W: std::fmt::Write> {
    inner: W,
    /// This is the active pretty printer, responsible for injecting formatting.
    active: bool,
}

impl<W: std::fmt::Write> Pretty<W> {
    #[allow(unused)]
    pub fn new(inner: W) -> Self {
        Self::conditional(inner, true)
    }

    pub fn conditional(inner: W, enable: bool) -> Self {
        let pretty_started_here = enable
            && PRETTY.with(|pretty| {
            // Evaluates to true if PRETTY was false and is now true.
            pretty
                .compare_exchange(false, true, Ordering::Relaxed, Ordering::Relaxed)
                .is_ok()
        });
        if pretty_started_here {
            // Clean slate.
            NEW_LINE.with(|new_line| new_line.store(false, Ordering::Relaxed));
            INDENT.with(|indent| indent.store(0, Ordering::Relaxed));
        }
        Self {
            inner,
            // Don't want multiple active pretty printers, although they wouldn't necessarily misbehave.
            active: pretty_started_here,
        }
    }
}

impl<'a, 'b> From<&'a mut Formatter<'b>> for Pretty<&'a mut Formatter<'b>> {
    fn from(f: &'a mut Formatter<'b>) -> Self {
        Self::conditional(f, f.alternate())
    }
}

impl<W: std::fmt::Write> Drop for Pretty<W> {
    fn drop(&mut self) {
        if self.active {
            PRETTY.with(|pretty| {
                debug_assert!(
                    pretty.load(Ordering::Relaxed),
                    "pretty status changed unexpectedly"
                );
                pretty.store(false, Ordering::Relaxed);
            });
        }
    }
}

/// When dropped, applies the opposite increment to the current indentation level.
pub struct PrettyGuard {
    increment: i8,
}

impl PrettyGuard {
    fn raw(increment: i8) {
        INDENT.with(|indent| {
            // Equivalent to `indent += increment` if signed numbers could be added to unsigned
            // numbers in stable, atomic Rust.
            if increment >= 0 {
                indent.fetch_add(increment as u32, Ordering::Relaxed);
            } else {
                indent.fetch_sub(u32::from(increment.unsigned_abs()), Ordering::Relaxed);
            }
        });
        NEW_LINE.with(|new_line| new_line.store(true, Ordering::Relaxed));
    }
}

impl Drop for PrettyGuard {
    fn drop(&mut self) {
        Self::raw(-self.increment);
    }
}

impl<W: std::fmt::Write> std::fmt::Write for Pretty<W> {
    fn write_str(&mut self, s: &str) -> std::fmt::Result {
        if self.active && NEW_LINE.with(|new_line| new_line.swap(false, Ordering::Relaxed)) {
            // Newline.
            self.inner.write_char('\n')?;
            for _ in 0..INDENT.with(|indent| indent.load(Ordering::Relaxed)) {
                // One level of indentation.
                self.inner.write_char('\t')?;
            }
        }
        // What we were asked to write.
        self.inner.write_str(s)
    }
}