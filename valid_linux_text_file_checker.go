package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	for _, v := range data {
		if ((v < 0x20) || (v > 0x7e)) && v != 0xa {
			fmt.Println("Fail")
			os.Exit(1)
		}
	}
	fmt.Println("Pass")
}
