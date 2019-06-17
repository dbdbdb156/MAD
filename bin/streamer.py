import base64
from picamera.array import PiRGBArray
import cv2
import zmq
import time
from picamera import PiCamera

context = zmq.Context()
footage_socket = context.socket(zmq.PUB)
footage_socket.connect('tcp://localhost:5555')

camera = PiCamera()
camera.resolution = (640, 480)
camera.framerate = 30
rawCapture = PiRGBArray(camera, size=(640, 480))
time.sleep(0.1)
for frame in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
   image = frame.array
   encoded, buffer = cv2.imencode('.jpg',image)
   jpg_as_text = base64.b64encode(buffer)
   footage_socket.send(jpg_as_text)
   print(jpg_as_text)
   print('\n')
   key = cv2.waitKey(1) & 0xFF
   rawCapture.truncate(0)
   if key == ord("q"):
       break
