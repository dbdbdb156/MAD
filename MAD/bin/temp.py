import json
import sys
import Adafruit_DHT

sensor = Adafruit_DHT.DHT11


pin = 4





#Data

def main():
	
	h, t=Adafruit_DHT.read_retry(sensor, pin)


	print("Temp:", t,"C")
	print("Humidity:", h, "%")




	


main()

