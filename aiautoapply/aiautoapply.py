from PIL import Image

import pytesseract
import pyautogui


pyautogui.screenshot("my_screenshot.png")
print(pytesseract.image_to_string(Image.open('my_screenshot.png')))