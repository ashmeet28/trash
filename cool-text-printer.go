package main

import (
	"fmt"
	"strconv"
	"time"
	"math/rand"
)

func rd() {
	fmt.Print("\x1b[2J")
	fmt.Print("\x1b[1;1H")
}

func sc(c string) {
	t1, _ := strconv.ParseInt(c[:2], 16, 64)
	v1 := strconv.FormatInt(t1, 10)

	t2, _ := strconv.ParseInt(c[2:4], 16, 64)
	v2 := strconv.FormatInt(t2, 10)

	t3, _ := strconv.ParseInt(c[4:6], 16, 64)
	v3 := strconv.FormatInt(t3, 10)
	fmt.Print("\x1b[38;2;" + v1 + ";" + v2 + ";" + v3 + "m")
}

func wt(t time.Duration) {
	time.Sleep(t * time.Millisecond)
}

func pl(l string) {
	for _, c := range l {
		fmt.Print(string(c))
		wt(time.Duration(rand.Intn(50) + 50))
	}
	fmt.Println("")
}
func main() {
	rd()
	sc("ffffff")

	pl("Hiii how are you i building a compiler")
}
