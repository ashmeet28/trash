package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

/*

111 000 ECALL

001 000 ADD dest src1 src2
001 001 SUB dest src1 src2
001 100 XOR dest src1 src2
001 110 OR  dest src1 src2
001 111 AND dest src1 src2
001 010 SRA dest src1 src2
001 011 SRL dest src1 src2
001 101 SLL dest src1 src2

010 000 LB  dest base offset
010 001 LH  dest base offset
010 010 LW  dest base offset
010 100 LBU dest base offset
010 101 LHU dest base offset

011 000 SB src base offset
011 001 SH src base offset
011 010 SW src base offset

100 001 LUI  dest imm1 imm2
100 010 LLI  dest imm1 imm2
100 011 LLIU dest imm1 imm2

101 000 BEQ  offset src1 src2
101 001 BNE  offset src1 src2
101 100 BLT  offset src1 src2
101 101 BGE  offset src1 src2
101 110 BLTU offset src1 src2
101 111 BGEU offset src1 src2

110 000 JAL  dest zero offset
110 001 JALR dest base offset

*/

const (
	TOKEN_TYPE_ILLEGAL int = iota

	TOKEN_TYPE_LEFT_PAREN
	TOKEN_TYPE_RIGHT_PAREN
	TOKEN_TYPE_LEFT_BRACE
	TOKEN_TYPE_RIGHT_BRACE
	TOKEN_TYPE_COMMA
	TOKEN_TYPE_DOT
	TOKEN_TYPE_MINUS
	TOKEN_TYPE_PLUS
	TOKEN_TYPE_SLASH
	TOKEN_TYPE_STAR

	TOKEN_TYPE_BANG
	TOKEN_TYPE_BANG_EQUAL
	TOKEN_TYPE_EQUAL
	TOKEN_TYPE_EQUAL_EQUAL
	TOKEN_TYPE_GREATER
	TOKEN_TYPE_GREATER_EQUAL
	TOKEN_TYPE_LESS
	TOKEN_TYPE_LESS_EQUAL

	TOKEN_TYPE_IDENTIFIER
	TOKEN_TYPE_NUMBER
	TOKEN_TYPE_STRING

	TOKEN_TYPE_ELSE
	TOKEN_TYPE_FUNC
	TOKEN_TYPE_IF
	TOKEN_TYPE_RETURN
	TOKEN_TYPE_LET
	TOKEN_TYPE_WHILE
	TOKEN_TYPE_TYPE
	TOKEN_TYPE_STRUCT

	TOKEN_TYPE_SPACE
	TOKEN_TYPE_NEW_LINE

	TOKEN_TYPE_ERROR
	TOKEN_TYPE_EOF
)

type Token struct {
	T int
	S string
	L int
}

type Scanner struct {
	Source  []byte
	Current int
	Line    int
}

func ScannerIsAtEnd(s *Scanner) bool {
	return s.Current >= len(s.Source)
}

func ScannerMatch(s *Scanner, expected string) bool {
	if ScannerIsAtEnd(s) || (string(s.Source[s.Current:s.Current+1]) != expected) {
		return false
	}
	s.Current = s.Current + 1
	return true
}

func ScannerAdvance(s *Scanner) string {
	c := string(s.Source[s.Current : s.Current+1])
	s.Current = s.Current + 1
	return c
}

func ScannerPeek(s *Scanner) string {
	if ScannerIsAtEnd(s) {
		return ""
	}
	return string(s.Source[s.Current : s.Current+1])
}

func ScannerPeekNext(s *Scanner) string {
	if (s.Current + 1) >= len(s.Source) {
		return ""
	}
	return string(s.Source[s.Current+1 : s.Current+2])
}

func ScannerIsDigit(v string) bool {
	return (len(v) == 1) && (v[0] >= 0x30) && (v[0] <= 0x39)
}
func ScannerIsPrintable(v string) bool {
	return (len(v) == 1) && (v[0] >= 0x20) && (v[0] <= 0x7e)
}

func ScannerIsAlphabet(v string) bool {
	return (len(v) == 1) && (((v[0] >= 0x41) && (v[0] <= 0x5a)) || ((v[0] >= 0x61) && (v[0] <= 0x7a)) || (v[0] == 0x5f))
}

func ScannerIsTokenKeywordOrIdentifierType(s string) int {
	keywords := map[string]int{
		"if":     TOKEN_TYPE_IF,
		"else":   TOKEN_TYPE_ELSE,
		"while":  TOKEN_TYPE_WHILE,
		"func":   TOKEN_TYPE_FUNC,
		"return": TOKEN_TYPE_RETURN,
		"let":    TOKEN_TYPE_LET,
		"type":   TOKEN_TYPE_TYPE,
		"struct": TOKEN_TYPE_STRUCT,
	}

	elem, ok := keywords[s]
	if ok {
		return elem
	}
	return TOKEN_TYPE_IDENTIFIER
}

func ScannerScanToken(s *Scanner) Token {
	if ScannerIsAtEnd(s) {
		return Token{TOKEN_TYPE_EOF, "", s.Line}
	}

	start := s.Current
	c := ScannerAdvance(s)

	switch c {
	case "(":
		return Token{TOKEN_TYPE_LEFT_PAREN, "(", s.Line}
	case ")":
		return Token{TOKEN_TYPE_RIGHT_PAREN, ")", s.Line}
	case "{":
		return Token{TOKEN_TYPE_LEFT_BRACE, "{", s.Line}
	case "}":
		return Token{TOKEN_TYPE_RIGHT_BRACE, "}", s.Line}
	case ",":
		return Token{TOKEN_TYPE_COMMA, ",", s.Line}
	case ".":
		return Token{TOKEN_TYPE_DOT, ".", s.Line}
	case "-":
		return Token{TOKEN_TYPE_MINUS, "-", s.Line}
	case "+":
		return Token{TOKEN_TYPE_PLUS, "+", s.Line}
	case "*":
		return Token{TOKEN_TYPE_STAR, "*", s.Line}
	case "!":
		if ScannerMatch(s, "=") {
			return Token{TOKEN_TYPE_BANG_EQUAL, "!=", s.Line}
		} else {
			return Token{TOKEN_TYPE_BANG, "!", s.Line}
		}
	case "=":
		if ScannerMatch(s, "=") {
			return Token{TOKEN_TYPE_EQUAL_EQUAL, "==", s.Line}
		} else {
			return Token{TOKEN_TYPE_EQUAL, "=", s.Line}
		}
	case "<":
		if ScannerMatch(s, "=") {
			return Token{TOKEN_TYPE_LESS_EQUAL, "<=", s.Line}
		} else {
			return Token{TOKEN_TYPE_LESS, "<", s.Line}
		}
	case ">":
		if ScannerMatch(s, "=") {
			return Token{TOKEN_TYPE_GREATER_EQUAL, ">=", s.Line}
		} else {
			return Token{TOKEN_TYPE_GREATER, ">", s.Line}
		}
	case "\x22":
		for (!ScannerIsAtEnd(s)) && (ScannerPeek(s) != "\x22") {
			if ScannerIsPrintable(ScannerPeek(s)) {
				ScannerAdvance(s)
			} else {
				return Token{TOKEN_TYPE_ERROR, "Unexpected character in string literal", s.Line}
			}
		}
		if ScannerIsAtEnd(s) {
			return Token{TOKEN_TYPE_ERROR, "Unterminated string", s.Line}
		}
		ScannerAdvance(s)
		return Token{TOKEN_TYPE_STRING, string(s.Source[start+1 : s.Current-1]), s.Line}
	case "\x20":
		return Token{TOKEN_TYPE_SPACE, "\x20", s.Line}
	case "\x0a":
		s.Line = s.Line + 1
		return Token{TOKEN_TYPE_NEW_LINE, "\x0a", s.Line}
	default:
		if ScannerIsDigit(c) {
			for ScannerIsDigit(ScannerPeek(s)) {
				ScannerAdvance(s)
			}
			if (ScannerPeek(s) == ".") && ScannerIsDigit(ScannerPeekNext(s)) {
				ScannerAdvance(s)
				for ScannerIsDigit(ScannerPeek(s)) {
					ScannerAdvance(s)
				}
			}
			return Token{TOKEN_TYPE_NUMBER, string(s.Source[start:s.Current]), s.Line}
		} else if ScannerIsAlphabet(c) {
			for (!ScannerIsAtEnd(s)) && (ScannerIsAlphabet(ScannerPeek(s)) || ScannerIsDigit(ScannerPeek(s))) {
				ScannerAdvance(s)
			}
			tempString := string(s.Source[start:s.Current])
			t := ScannerIsTokenKeywordOrIdentifierType(tempString)
			if t == TOKEN_TYPE_IDENTIFIER {
				return Token{TOKEN_TYPE_IDENTIFIER, tempString, s.Line}
			} else {
				return Token{t, tempString, s.Line}
			}
		}
	}

	return Token{TOKEN_TYPE_ERROR, "Unknown error", s.Line}
}

func ScannerIsValidSource(source []byte) bool {
	for _, b := range source {
		if !((b == 0xa) || ((b >= 0x20) && (b <= 0x7e))) {
			return false
		}
	}
	return true
}

func ScannerScan(source []byte) []Token {
	if !ScannerIsValidSource(source) {
		log.Fatalln("Error while tokenization - Invalid source")
	}

	var tokens []Token
	s := Scanner{source, 0, 1}

	for {
		t := ScannerScanToken(&s)
		if t.T == TOKEN_TYPE_SPACE {
			continue
		}
		tokens = append(tokens, t)
		if t.T == TOKEN_TYPE_EOF {
			break
		} else if t.T == TOKEN_TYPE_ERROR {
			log.Fatalln("Error while tokenization - Line", t.L, "-", t.S)
		}
	}

	return tokens
}

type CompilerSymbol struct {
	N string
	T string
	S int
	A int
	D int
	M string
}

type Compiler struct {
	Source      []Token
	Current     int
	SymbolTable []CompilerSymbol
}

func CompilerAdvance(c *Compiler) {
	c.Current = c.Current + 1
}

func CompilerCurrent(c *Compiler) Token {
	return c.Source[c.Current]
}

func CompilerPrevious(c *Compiler) Token {
	return c.Source[c.Current-1]
}

func CompilerParseNumber(c *Compiler) float64 {
	s, err := strconv.ParseFloat(CompilerCurrent(c).S, 64)
	if err != nil {
		log.Fatalln("Error while compiling - Line", CompilerCurrent(c).L, "-", "Unable to parse", CompilerCurrent(c).S, "to float")
	}
	return s
}

func CompilerConsume(c *Compiler, t int, e string) {
	if CompilerCurrent(c).T == t {
		CompilerAdvance(c)
	} else {
		log.Fatalln("Error while compiling - Line", CompilerCurrent(c).L, "-", e)
	}
}

func CompilerFunc(c *Compiler) {
	fmt.Println("declare function")
	t := CompilerCurrent(c)
	fmt.Println(t.S)
	CompilerAdvance(c)
	CompilerConsume(c, TOKEN_TYPE_LEFT_PAREN, "Expect (")
	CompilerFuncParameters(c)
}

func CompilerFuncParameters(c *Compiler) {
	t := CompilerCurrent(c)
	fmt.Println(t.S)
	CompilerAdvance(c)

}

func ComplierCompile(tokens []Token) {
	fmt.Println(tokens)
	var st []CompilerSymbol
	c := Compiler{tokens, 0, st}
	CompilerContinue(&c)
}

func CompilerContinue(c *Compiler) {
	t := CompilerCurrent(c)
	f, ok := CompilerFuncTable[t.T]
	if !ok {
		log.Fatalln("Error while compiling - Line", CompilerCurrent(c).L, "-", "Invalid token")
	}
	CompilerAdvance(c)
	f(c)
}

var CompilerFuncTable = map[int]func(c *Compiler){
	TOKEN_TYPE_FUNC: CompilerFunc,
}

func main() {
	d, e := os.ReadFile(os.Args[1])
	if e != nil {
		log.Fatal(e)
	}

	ComplierCompile(ScannerScan(d))
}
