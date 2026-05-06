# app_programming_language

`A++ Programming Language` is a project that allows you to write and run `A++`.

## Language Documentation
### Operators
| Operator  | Description            |
|-----------|------------------------|
| `+`       | Addition               |
| `++`      | Increment              |
| `+=`      | Add and assign         |
| `-`       | Subtraction            |
| `--`      | Decrement              |
| `-=`      | Subtract and assign    |
| `*`       | Multiplication         |
| `**`      | Power                  |
| `*=`      | Multiply and assign    |
| `/`       | Division               |
| `/=`      | Divide and assign      |
| `%`       | Modulo                 |
| `=`       | Assignment             |
| `==`      | Equality comparison    |
| `!=`      | Inequality comparison  |
| `<`       | Less than              |
| `<=`      | Less than or equal     |
| `>`       | Greater than           |
| `>=`      | Greater than or equal  |
| `&&`      | Logical AND            |
| `\|\|`    | Logical OR             |
| `!`       | Logical NOT            |

### Keywords
| Keyword   | Description            |
|-----------|------------------------|
| `var`     | Declare a variable     |
| `const`   | Declare a constant     |
| `func`    | Define a function      |
| `class`   | Define a class         |
| `if`      | Conditional statement  |
| `else`    | Alternative branch     |
| `for`     | Loop with counter      |
| `while`   | Loop with condition    |
| `return`  | Return a value         |
| `break`   | Exit a loop            |
| `continue`| Skip iteration         |
| `pass`    | No operation           |

### Variables and Constants

In `A++`, variables are declared using `var` and can be modified, whereas constants are declared using `const` and cannot be reassigned after initialization.

#### Syntax

```JS
    var variableName: Type = value;
    const constantName: Type = value;
```

#### Examples

```JS
    var age: Integer = 30;                  // Integer variable
    const pi: Float = 3.14159;              // Floating-point constant
    var isActive: Boolean = true;           // Boolean variable
    const greeting: String = "Hello World"; // String constant

    // Type inference example
    var score = 100;                        // Integer inferred from value
    const message = "Hello World";          // String inferred from value

    // Declaration without initialization
    var counter: Integer;                   // Must be initialized before use
```

#### Notes

- Constants must be initialized when they are declared.
- If the type is omitted, A++ attempts to infer it from the initial value.
- Variables can be declared without initialization but using them before they are assigned a value will result in an error.

### Literals
| Type      | Example            |Description             |
|-----------|--------------------|------------------------|
| `Boolean` | `true`, `false`    | Boolean values         |
| `Integer` | `10`, `2`          | Whole numbers          |
| `Float`   | `3.14`             | Decimal numbers        |
| `String`  | `"Hello"`, `'Word'`| Text values            |

### Comments

```JS
    // Single-line comment
```
```JS
    /*
        Multi-line
        comment
    */
```


## Installation

To install the project, run the following command
```bash
git clone https://github.com/arthur10o/app_programming_language.git
cd app_programming_language
npm install
```

## Running the Project

To start the application, run the following command
```bash
npm start
```

## Build

To build the application (WASM + assets), run the following command
```bash
npm run build
```

## Tasks

See the project tasks here:

[`task.md`](task.md)

## License

See the license here:

[`LICENSE`](LICENSE)
