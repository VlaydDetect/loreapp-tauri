use crate::error::{IntoSurrealError as Error, SurrealResult as Result};

pub fn analyze_query(query: &str) -> Result<usize> {
    let mut counter = 0;
    let mut tokens = prepare_query(query).into_iter();

    while let Some(token) = tokens.next() {
        match token {
            "BEGIN" => {
                if let Some(semicolon) = tokens.next() {
                    if semicolon == ";" {
                        if find_commit(&mut tokens).is_some() {
                            if let Some(semicolon) = tokens.next() {
                                if semicolon == ";" {
                                    return Ok(counter);
                                } else {
                                    return Err(Error::QueryAnalyzer("Error: Unsupported transaction with other queries outside the transaction block".to_string()));
                                }
                            } else {
                                return Err(Error::QueryAnalyzer("Error: Syntax error, missing semicolon after COMMIT"
                                    .to_string()));
                            }
                        } else {
                            return Err(
                                Error::QueryAnalyzer("Error: Syntax error, missing COMMIT after BEGIN".to_string())
                            );
                        }
                    }
                } else {
                    return Err(Error::QueryAnalyzer("Error: Syntax error, missing semicolon after COMMIT".to_string()));
                }
            }
            "CREATE" | "DELETE" | "RELATE" | "UPDATE" => {
                if find_semicolon_or_return(&mut tokens).is_some() {
                    counter += 1;
                } else {
                    return Err(Error::QueryAnalyzer("Error: Syntax error, missing semicolon after query".to_string()));
                }
            }
            "INSERT" | "LET" | "KILL" | "REMOVE" | "SHOW" | "SELECT" => {
                if find_semicolon(&mut tokens).is_some() {
                    counter += 1;
                } else {
                    return Err(Error::QueryAnalyzer("Error: Syntax error, missing semicolon after query".to_string()));
                }
            }
            "RETURN" => {
                if find_semicolon(&mut tokens).is_some() {
                    counter += 1;
                } else {
                    return Err(Error::QueryAnalyzer("Error: Syntax error, missing semicolon after RETURN".to_string()));
                }
            }
            "FOR" => {
                if let Some(semicolon) = find_for_block_end(&mut tokens) {
                    if semicolon == ";" {
                        counter += 1;
                    } else {
                        return Err(
                            Error::QueryAnalyzer("Error: Syntax error, missing semicolon after FOR block".to_string())
                        );
                    }
                } else {
                    return Err(
                        Error::QueryAnalyzer("Error: Syntax error, missing semicolon after FOR block".to_string())
                    );
                }
            }
            "LIVE" | "DEFINE" => {
                return Err(Error::QueryAnalyzer("Error: Unsupported LIVE SELECT and DEFINE statements".to_string()));
            }
            _ => {
                return Err(Error::QueryAnalyzer(format!("Error: Unsupported keyword: {token}")));
            }
        }
    }

    if counter == 0 {
        return Err(Error::QueryAnalyzer("Error: Syntax error, unexpected end of query".to_string()));
    }

    Ok(counter - 1)
}

fn find_commit<'a, I>(tokens: &mut I) -> Option<&'a str>
where
    I: Iterator<Item = &'a str>,
{
    tokens.find(|&token| token == "COMMIT")
}

fn find_semicolon<'a, I>(tokens: &mut I) -> Option<&'a str>
where
    I: Iterator<Item = &'a str>,
{
    tokens.find(|&token| token == ";")
}

fn find_semicolon_or_return<'a, I>(tokens: &mut I) -> Option<&'a str>
where
    I: Iterator<Item = &'a str>,
{
    tokens.find(|&token| token == ";" || token == "RETURN")
}

fn find_for_block_end<'a, I>(tokens: &mut I) -> Option<&'a str>
where
    I: Iterator<Item = &'a str>,
{
    // while let Some(token) = tokens.next() {
    //     if token == "};" {
    //         return Some(token);
    //     }
    // }
    // None

    let mut open_brackets_num: usize = 0;

    while let Some(token) = tokens.next() {
        if token == "{" {
            open_brackets_num += 1;
        }
        if token == "}" {
            open_brackets_num -= 1;

            if open_brackets_num == 0 {
                return tokens.next();
            }
        }
    }
    None
}

fn prepare_query(sql: &str) -> Vec<&str> {
    let mut result: Vec<&str> = vec![];

    for part in sql.split_whitespace() {
        if let Some(semicolon_idx) = part.find(|c| c == ';') {
            result.push(&part[..semicolon_idx]);
            result.push(&part[semicolon_idx..semicolon_idx + 1]);
            if semicolon_idx + 1 < part.len() {
                result.push(&part[semicolon_idx + 1..]);
            }
        } else {
            result.push(part);
        }
    }

    result
}