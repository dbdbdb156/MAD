import cv2
import numpy as np
import math
video = cv2.VideoCapture(1)
fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=500, detectShadows=0)
while(True):
    ret,src = video.read()
    src = cv2.resize(src,(640,480))
    width = 640
    height = 480

    fgmask = fgbg.apply(src)

    nlabels, labels, stats, centroids = cv2.connectedComponentsWithStats(fgmask)

    for index, centroid in enumerate(centroids):
        if stats[index][0] == 0 and stats[index][1] == 0:
            continue
        if np.any(np.isnan(centroid)):
            continue

        x, y, width, height, area = stats[index]
        centerX, centerY = int(centroid[0]), int(centroid[1])

        if area > 10:
            cv2.circle(src, (centerX, centerY), 1, (0, 255, 0), 2)
            cv2.rectangle(src, (x, y), (x + width, y + height), (0, 0, 255))

    cv2.imshow('mask', fgmask)
    cv2.imshow('frame', src)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
           break
video.release()
cv2.destroyAllWindows()
