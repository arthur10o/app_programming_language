use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum VariableKind {
    Let,
    Const
}

#[derive(Debug, Clone, Serialize)]
pub enum Expression {
    Integer(i64),
    Float(f64),
    Bool(bool),
    String(String),
}

#[derive(Debug, Clone, Serialize)]
pub struct Variable {
    pub kind: VariableKind,
    pub name: String,
    pub type_annotation: Option<String>,
    pub value: Option<Expression>
}