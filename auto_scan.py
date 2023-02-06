import pyautogui
import time

barcode = input("Bar Code: ")
container = input("Container: ")
i = int(input("Count: "))

print("Auto scanning in 5 seconds...")

time.sleep(5)

while i != 0:
    i = i - 1
    pyautogui.typewrite(barcode + "\n", interval=0.02)
    pyautogui.typewrite(container + "\n", interval=0.02)
