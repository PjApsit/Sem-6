from ultralytics import YOLO

# Load model once (important)
model = YOLO("food_model.pt")

def detect_and_count(image_path):
    results = model(image_path)

    counts = {}

    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            if class_name in counts:
                counts[class_name] += 1
            else:
                counts[class_name] = 1

    return counts
