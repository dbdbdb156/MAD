import subprocess

subprocess.run(["raspivid -t 0 -w 720 -h 1280 -fps 25 -hf -vf -b 50000000 -o - | gst-launch-1.0 -e -vvvv fdsrc ! h264parse ! rtph264pay pt=96 config-interval=5 ! udpsink host=192.168.0.52 port=5000"],shell = True)
#subprocess.run(['ls'],shell = True,check = True)
