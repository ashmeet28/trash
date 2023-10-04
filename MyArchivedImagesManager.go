package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"path"
)

func main() {
	files, err := os.ReadDir(".")
	if err != nil {
		log.Fatal(err)
	}
	if os.Args[1] == "check" {
		isFileCorruptionDetected := false
		for _, file := range files {
			data, err := os.ReadFile(file.Name())
			if err != nil {
				log.Fatal(err)
			}
			h := sha256.Sum256(data)
			if hex.EncodeToString(h[:12])+path.Ext(file.Name()) != file.Name() {
				fmt.Println("File corruption detected - " + file.Name())
				isFileCorruptionDetected = true
				break
			}
		}
		if !isFileCorruptionDetected {
			fmt.Println("Check - Done")
		}
	} else if os.Args[1] == "rename" {
		for _, file := range files {
			data, err := os.ReadFile(file.Name())
			if err != nil {
				log.Fatal(err)
			} else {
				h := sha256.Sum256(data)
				err := os.WriteFile("../"+os.Args[2]+"/"+hex.EncodeToString(h[:12])+path.Ext(file.Name()), data, 0666)
				if err != nil {
					log.Fatal(err)
				}
			}
		}
		fmt.Println("Rename - Done")
	}
}
