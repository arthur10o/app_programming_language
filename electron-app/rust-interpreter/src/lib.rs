use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;

mod lexer;
mod parser;
mod ast;

use lexer::Lexer;
use parser::Parser;

#[wasm_bindgen]
pub fn interpret_code(source: &str) -> JsValue {
    let lexer = Lexer::new(source);
    let (tokens, lexer_errors) = lexer.tokenize();

    let parser_result = Parser::parse(tokens.clone());
    let (variables, parse_errors) = match parser_result {
        Ok(vars) => (vars, vec![]),
        Err(err) => (vec![], vec![err])
    };

    to_value(&(tokens, lexer_errors, variables, parse_errors)).unwrap()
}