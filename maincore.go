package main

import (
	"fmt"
	"log"
	"os"
)

type Token struct {
	t string
	d string
	l int
}
type Scanner struct {
	source  string
	tokens  []Token
	current int
	line    int
}

type Parser struct {
	current  Token
	previous Token
}

func (s *Scanner) isAtEnd() bool {
	return s.current >= len(s.source)
}

func (s *Scanner) scanTokens() []Token {
	for !s.isAtEnd() {
		s.scanToken()
	}
	s.tokens = append(s.tokens, Token{"eof", "", s.line})
	return s.tokens
}

func (s *Scanner) match(expected string) bool {
	if s.isAtEnd() {
		return false
	}
	if string([]byte{s.source[s.current]}) != expected {
		return false
	}
	s.current = s.current + 1
	return true
}

func (s *Scanner) advance() string {
	var c string = string([]byte{s.source[s.current]})
	s.current = s.current + 1
	return c
}

func (s *Scanner) peek() string {
	if s.isAtEnd() {
		return "\x00"
	}
	return string([]byte{s.source[s.current]})
}

func (s *Scanner) peekNext() string {
	if (s.current + 1) >= len(s.source) {
		return "\x00"
	}
	return string([]byte{s.source[s.current+1]})
}

func (s *Scanner) isDigit(v string) bool {
	return (len(v) == 1) && (v[0] >= 0x30) && (v[0] <= 0x39)
}

func (s *Scanner) scanToken() {
	var c string = s.advance()
	switch c {
	case "(":
		s.tokens = append(s.tokens, Token{"left_paren", "", s.line})
	case ")":
		s.tokens = append(s.tokens, Token{"right_paren", "", s.line})
	case "{":
		s.tokens = append(s.tokens, Token{"left_brace", "", s.line})
	case "}":
		s.tokens = append(s.tokens, Token{"right_brace", "", s.line})
	case ",":
		s.tokens = append(s.tokens, Token{"comma", "", s.line})
	case ".":
		s.tokens = append(s.tokens, Token{"dot", "", s.line})
	case "-":
		s.tokens = append(s.tokens, Token{"minus", "", s.line})
	case "+":
		s.tokens = append(s.tokens, Token{"plus", "", s.line})
	case ";":
		s.tokens = append(s.tokens, Token{"semicolon", "", s.line})
	case "*":
		s.tokens = append(s.tokens, Token{"star", "", s.line})
	case "!":
		if s.match("=") {
			s.tokens = append(s.tokens, Token{"bang_equal", "", s.line})
		} else {
			s.tokens = append(s.tokens, Token{"bang", "", s.line})
		}
	case "=":
		if s.match("=") {
			s.tokens = append(s.tokens, Token{"equal_equal", "", s.line})
		} else {
			s.tokens = append(s.tokens, Token{"equal", "", s.line})
		}
	case "<":
		if s.match("=") {
			s.tokens = append(s.tokens, Token{"less_equal", "", s.line})
		} else {
			s.tokens = append(s.tokens, Token{"less", "", s.line})
		}
	case ">":
		if s.match("=") {
			s.tokens = append(s.tokens, Token{"greater_equal", "", s.line})
		} else {
			s.tokens = append(s.tokens, Token{"greater", "", s.line})
		}
	case "\x22":
		s.tokens = append(s.tokens, Token{"string", "", s.line})
		for (s.peek() != "\x22") && (!(s.isAtEnd())) {
			if s.peek() == "\x0a" {
				s.line = s.line + 1
			}
			s.tokens[len(s.tokens)-1].d = s.tokens[len(s.tokens)-1].d + s.advance()
		}

		if s.isAtEnd() {
			log.Fatalln("Unterminated string at line", s.line)
		}
		s.advance()
	case "\x20":
	case "\x0d":
	case "\x09":
	case "\x0a":
		s.tokens = append(s.tokens, Token{"new_line", "", s.line})
		s.line = s.line + 1
	default:
		if s.isDigit(c) {
			s.tokens = append(s.tokens, Token{"number", c, s.line})
			for s.isDigit(s.peek()) {
				s.tokens[len(s.tokens)-1].d = s.tokens[len(s.tokens)-1].d + s.advance()
			}

			if (s.peek() == ".") && (s.isDigit(s.peekNext())) {
				s.tokens[len(s.tokens)-1].d = s.tokens[len(s.tokens)-1].d + s.advance()
				for s.isDigit(s.peek()) {
					s.tokens[len(s.tokens)-1].d = s.tokens[len(s.tokens)-1].d + s.advance()
				}
			}
		} else {
			log.Fatalln("Unexpected character", c, "at line", s.line)
		}
	}

}

func main() {
	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}

	var s Scanner = Scanner{}

	s.source = string(data)
	s.tokens = nil
	s.current = 0
	s.line = 1

	s.scanTokens()
	fmt.Println(s.tokens)
}
