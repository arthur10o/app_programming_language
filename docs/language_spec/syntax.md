# A++ language syntax
## Introduction
The A++ language is designed to be both powerful and readable. The basic syntax follows simple principles inspired by modern languages, while being optimized for performance and memory management.

## General program structure
An A++ program generally consists of the following elements:
- Variables declarations
- Function
- Instructions
#### Exemple :
```apl
// Declaration of a main function
fn main(): None {
    var a: int = 10;
    var b: float = 3.14;
}
```

## Variables declaration
Variables are declared using the ```var``` keyword, followed by their name, type and initial value.
#### Exemple :
```apl
var x: int = 5;
var name: string = "Alice";
var isValid: bool = true;
```
The types available are :
- ```int```
- ```float```
- ```bool```
- ```string```
- ```None```

## Primitive types
The primitive types of A++ are :
- ```int``` : integer
- ```float``` : floating-point numbers
- ```bool``` : Boolean value (```true``` or ```false```)
- ```string``` : sequence of characters
- ```None``` : absence of value
#### Exemple :
```apl
var age: int = 25;
var pi: float = 3.14159;
var isFinished: bool = false;
var message: string = "Hello, A++";
var result: None = None;
```