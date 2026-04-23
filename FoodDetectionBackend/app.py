# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from yolo_detector import detect_and_count

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    filename = file.filename
    
    # YOLO support fix: rename .jfif to .jpg
    if filename.lower().endswith(".jfif"):
        filename = os.path.splitext(filename)[0] + ".jpg"
        
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        counts = detect_and_count(filepath)

        return jsonify({
            "detected_foods": counts
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
