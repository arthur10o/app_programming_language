use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;

mod lexer;
use lexer::Lexer;

#[wasm_bindgen]
pub fn interpret_code(source: &str) -> JsValue {
    let lexer = Lexer::new(source);
    let (tokens, errors) = lexer.tokenize();

    to_value(&(tokens, errors)).unwrap()
}