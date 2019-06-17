import time
import cv2
from picamera.array import PiRGBArray
from picamera import PiCamera
import numpy as np
import math

# Cam properties
fps = 30.
frame_width = 640
frame_height = 480
# Create capture
camera = PiCamera()


# Set camera properties
camera.resolution = (640,480)
camera.framerate = 30
# Define the gstreamer si nk
gst_str_rtp = "appsrc ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=superfast ! rtph264pay ! udpsink host=127.0.0.1 port=5000"
#gst_str_rtp = "appsrc ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=superfast ! rtph264pay ! udpsink host=192.168.0.83 port=5000"
#gst_str_rtp = "appsrc ! viedeo/x-raw, width=640, height=480 ! videoconvert ! x264enc tune=zerolatency ! rtph264pay ! gdppay ! tcpserversink=192.168.0.83 port=5000"

# Check if cap is open


# Create videowriter as a SHM sink
out = cv2.VideoWriter(gst_str_rtp,cv2.CAP_GSTREAMER, 0, 20, (320, 240), True)
rawCapture = PiRGBArray(camera,size = (640,480))
time.sleep(0.1)
# Loop it
for frame in camera.capture_continuous(rawCapture,format = "bgr",use_video_port = True):
    image = frame.array
    blurred = cv2.GaussianBlur(image, (5, 5), 0)
    gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(gray, 75, 150)
    lines = cv2.HoughLinesP(edged,1,np.pi/180,10,50,50)
    if lines is not None:
       for x in range(0, len(lines)):
           for x1,y1,x2,y2 in lines[x]:
               cv2.line(image,(x1,y1),(x2,y2),(0,255,0),2)


    out.write(image)
    cv2.imshow("Frame",image)
    key = cv2.waitKey(1) & 0xFF
    rawCapture.truncate(0)
    if key == ord("q"):
        break
