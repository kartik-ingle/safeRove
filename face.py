import cv2
import numpy as np
import time
import matplotlib.pyplot as plt
from scipy.signal import find_peaks, detrend, butter, filtfilt, savgol_filter
from scipy.stats import zscore

def bandpass_filter(signal, lowcut=0.7, highcut=4.0, fs=30.0, order=4):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return filtfilt(b, a, signal)

def refine_signal(raw_signal, fps):
    signal = detrend(raw_signal)
    signal = bandpass_filter(signal, fs=fps)
    signal = savgol_filter(signal, window_length=9, polyorder=2)  # Smooth while preserving peaks
    signal = zscore(signal)  # Normalize
    return signal

def getbrightness(frame,fps):
    # grayscale_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    average_intensity = np.mean(frame)
    return(average_intensity)

def estimate_heart_rate(signal, fps):
    smoothed = np.convolve(signal, np.ones(window_size)/window_size, mode='valid')
    smoothed -= np.mean(smoothed)

    peaks, _ = find_peaks(smoothed, distance=fps * 0.5)
    if len(peaks) < 2:
        return None

    intervals = np.diff(peaks) / fps
    avg_interval = np.mean(intervals)
    bpm = 60 / avg_interval
    return round(bpm, 2)

# Use OpenCV Haar Cascade for face detection (MediaPipe not available on Python 3.13)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Try camera index 0 first, then 1 if 0 fails
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    cap = cv2.VideoCapture(1)

if not cap.isOpened():
    print("Error: Could not open camera.")
else:
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0
    print("FPS:", fps)

    brightness_values = []
    timestamps = []

    duration = 40 #seconds
    start_time = time.time()

    window_size = 5
    n = 1
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret:
            break

        # brightness_intensity = getbrightness(frame,fps)
        # print(brightness_intensity)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

        if len(faces) > 0:
            # Take the largest detected face
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])

            forehead = frame[y:y + h//5, x + w//4:x + 3*w//4]
            if forehead.size != 0:
                green_frame = forehead.copy()
                green_frame[:,:,0] = 0
                green_frame[:,:,2] = 0
                brightness = np.mean(green_frame)
                print(brightness)
                brightness_values.append(brightness)
                timestamps.append(time.time() - start_time)

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, "Face", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # brightness_values = brightness_values[60:]
            # timestamps = timestamps[60:]

            if n == 1 and len(brightness_values) > fps* 3:
                brightness_values = []
                timestamps = []
                n = 0

            elif n == 0 and len(brightness_values) > fps * 5:
                refined = refine_signal(brightness_values[-int(fps*10):], fps)
                hr = estimate_heart_rate(refined, fps)
                if hr:
                    cv2.putText(frame, f"HR: {hr} BPM", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 2)
                else:
                    cv2.putText(frame, "Calculating HR...", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)

        cv2.imshow("Heart Rate Monitor", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    print("\nExecuted Succefully.")
    if len(brightness_values) > fps * 10:
        refined_signal = refine_signal(brightness_values, fps)
        final_hr = estimate_heart_rate(refined_signal, fps)
        if final_hr:
            print(f"Final Estimated Heart Rate: {final_hr} BPM")
        else:
            print("Could not determine a valid heart rate. Try again.")
    else:
        print("Not enough data collected.")

    # if brightness_values:
    #     plt.figure(figsize=(10, 4))
    #     plt.plot(timestamps, brightness_values, label="PPG Signal (Brightness)")
    #     plt.xlabel("Time (s)")
    #     plt.ylabel("Brightness")
    #     plt.title("Extracted PPG Signal Over Time")
    #     plt.grid(True)
    #     plt.legend()
    #     plt.tight_layout()
    #     plt.show()

    if brightness_values:
        refined_signal = refine_signal(brightness_values, fps)
        plt.figure(figsize=(10, 4))
        plt.plot(timestamps[:len(refined_signal)], refined_signal, label="Refined rPPG Signal", color='blue')
        plt.xlabel("Time (s)")
        plt.ylabel("Normalized Brightness")
        plt.title("Refined rPPG Signal (Detrended + Filtered + Smoothed + Normalized)")
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.show()