import RPi.GPIO as GPIO
import cv2
import numpy as np
import math

GPIO.setmode(GPIO.BOARD)
GPIO.setup(7, GPIO.OUT)
GPIO.setup(8, GPIO.OUT)
theta=0
minLineLength = 50
maxLineGap = 50

video = cv2.VideoCapture(1)

while(True):
    ret,src = video.read()
    src = cv2.resize(src,(640,480))
    blurred = cv2.GaussianBlur(src, (5, 5), 0)
    gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(gray, 75, 150)
    lines = cv2.HoughLinesP(edged,1,np.pi/180,10,minLineLength,maxLineGap)
    if lines is not None:
       for x in range(0, len(lines)):
           for x1,y1,x2,y2 in lines[x]:
               cv2.line(blurred,(x1,y1),(x2,y2),(0,255,0),2)
               theta=theta+math.atan2((y2-y1),(x2-x1))
    threshold=6
    if(theta>threshold):
       GPIO.output(7,True)
       GPIO.output(8,False)
       print("left")
    if(theta<-threshold):
       GPIO.output(8,True)
       GPIO.output(7,False)
       print("right")
    if(abs(theta)<threshold):
      GPIO.output(8,False)
      GPIO.output(7,False)
      print("straight")
    theta=0
    cv2.imshow("Frame",blurred)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
       break
video.release()
cv2.destroyAllWindows()
