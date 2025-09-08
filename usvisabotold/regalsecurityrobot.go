package main

import (
	"os"
	"os/exec"
	"strconv"
	"time"
)

var storageDirPath string

var currentFileName uint64

func nextFileNameInStorage() string {
	currentFileName++
	return storageDirPath + strconv.FormatUint(currentFileName, 10)
}

func scheduleFileRemoval(p string) {
	go func() {
		time.Sleep(1 * time.Minute)
		os.Remove(p)
	}()
}

func textWaitWhileShows(x_min, y_min, x_max, y_max int, t string) bool {
	return textWaitWhileShowsWithTimeout(x_min, y_min, x_max, y_max, t, 60)
}

func textWaitWhileShowsWithTimeout(x_min, y_min, x_max, y_max int, t string,
	timeoutSeconds int64) bool {

	ts := time.Now().Unix()
	for textReadFromScreen(x_min, y_min, x_max, y_max) != t {
		if time.Now().Unix() > (ts + timeoutSeconds) {
			return false
		}
		time.Sleep(3 * time.Second)
	}
	return true

}

func textReadFromScreen(x_min, y_min, x_max, y_max int) string {
	screenshotFilePath := screenshotTake()
	cropedScreenshotFilePath := screenshotCrop(screenshotFilePath, x_min, y_min, x_max, y_max)

	textFilePath := nextFileNameInStorage()
	exec.Command("tesseract", cropedScreenshotFilePath, textFilePath, "--psm", "7").Run()
	textFilePath = textFilePath + ".txt"
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(textFilePath)

	buf, _ := os.ReadFile(textFilePath)
	var t string = ""
	for _, b := range buf {
		if b == 0xa {
			break
		} else {
			t = t + string(b)
		}
	}
	return t
}

func textWaitWhileShowsAndmouseMoveAndLeftClick(x_min, y_min, x_max, y_max int, t string) bool {
	if textWaitWhileShows(x_min, y_min, x_max, y_max, t) {
		mouseMoveAndLeftClick((x_min+x_max)/2, (y_min+y_max)/2)
		return true
	} else {
		return false
	}
}

func screenshotTake() string {
	screenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("gnome-screenshot", "-f", screenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(screenshotFilePath)
	return screenshotFilePath
}
func screenshotTakeAndSave() string {
	screenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("gnome-screenshot", "-f", screenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	return screenshotFilePath
}

func screenshotCrop(screenshotFilePath string, x_min, y_min, x_max, y_max int) string {
	x := x_min
	y := y_min
	w := x_max - x_min
	h := y_max - y_min

	cropedScreenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("convert", screenshotFilePath, "-crop",
		strconv.FormatInt(int64(w), 10)+"x"+
			strconv.FormatInt(int64(h), 10)+"+"+
			strconv.FormatInt(int64(x), 10)+"+"+
			strconv.FormatInt(int64(y), 10),
		cropedScreenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(cropedScreenshotFilePath)
	return cropedScreenshotFilePath
}

func textTypeAndEnter(t string) {
	exec.Command("xdotool", "type", t).Run()
	time.Sleep(1 * time.Second)
	exec.Command("xdotool", "key", "Return").Run()
	time.Sleep(1 * time.Second)
}

func textTypeWithoutEnter(t string) {
	exec.Command("xdotool", "type", t).Run()
	time.Sleep(1 * time.Second)
}

func mouseMoveAndLeftClick(x, y int) {
	mouseMove(x, y)
	mouseLeftClick()
}

func mouseMove(x, y int) {
	exec.Command("xdotool", "mousemove", "--sync",
		strconv.FormatInt(int64(x), 10), strconv.FormatInt(int64(y), 10)).Run()
	time.Sleep(1 * time.Second)
}

func mouseLeftClick() {
	exec.Command("xdotool", "click", "1").Run()
	time.Sleep(1 * time.Second)
}

func scrollDown(c int) {
	var a []string
	a = append(a, "key")
	for c > 0 {
		a = append(a, "Down")
		c--
	}
	exec.Command("xdotool", a...).Run()
	time.Sleep(1 * time.Second)
}

var robotLogsBuf []byte

func robotLog(t string) {
	t = "[" + time.Now().Format(time.RFC3339) + "]" + " " + t
	robotLogsBuf = append(robotLogsBuf, []byte(t)...)
	robotLogsBuf = append(robotLogsBuf, 0x0a)
	os.WriteFile(storageDirPath+"journal", robotLogsBuf, 0640)
}

func robotRun() bool {
	return true
}

func main() {
	storageDirPath = os.Args[1]

	os.Mkdir(storageDirPath, 0750)
	time.Sleep(1 * time.Second)

	for !robotRun() {
		time.Sleep(3 * time.Second)
	}
}
