package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strconv"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("public")))

	http.HandleFunc("/dl/", func(w http.ResponseWriter, r *http.Request) {
		file_path, err := url.PathUnescape(r.URL.Path[len("/dl/"):])
		if err != nil {
			fmt.Println("Unable to unescape path")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		file_path = path.Join(os.Args[1], file_path)

		file, err1 := os.Open(file_path)
		if err1 != nil {
			fmt.Println("Unable to open file")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		file_stat, err2 := os.Stat(file_path)
		if err2 != nil {
			fmt.Println("Unable to get stat")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Length", strconv.FormatInt(file_stat.Size(), 10))
		w.Header().Set("Content-Disposition", "attachment; filename="+path.Base(file_path))

		fmt.Println("Sending file: " + path.Base(file_path))
		_, err3 := io.Copy(w, file)
		file.Close()
		if err3 != nil {
			fmt.Println("Error while sending file")
			return
		}
		fmt.Println("File sent: " + file_path)
	})

	http.HandleFunc("/up/", func(w http.ResponseWriter, r *http.Request) {
		file_path, err := url.PathUnescape(r.URL.Path[len("/up/"):])
		if err != nil {
			fmt.Println("Unable to unescape path")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		file_path = path.Join(os.Args[1], file_path)
		fmt.Println("Preparing to save: " + file_path)
		err1 := os.MkdirAll(path.Dir(file_path), 0755)
		if err1 != nil {
			fmt.Println("Unable to make parent dir")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		file, err2 := os.Create(file_path)
		if err2 != nil {
			fmt.Println("Unable to create file")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		fmt.Println("Receiving file: " + path.Base(file_path))
		_, err3 := io.Copy(file, r.Body)
		file.Close()
		if err3 != nil {
			fmt.Println("Error while receiving file")
			return
		}
		fmt.Println("File received: " + file_path)
	})

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Unable to listen and serve")
	}
}
