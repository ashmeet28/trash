package main

import (
	"bytes"
	"html/template"
	"os"
	"path"

	"github.com/yuin/goldmark"
)

func main() {
	projDir := os.Args[1]

	var buf bytes.Buffer
	data, _ := os.ReadFile(path.Join(projDir, ""))
	if err := goldmark.Convert(data, &buf); err != nil {
		panic(err)
	}

	templ, _ := template.ParseFiles(path.Join(projDir, ""))

	type Article struct {
		Title        string
		MDToHTMLText template.HTML
	}

	var articleData Article
	articleData.Title = "Implementing QOI in Go"
	articleData.MDToHTMLText = template.HTML(buf.String())

	var buf2 bytes.Buffer
	templ.Execute(&buf2, articleData)

	os.WriteFile(path.Join(projDir, "public/blog/implementing-qoi-in-go/index.html"), buf2.Bytes(), 0666)
}
