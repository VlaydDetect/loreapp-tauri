use num::{Num, one, Signed, Unsigned, zero};
use num::traits::{NumAssignOps, NumRef};
use rayon::prelude::*;

trait AnyNum: Num + Signed + NumRef + Clone + NumAssignOps + Send + Sync {}

#[derive(Clone)]
struct Matrix<T>
    where T: AnyNum
{
    rows: usize,
    cols: usize,
    data: Vec<Vec<T>>,

    is_echelon_form: bool,
}

impl<T> Matrix<T>
    where T: AnyNum
{
    pub fn new(rows: usize, cols: usize) -> Self {
        let zero = zero::<T>();
        let data = vec![vec![zero; cols]; rows];
        Matrix { rows, cols, data, is_echelon_form: false }
    }

    pub fn new_unit(rank: usize) -> Self {
        let zero = zero::<T>();
        let mut data = vec![vec![zero; rank]; rank];

        for i in 0..rank {
            for j in 0..rank {
                if i == j {
                    data[i][j] = one::<T>();
                }
            }
        }

        Matrix { rows: rank, cols: rank, data, is_echelon_form: false }
    }

    pub fn set(&mut self, data: Vec<Vec<T>>) {
        if data.len() != self.rows || data[0].len() != self.cols { return; }

        self.data = data;
    }

    /// index starts from 0
    pub fn set_row(&mut self, index: usize, data: Vec<T>) {
        if data.len() != self.cols || index >= self.rows {
            panic!("Out of index!"); // TODO
        }

        self.data[index] = data;
    }

    /// index starts from 0
    pub fn set_col(&mut self, index: usize, data: Vec<T>) {
        if data.len() != self.rows || index >= self.cols {
            panic!("Out of index!"); // TODO
        }

        for i in 0..self.rows {
            for j in 0..self.cols {
                if j == index {
                    self.data[i][j] = data[i].clone();
                }
            }
        }
    }

    pub fn zeros(&mut self) {
        let zero = zero::<T>();
        self.data = vec![vec![zero; self.cols]; self.rows];
    }

    pub fn add(&mut self, other: &Matrix<T>) {
        let mut result = Matrix::new(self.rows, self.cols);
        for i in 0..self.rows {
            for j in 0..self.cols {
                result.data[i][j] = self.data[i][j].clone() + other.data[i][j].clone();
            }
        }

        self.data = result.data;
    }

    pub fn mult(&mut self, other: &Matrix<T>) {
        if self.cols != other.rows {
            return; // cannot mult
        }

        let mut result = Matrix::new(self.rows, self.cols);

        // for i in 0..self.rows {
        //     for j in 0..other.cols {
        //         for k in 0..self.cols {
        //             result.data[i][j] += self.data[i][k].clone() * other.data[k][j].clone();
        //         }
        //     }
        // }

        result.data.par_iter_mut().enumerate().for_each(|(i, row)| {
           for j in 0..other.cols {
               for k in 0..self.rows {
                   row[j] += self.data[i][k].clone() * other.data[k][j].clone();
               }
           }
        });

        self.data = result.data;
    }

    pub fn echelon(&mut self) {
        let mut lead = 0;

        for r in 0..self.rows {
            if self.cols <= lead { return; }

            let mut i = r;

            while self.data[i][lead].is_zero() {
                i += 1;
                if self.rows == i {
                    i = r;
                    lead += 1;
                    if self.cols == lead { return; }
                }
            }

            self.data.swap(i, r);

            let lv = self.data[r][lead].clone();
            for j in 0..self.cols {
                self.data[r][j] /= lv.clone();
            }

            lead += 1;
        }

        // self.data.par_iter_mut().for_each(|row | {
        //     if self.cols <= lead { return; }
        //
        //     let mut i = lead;
        //
        //     while row[lead].is_zero() {
        //         i += 1;
        //         if self.rows == i {
        //             i = lead;
        //             lead += 1;
        //             if self.cols == lead { return; }
        //         }
        //     }
        //
        //     if i != lead {
        //         row.swap_with_slice(self.data.get_mut(i).unwrap());
        //     }
        //
        //     let lv = row[lead].clone();
        //     for j in 0..self.cols {
        //         row[j] /= lv.clone();
        //     }
        //
        //     self.data.par_iter_mut().for_each(|other_row| {
        //         if other_row != row {
        //             let l = other_row[lead].clone();
        //             for j in 0..self.cols {
        //                 other_row[j] -= l.clone() * row[j].clone();
        //             }
        //         }
        //     })
        // });

        self.is_echelon_form = true;
    }

    pub fn echelon_rank(&self) -> Option<usize> {
        if !self.is_echelon_form {
            return None
        }

        let mut rank: usize = 0;
        for row in &self.data {
            if row.iter().any(|x| !x.is_zero()) {
                rank += 1;
            }
        }

        Some(rank)
    }

    pub fn inverse(&mut self) {
        if self.rows != self.cols { return; }

        if self.rows == 0 { return; }

        if self.rows == 1 {
            self.data = vec![vec![one::<T>() / self.data[0][0].clone()]];
        }

        // let n = self.rows.clone();
        // let mut augmented = Matrix::new(n, n * 2);
        //
        // augmented.set(self.data.clone());
        //
        // for i in 0..n {
        //     for j in 0..n {
        //         augmented.data[i][j + n] = if i == j { one::<T>() } else { zero::<T>() };
        //     }
        // }
        //
        // augmented.echelon();
        //
        // for i in 0..n {
        //     if augmented.data[i][i].is_zero() {
        //         panic!("Matrix is irreversible");
        //     }
        // }
        //
        // for i in (0..n).rev() {
        //     for j in 0..i {
        //         let factor = augmented.data[j][i].clone() / augmented.data[i][i].clone();
        //         for k in 0..2 * n {
        //             augmented.data[j][k] -= factor.clone() * augmented.data[i][k].clone();
        //         }
        //     }
        // }
        //
        // for i in 0..n {
        //     for j in 0..n {
        //         self.data[i][j] = augmented.data[i][j + n].clone();
        //     }
        // }

        let new_self = self.clone(); // TODO
        self.data.par_iter_mut().enumerate().for_each(|(i, row)| {
            for j in 0..self.rows {
                let minor = new_self.minor(i, j).unwrap();
                let cofactor = if (i + j) % 2 == 0 { one::<T>() } else { -one::<T>() };
                let minor_det = minor.determinant().unwrap();
                row[j] = cofactor * minor_det;
            }
        });

        let det = self.determinant().unwrap();
        let det_inv = one::<T>() / det;
        self.data.par_iter_mut().for_each(|row| {
            for elem in row {
                *elem *= det_inv.clone();
            }
        });
    }

    pub fn transpose(&mut self) {
        let mut transposed = Matrix::new(self.rows, self.cols);

        // for i in 0..self.rows {
        //     for j in 0..self.cols {
        //         transposed.data[j][i] = self.data[i][j].clone();
        //     }
        // }

        let chunks: Vec<Vec<_>> = self.data.par_iter().map(|col| col.to_vec()).collect();

        transposed.data.par_iter_mut().enumerate().for_each(|(i, col)| {
            for chunk in &chunks {
                col.push(chunk[i].clone());
            }
        });

        self.data = transposed.data;
    }

    pub fn minor(&self, row_to_exclude: usize, col_to_exclude: usize) -> Option<Matrix<T>> {
        if self.rows != self.cols {
            return None;
        }

        if self.rows == 2 {
            return Some(self.clone());
        }

        let mut minor_data = Vec::new();

        for i in 0..self.rows {
            if i == row_to_exclude { continue; }

            let mut minor_row = Vec::new();

            for j in 0..self.rows {
                if j == col_to_exclude { continue; }

                minor_row.push(self.data[i][j].clone());
            }

            minor_data.push(minor_row);
        }

        Some(Matrix {
            rows: self.rows - 1,
            cols: self.cols - 1,
            data: minor_data,
            is_echelon_form: false
        })
    }

    pub fn determinant(&self) -> Option<T> {
        if self.rows == 0 && self.cols == 0 {
            return None;
        }

        if self.rows != self.cols {
            return None;
        }

        if self.rows == 1 {
            return Some(self.data[0][0].clone());
        }

        if self.rows == 2 {
            return Some(
                self.data[0][0].clone() * self.data[1][1].clone() - self.data[0][1].clone() * self.data[1][0].clone()
            )
        }

        let mut det = zero::<T>();

        for i in 0..self.rows {
            let minor = self.minor(0, i);
            let cofactor = if i % 2 == 0 { one::<T>() } else { -one::<T>() };
            det += cofactor * self.data[0][i].clone() * minor?.determinant()?;
        }

        Some(det)
    }
}
