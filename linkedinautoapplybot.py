import sys
import cv2 as cv
import subprocess
import time

def mousemove(x: int, y: int):
    subprocess.run(["xdotool", "mousemove", str(x), str(y)], capture_output=True)
    time.sleep(1)

def mouseclickright():
    subprocess.run(["xdotool", "click", "1"], capture_output=True)
    time.sleep(1)

def keyboardtype(s):
    subprocess.run(["xdotool", "type", s], capture_output=True)
    time.sleep(1)

def takescreenshot(screen_img_path):
    subprocess.run(["gnome-screenshot", "-f", screen_img_path], capture_output=True)
    time.sleep(1)

def mousescrolldown():
    subprocess.run(["xdotool", "click", "4"], capture_output=True)
    time.sleep(1)

def mousescrollup():
    subprocess.run(["xdotool", "click", "5"], capture_output=True)
    time.sleep(1)

def findAndRightClick(target_img_path):
    screen_img_path = '/tmp/bot-screenshot.png'

    takescreenshot(screen_img_path)

    screenImg = cv.imread(screen_img_path, cv.IMREAD_GRAYSCALE)

    btnImg = cv.imread(target_img_path, cv.IMREAD_GRAYSCALE)

    w, h = btnImg.shape[::-1]

    res = cv.matchTemplate(screenImg, btnImg, cv.TM_CCOEFF_NORMED)

    min_val, max_val, min_loc, max_loc = cv.minMaxLoc(res)

    top_left = max_loc

    print(max_val, top_left[0]+(w/2), top_left[1] + (h/2))

    if max_val > 0.8:
        mousemove(top_left[0]+(w/2), top_left[1] + (h/2))
        mouseclickright()
        return True

    return False


def main() -> int:
    findAndRightClick('/tmp/bot-easy-apply-btn.png')
    findAndRightClick('/tmp/bot-next-btn-1.png')
    findAndRightClick('/tmp/bot-next-btn-2.png')

    while (findAndRightClick('/tmp/bot-yes-btn.png')):
        continue

    while(findAndRightClick('/tmp/bot-review-btn.png')):
        keyboardtype('5')


    mousemove(1920/2, 1080/2)
    mouseclickright()
    for i in range(10):
        mousescrollup()
    findAndRightClick('/tmp/bot-follow-check-box.png')
    findAndRightClick('/tmp/bot-submit-application-btn.png')

    return 0

if __name__ == '__main__':
    sys.exit(main())  