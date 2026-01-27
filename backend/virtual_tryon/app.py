from flask import Flask, request, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

@app.route("/remove-bg", methods=["POST"])
def remove_bg():
    image = request.files["image"]

    input_img = Image.open(image).convert("RGBA")
    output_img = remove(input_img)

    buf = io.BytesIO()
    output_img.save(buf, format="PNG")
    buf.seek(0)

    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    return jsonify({ "image": img_base64 })

if __name__ == "__main__":
    app.run(port=5000)
