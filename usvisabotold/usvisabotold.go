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

func waitWhileTextShows(x string, y string, w string, h string, t string) bool {
	return waitWhileTextShowsWithTimeout(x, y, w, h, t, 60)
}

func waitWhileTextShowsWithTimeout(x string, y string, w string, h string,
	t string, tt int64) bool {

	ts := time.Now().Unix()
	for readTextFromScreen(x, y, w, h) != t {
		if time.Now().Unix() > (ts + tt) {
			return false
		}
		time.Sleep(3 * time.Second)
	}
	return true

}

func readTextFromScreen(x string, y string, w string, h string) string {
	screenshotFilePath := takeScreenshot()

	cropedScreenshotFilePath := cropScreenshot(screenshotFilePath, x, y, w, h)

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

func takeScreenshot() string {
	screenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("gnome-screenshot", "-f", screenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(screenshotFilePath)
	return screenshotFilePath
}
func takeAndSaveScreenshot() string {
	screenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("gnome-screenshot", "-f", screenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	return screenshotFilePath
}

func cropScreenshot(screenshotFilePath, x, y, w, h string) string {
	cropedScreenshotFilePath := nextFileNameInStorage() + ".png"
	exec.Command("convert", screenshotFilePath, "-crop", w+"x"+h+"+"+x+"+"+y,
		cropedScreenshotFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(cropedScreenshotFilePath)
	return cropedScreenshotFilePath
}

func checkForBlackText(x string, y string, w string, h string) (int, int, bool) {
	screenshotFilePath := takeScreenshot()

	cropedScreenshotFilePath := cropScreenshot(screenshotFilePath, x, y, w, h)

	grayFilePath := nextFileNameInStorage() + ".png"
	exec.Command("convert", cropedScreenshotFilePath,
		"-colorspace", "Gray", "-threshold", "50%", grayFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(grayFilePath)

	rgbaFilePath := nextFileNameInStorage() + ".rgba"
	exec.Command("convert", grayFilePath, rgbaFilePath).Run()
	time.Sleep(1 * time.Second)
	scheduleFileRemoval(rgbaFilePath)

	buf, _ := os.ReadFile(rgbaFilePath)
	bw, _ := strconv.ParseUint(w, 10, 64)
	bh, _ := strconv.ParseUint(h, 10, 64)
	return doesImgContains(buf, int(bw), int(bh), []byte{0, 0, 0, 0xff}, 1, 1)
}

func typeTextAndEnter(t string) {
	exec.Command("xdotool", "type", t).Run()
	time.Sleep(1 * time.Second)
	exec.Command("xdotool", "key", "Return").Run()
	time.Sleep(1 * time.Second)
}

func typeTextWithoutEnter(t string) {
	exec.Command("xdotool", "type", t).Run()
	time.Sleep(1 * time.Second)
}

func mouseMoveAndLeftClick(x string, y string) {
	mouseMove(x, y)
	exec.Command("xdotool", "click", "1").Run()
	time.Sleep(1 * time.Second)
}

func mouseMove(x string, y string) {
	exec.Command("xdotool", "mousemove", "--sync", x, y).Run()
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

func doesImgContains(baseRGBA []byte, baseW int, baseH int,
	templateRGBA []byte, templateW int, templateH int) (int, int, bool) {

	if (baseW < templateW) || (baseH < templateH) {
		return 0, 0, false
	}

	var x int
	var y int

	var tx int
	var ty int

	var hasFound bool = false

	for y = 0; y <= baseH-templateH; y++ {
		for x = 0; x <= baseW-templateW; x++ {

			hasFound = true

			for ty = 0; ty < templateH; ty++ {
				for tx = 0; tx < templateW; tx++ {
					c1 := baseRGBA[(x*4)+(baseW*y*4):]
					c1 = c1[:4]

					c2 := templateRGBA[(tx*4)+(templateW*ty*4):]
					c2 = c2[:4]

					if (c1[0] != c2[0]) || (c1[1] != c2[1]) ||
						(c1[2] != c2[2]) || (c1[3] != c2[3]) {
						hasFound = false
						break
					}
				}
				if !hasFound {
					break
				}
			}

			if hasFound {
				return x, y, true
			}

		}
	}

	return 0, 0, false
}

func isDateFoundValid(a string) bool {

	return false
}

var robotLogsBuf []byte

func robotLog(t string) {
	t = time.Now().Format(time.RFC3339) + " ---- " + t
	robotLogsBuf = append(robotLogsBuf, []byte(t)...)
	robotLogsBuf = append(robotLogsBuf, 0x0a)
	os.WriteFile(storageDirPath+"logs", robotLogsBuf, 0640)
}

func robotRun() bool {
	return false
}

func main() {
	storageDirPath = os.Args[1]
	os.Mkdir(storageDirPath, 0750)
	time.Sleep(1 * time.Second)

	for !robotRun() {
		time.Sleep(5 * time.Second)
	}

}
