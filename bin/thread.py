import io
import picamera
import logging
import socketserver
import os
import cv2
import numpy as np
import math
from threading import Condition
from http import server
from picamera.array import PiRGBArray
import RPi.GPIO as GPIO
import time
import threading


PAGE="""\
<html>
<head>
<title>picamera MJPEG streaming demo</title>
</head>
<body>
<img src="stream.mjpg" width="640" height="480" />
</body>
</html>
"""
port = 8000
GET_IP_CMD ="hostname -I"
GPIO.setmode(GPIO.BOARD)

camera = picamera.PiCamera()
camera.resolution = (640, 480)
camera.framerate = 30

class StreamingOutput(object):
    def __init__(self):
        self.frame = None
        self.buffer = io.BytesIO()
        self.condition = Condition()
    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)


class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def Streaming(camera,output):
    camera.start_recording(output,format='mjpeg')

    try:
        address = ('',port)
        server = StreamingServer(address, StreamingHandler)
        ip=os.popen(GET_IP_CMD).read()
        ip=ip.split(' ')
        ipLAN = ip[0]
        ipWiFi = ip[1] if (len(ip[1])>3) else "localhost"
        print('IP(1) : Go to http://%s:%d' % (ipLAN,port))
        print('IP(2) : Go to http://%s:%d' % (ipWiFi,port))
        server.serve_forever()
    finally:
        camera.stop_recording()
        
def line(camera):
    GPIO.setup(7, GPIO.OUT)
    GPIO.setup(8, GPIO.OUT)
    theta = 0
    minLineLength = 50
    maxLineGap = 50
    rawCapture = PiRGBArray(camera, size=(640, 480))
    time.sleep(0.1)
    for frame in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
        image = frame.array
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
        edged = cv2.Canny(gray, 75, 150)
        lines = cv2.HoughLinesP(edged, 1, np.pi / 180, 10, minLineLength, maxLineGap)
        if lines is not None:
            for x in range(0, len(lines)):
                for x1, y1, x2, y2 in lines[x]:
                    cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    theta = theta + math.atan2((y2 - y1), (x2 - x1))
        threshold = 6
        if (theta > threshold):
            GPIO.output(7, True)
            GPIO.output(8, False)
            print("left")
        if (theta < -threshold):
            GPIO.output(8, True)
            GPIO.output(7, False)
            print("right")
        if (abs(theta) < threshold):
            GPIO.output(8, False)
            GPIO.output(7, False)
            print("straight")
        theta = 0
        cv2.imshow("Frame", image)
        key = cv2.waitKey(1) & 0xFF
        rawCapture.truncate(0)
        if key == ord("q"):
            break
output = StreamingOutput()
thread1 = threading.Thread(target=Streaming,args=(camera,output,))
thread2 = threading.Thread(target=line,args=(camera,))
thread1.start()
thread2.start()
