use atomic::Atomic;
use log::info;
use std::{convert::TryFrom, fs::File, marker::PhantomData, path::Path, sync::Arc};

use crate::index::Idx;

use parking_lot::Mutex;
use rayon::prelude::*;

use crate::{input::Direction, Error};

pub trait ToGraph {

}
