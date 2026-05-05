use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Serialize)]
enum Literal {
    Bool(bool),
    String(String),
    Integer(i64),
    Float(f64)
}

#[derive(Debug, Clone, Serialize)]
enum Keyword {
    Let, Const, Func, Class,
    For, While, If, Else,
    Return, Break, Continue, Pass
}

#[derive(Debug, Clone, Serialize)]
enum Operator {
    Plus, PlusPlus, PlusEqual, 
    Minus, MinusMinus, MinusEqual,
    Star, StarStar, StarEqual,
    Slash, SlashEqual, Modulo,
    Equal, EqualEqual, NotEqual,
    Less, LessEqual, Greater,
    GreaterEqual, And, Or, Not
}

#[derive(Debug, Clone, Serialize)]
enum Punctuation {
    Comma, Semicolon, Colon,
    Dot, LeftParenthesis,
    RightParenthesis, LeftBrace,
    RightBrace, LeftHook, RightHook,
}

#[derive(Debug, Clone, Serialize)]
enum TokenKind {
    Literal(Literal),
    Identifier(String),
    Keyword(Keyword),
    Operator(Operator),
    Punctuation(Punctuation)
}

#[derive(Debug, Clone, Serialize)]
pub struct Token {
    pub kind: TokenKind,
    pub line: usize,
    pub column: usize
}

#[derive(Debug, Clone, Serialize)]
pub struct LexerError {
    pub message: String,
    pub line: usize,
    pub column: usize
}

pub struct Lexer<'a> {
    input: std::iter::Peekable<std::str::Chars<'a>>,
    line: usize,
    column: usize,
    errors: Vec<LexerError>
}

impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input: input.chars().peekable(),
            line: 1,
            column: 1,
            errors: vec![]
        }
    }

    pub fn tokenize(mut self) -> (Vec<Token>, Vec<LexerError>) {
        let mut tokens = Vec::new();

        while let Some(&c) = self.input.peek() {
            self.skip_whitespace();
            self.skip_comment();

            let Some(&c) = self.input.peek() else { break };

            let token = match c {
                '0'..='9' => self.read_number(),
                'a'..='z' | 'A'..='Z' | '_' =>  self.read_identifier(),
                '"' | '\'' => self.read_string(),
                _ => self.read_symbol()
            };
            tokens.push(token);
        }
        (tokens, self.errors)
    }

    fn advance(&mut self) -> Option<char> {
        let c = self.input.next()?;
        self.column += 1;
        if c == '\n' {
            self.line += 1;
            self.column = 1;
        }
        Some(c)
    }

    fn peek(&mut self) -> Option<char> {
        self.input.peek().copied()
    }

    fn match_char(&mut self, expected: char) -> bool {
        if self.peek() == Some(expected) {
            self.advance();
            true
        } else {
            false
        }
    }

    fn make_token(&self, kind: TokenKind, line: usize, column: usize) -> Token {
        Token { kind, line, column }
    }

    fn error(&mut self, message: &str) -> () {
        self.errors.push(LexerError{
            message: message.to_string(),
            line: self.line,
            column: self.column
        });
    }

    fn skip_whitespace(&mut self) -> () {
        while let Some(c) = self.peek() {
            if c.is_whitespace() {
                self.advance();
            } else {
                break;
            }
        }
    }

    fn skip_line_comment(&mut self) -> () {
        while let Some(c) = self.peek() {
            if c == '\n' {
                break;
            }
            self.advance();
        }
    }

    fn skip_block_comment(&mut self) -> () {
        while let Some(c) = self.advance() {
            if c == '*' && self.match_char('/') {
                break;
            }
        }
    }

    fn skip_comment(&mut self) -> () {
        loop {
            self.skip_whitespace();
            
            match self.peek() {
                Some('/') => {
                    self.advance();

                    match self.peek() {
                        Some('/') => {
                            self.advance();
                            self.skip_line_comment();
                        }
                        Some('*') => {
                            self.advance();
                            self.skip_block_comment();
                        }
                        _ => break
                    }
                }
                _ => break
            }
        }
    }

    fn read_number(&mut self) -> Token {
        let start_line = self.line;
        let start_column = self.column;

        let mut number = String::new();
        let mut is_float: bool = false;

        while let Some(c) = self.peek() {
            if c.is_ascii_digit() {
                number.push(c);
                self.advance();
            } else if c == '.' && !is_float {
                is_float = true;
                number.push(c);
                self.advance();
            } else {
                break;
            }
        }

        let kind = if is_float {
            match number.parse::<f64>() {
                Ok(v) =>  TokenKind::Literal(Literal::Float(v)),
                Err(_) => {
                    self.error("Invalid float");
                    TokenKind::Literal(Literal::Float(0.0))
                }
            }
        } else {
            match number.parse::<i64>() {
                Ok(v) =>  TokenKind::Literal(Literal::Integer(v)),
                Err(_) => {
                    self.error("Invalid integer");
                    TokenKind::Literal(Literal::Integer(0))
                }
            }
        };
        self.make_token(kind, start_line, start_column)
    }

    fn read_identifier(&mut self) -> Token {
        let start_line = self.line;
        let start_column = self.column;

        let mut identifier = String::new();

        while let Some(c) = self.peek() {
            if c.is_alphanumeric() || c == '_' {
                identifier.push(c);
                self.advance();
            } else {
                break;
            }
        }

        let kind = match identifier.as_str() {
            "true" => TokenKind::Literal(Literal::Bool(true)),
            "false" => TokenKind::Literal(Literal::Bool(false)),
            "let" => TokenKind::Keyword(Keyword::Let),
            "const" => TokenKind::Keyword(Keyword::Const),
            "func" => TokenKind::Keyword(Keyword::Func),
            "class" => TokenKind::Keyword(Keyword::Class),
            "for" => TokenKind::Keyword(Keyword::For),
            "while" => TokenKind::Keyword(Keyword::While),
            "if" => TokenKind::Keyword(Keyword::If),
            "else" => TokenKind::Keyword(Keyword::Else),
            "return" => TokenKind::Keyword(Keyword::Return),
            "break" => TokenKind::Keyword(Keyword::Break),
            "continue" => TokenKind::Keyword(Keyword::Continue),
            "pass" => TokenKind::Keyword(Keyword::Pass),
            _ => TokenKind::Identifier(identifier),
        };

        self.make_token(kind, start_line, start_column)
    }

    fn read_string(&mut self) -> Token {
        let start_line = self.line;
        let start_column = self.column;

        let delimiter = self.advance().unwrap();
        let mut string = String::new();

        while let Some(c) = self.peek() {
            if c == delimiter {
                self.advance();
                break;
            }
            string.push(c);
            self.advance();
        }

        self.make_token(TokenKind::Literal(Literal::String(string)), start_line, start_column)
    }

    fn read_symbol(&mut self) -> Token {
        let start_line = self.line;
        let start_column = self.column;

        let ch = self.advance().unwrap();

        let kind = match ch {
            ',' => TokenKind::Punctuation(Punctuation::Comma),
            ';' => TokenKind::Punctuation(Punctuation::Semicolon),
            ':' => TokenKind::Punctuation(Punctuation::Colon),
            '.' => TokenKind::Punctuation(Punctuation::Dot),

            '(' => TokenKind::Punctuation(Punctuation::LeftParenthesis),
            ')' => TokenKind::Punctuation(Punctuation::RightParenthesis),
            '{' => TokenKind::Punctuation(Punctuation::LeftBrace),
            '}' => TokenKind::Punctuation(Punctuation::RightBrace),
            '[' => TokenKind::Punctuation(Punctuation::LeftHook),
            ']' => TokenKind::Punctuation(Punctuation::RightHook),

            '+' => {
                if self.match_char('+') {
                    TokenKind::Operator(Operator::PlusPlus)
                } else if self.match_char('=') {
                    TokenKind::Operator(Operator::PlusEqual)
                } else {
                    TokenKind::Operator(Operator::Plus)
                }
            },
            '-' => {
                if self.match_char('-') {
                    TokenKind::Operator(Operator::MinusMinus)
                } else if self.match_char('=') {
                    TokenKind::Operator(Operator::MinusEqual)
                } else {
                    TokenKind::Operator(Operator::Minus)
                }
            },
            '*' => {
                if self.match_char('*') {
                    TokenKind::Operator(Operator::StarStar)
                } else if self.match_char('=') {
                    TokenKind::Operator(Operator::StarEqual)
                } else {
                    TokenKind::Operator(Operator::Star)
                }
            },
            '/' => {
                if let Some(next) = self.peek() {
                    match next {
                        '/' => {
                            self.advance();
                            self.advance();
                            self.skip_line_comment();
                            return self.read_symbol();
                        }
                        '*' => {
                            self.advance();
                            self.advance();
                            self.skip_block_comment();
                            return self.read_symbol();
                        }
                        '=' => {
                            self.advance();
                            TokenKind::Operator(Operator::SlashEqual)
                        }
                        _ => {
                            TokenKind::Operator(Operator::Slash)
                        }
                    }
                } else {
                    TokenKind::Operator(Operator::Slash)
                }
            },
            '=' => {
                if self.match_char('=') {
                    TokenKind::Operator(Operator::EqualEqual)
                } else {
                    TokenKind::Operator(Operator::Equal)
                }
            },
            '!' => {
                if self.match_char('=') {
                    TokenKind::Operator(Operator::NotEqual)
                } else {
                    TokenKind::Operator(Operator::Not)
                }
            },
            '<' => {
                if self.match_char('=') {
                    TokenKind::Operator(Operator::LessEqual)
                } else {
                    TokenKind::Operator(Operator::Less)
                }
            },
            '>' => {
                if self.match_char('=') {
                    TokenKind::Operator(Operator::GreaterEqual)
                } else {
                    TokenKind::Operator(Operator::Greater)
                }
            },
            '&' => {
                if self.match_char('&') {
                    TokenKind::Operator(Operator::And)
                } else {
                    self.error("Expected '&'");
                    TokenKind::Operator(Operator::And)
                }
            },
            '|' => {
                if self.match_char('|') {
                    TokenKind::Operator(Operator::Or)
                } else {
                    self.error("Expected '|'");
                    TokenKind::Operator(Operator::Or)
                }
            },
            _ => {
                self.error(&format!("Unknown character: {}", ch));
                TokenKind::Identifier(ch.to_string())
            }
        };
        self.make_token(kind, start_line, start_column)
    }
}