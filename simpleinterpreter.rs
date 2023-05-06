use std::{env, fs};

struct TokenScanner {
    source: Vec<u8>,
    start: i32,
    current: i32,
    line: i32,
}


enum TokenType {
    // Single-character tokens.
    TokenLeftParen,
    TokenRightParen,
    TokenLeftBrace,
    TokenRightBrace,
    TokenComma,
    TokenDot,
    TokenMinus,
    TokenPlus,
    TokenSemicolon,
    TokenSlash,
    TokenStar,
    // One or two character tokens.
    TokenBang,
    TokenBangEqual,
    TokenEqual,
    TokenEqualEqual,
    TokenGreater,
    TokenGreaterEqual,
    TokenLess,
    TokenLessEqual,
    // Literals.
    TokenIdentifier,
    TokenString,
    TokenNumber,
    // Keywords.
    TokenAnd,
    TokenElse,
    TokenFalse,
    TokenFor,
    TokenFunc,
    TokenIf,
    TokenNil,
    TokenOr,
    TokenPrint,
    TokenReturn,
    TokenTrue,
    TokenVar,
    TokenWhile,

    TokenError,
    TokenEof,
}

struct Token {
    t: TokenType,
    s: Vec<u8>,
    l: i32,
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let file_path = &args[1];

    let file_data = fs::read(file_path).expect("Error while reading file");

    let token_scanner = TokenScanner {
        source: file_data,
        start: 0,
        current: 0,
        line: 1,
    };
}
