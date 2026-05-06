use serde::Serialize;

use crate::lexer::{ Token, TokenKind, Keyword, Literal, Operator, Punctuation };
use crate::ast::{ Variable, VariableKind, Expression };

#[derive(Debug, Clone, Serialize)]
pub struct ParserError {
    pub message: String,
    pub line: usize,
    pub column: usize
}

pub struct Parser {
    tokens: Vec<Token>,
    position: usize,
}

type ParseResult<T> = Result<T, ParserError>;

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self { tokens: tokens, position: 0 }
    }

    pub fn parse(tokens: Vec<Token>) -> ParseResult<Vec<Variable>> {
        let mut parser = Parser::new(tokens);
        let mut variables = Vec::new();

        while let Some(token) = parser.peek() {
            match token.kind {
                TokenKind::Keyword(Keyword::Let) | TokenKind::Keyword(Keyword::Const) => {
                    variables.push(parser.parse_variable()?);
                },
                _ => {
                    return parser.error(&format!("Unexpected token {:?}", token.kind.as_str()));
                }
            }
        }
        Ok(variables)
    }

    fn error<T>(&self, message: &str) -> ParseResult<T> {
        let (line, column) = self.get_line_column_number();
        Err(ParserError {
            message: message.to_string(),
            line: line,
            column: column 
        })
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.position)
    }

    fn advance(&mut self) -> Option<&Token> {
        let token = self.tokens.get(self.position);
        self.position += 1;
        token
    }

    fn get_line_column_number(&self) -> (usize, usize) {
        match self.peek() {
            Some(token) => (token.line, token.column),
            None => (0, 0)
        }
    }

    fn match_token<F>(&mut self, f: F) -> bool 
    where 
        F: Fn(&TokenKind) -> bool,
    {
        if let Some(token) = self.peek() {
            if f(&token.kind) {
                self.advance();
                return true;
            }
        }
        false
    }

    fn match_keyword(&mut self, keyword: Keyword) -> bool {
        self.match_token(|kind| matches!(kind, TokenKind::Keyword(k) if *k == keyword))
    }

    fn match_punctuation(&mut self, punct: Punctuation) -> bool {
        self.match_token(|kind| matches!(kind, TokenKind::Punctuation(p) if *p == punct))
    }

    fn match_operator(&mut self, operator: Operator) -> bool {
        self.match_token(|kind| matches!(kind, TokenKind::Operator(o) if *o == operator))
    }

    fn parse_expression(&mut self) -> ParseResult<Expression> {
        match self.advance() {
            Some(Token { kind: TokenKind::Literal(Literal::Integer(i)), .. }) => Ok(Expression::Integer(*i)),
            Some(Token { kind: TokenKind::Literal(Literal::Float(f)), .. }) => Ok(Expression::Float(*f)),
            Some(Token { kind: TokenKind::Literal(Literal::Bool(b)), .. }) => Ok(Expression::Bool(*b)),
            Some(Token { kind: TokenKind::Literal(Literal::String(s)), .. }) => Ok(Expression::String(s.clone())),
            _ => self.error("Unexpected end of input while parsing expression"),
        }
    }

    fn parse_variable(&mut self) -> ParseResult<Variable> {
        let kind = if self.match_keyword(Keyword::Let) {
            VariableKind::Let
        } else if self.match_keyword(Keyword::Const) {
            VariableKind::Const
        } else {
            return self.error("Expected 'let' or 'const' keyword for variable declaration");
        };

        let name = match self.advance() {
            Some(Token { kind: TokenKind::Identifier(name), .. }) => name.clone(),
            Some(token) => {
                let kind = token.kind.clone();
                return self.error(&format!("Expected identifier for variable name, found {:?}", kind.as_str()));
            },
            _ => return self.error("Unexpected end of input while parsing variable name")
        };

        let type_annotation = if self.match_punctuation(Punctuation::Colon) {
            match self.advance() {
                Some(Token { kind: TokenKind::Identifier(t), .. }) => Some(t.clone()),
                Some(token) => {
                    let kind = token.kind.clone();
                    return self.error(&format!("Expected type identifier after ':', found {:?}", kind.as_str()));
                },
                _ => return self.error("Unexpected end of input after ':' while parsing type annotation")
            }
        } else {
            None
        };

        let has_equal = self.match_operator(Operator::Equal);
        let value = if has_equal {
            Some(self.parse_expression()?)
        } else {
            None
        };

        if !self.match_punctuation(Punctuation::Semicolon) {
            return self.error("Missing ';' at the end of variable declaration");
        }
        Ok(Variable { kind, name, type_annotation, value })
    }
}