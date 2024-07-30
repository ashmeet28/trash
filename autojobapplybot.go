package main

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

func findTextBox(d []byte, t []string) [][]int {
	var parsedData [][]string
	for _, l := range strings.Split(string(d), "\n") {
		if len(l) != 0 {
			parsedData = append(parsedData, strings.Split(l, "\t"))
		}
	}

	var allPoints [][]int

	for len(parsedData) > len(t) {
		for i, w := range t {
			if parsedData[i][11] == w {
				if i == len(t)-1 {
					l := parsedData[0]

					var p []int

					v1, _ := strconv.ParseInt(l[6], 10, 64)
					v2, _ := strconv.ParseInt(l[8], 10, 64)
					p = append(p, int(v1)+(int(v2)/2))

					v3, _ := strconv.ParseInt(l[7], 10, 64)
					v4, _ := strconv.ParseInt(l[9], 10, 64)
					p = append(p, int(v3)+(int(v4)/2))

					allPoints = append(allPoints, p)
					parsedData = parsedData[len(t):]
				}
			} else {
				parsedData = parsedData[i+1:]
				break
			}
		}
	}

	return allPoints
}

func isPointInRect(px, py, x1, y1, x2, y2 int) bool {
	return px >= x1 && px <= x2 && py >= y1 && py <= y2
}

func getTextDataOnScreen() []byte {
	exec.Command("gnome-screenshot", "-f", "/tmp/bot-screen.png").Run()
	time.Sleep(500 * time.Millisecond)

	exec.Command("tesseract", "/tmp/bot-screen.png", "/tmp/bot-text", "-l", "eng", "tsv").Run()
	time.Sleep(500 * time.Millisecond)

	d, _ := os.ReadFile("/tmp/bot-text.tsv")

	return d
}

func mouseMove(x int, y int) {
	exec.Command("xdotool", "mousemove",
		strconv.FormatInt(int64(x), 10),
		strconv.FormatInt(int64(y), 10)).Run()
	time.Sleep(500 * time.Millisecond)
}

func mouseRightClick() {
	exec.Command("xdotool", "click", "1").Run()
	time.Sleep(500 * time.Millisecond)
}

func clickOnEasyApply(td []byte) {
	var p []int
	fmt.Println(findTextBox(td, []string{"Easy", "Apply"}))
	for _, curP := range findTextBox(td, []string{"Easy", "Apply"}) {
		if isPointInRect(curP[0], curP[1], 900, 228, 1920, 1080) {
			p = curP
		}
	}
	if len(p) == 0 {
		return
	}
	mouseMove(p[0], p[1])
	mouseRightClick()
}

func cleanUpForNextIter() {
	os.Remove("/tmp/bot-screen.png")
	os.Remove("/tmp/bot-txt.tsv")
	time.Sleep(500 * time.Millisecond)
}

func main() {
	for {
		textData := getTextDataOnScreen()
		clickOnEasyApply(textData)
		// cleanUpForNextIter()
	}
}
