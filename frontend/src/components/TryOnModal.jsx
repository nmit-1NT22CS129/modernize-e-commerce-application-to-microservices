import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const TryOnModal = ({ productImage, productType }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const clothImgRef = useRef(new Image());
  const clothReady = useRef(false);
  const lastDrawTime = useRef(0);

  /* ================= BACKGROUND REMOVAL ================= */
  const removeBackground = async (imageUrl) => {
    const blob = await fetch(imageUrl).then(res => res.blob());
    const formData = new FormData();
    formData.append("image", blob);

    const res = await fetch("http://localhost:5000/remove-bg", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return `data:image/png;base64,${data.image}`;
  };

  /* ================= INIT ================= */
  useEffect(() => {
    let camera;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await new Promise(r => (videoRef.current.onloadedmetadata = r));

      // Fix canvas size ONCE (prevents FPS drop)
      const canvas = canvasRef.current;
      canvas.width = 640;
      canvas.height = 480;

      // BG removed cloth
      const transparentImg = await removeBackground(productImage);
      clothImgRef.current.onload = () => (clothReady.current = true);
      clothImgRef.current.src = transparentImg;

      const pose = new Pose({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
      });

      pose.setOptions({
        modelComplexity: 0, // ⚡ FAST MODE
        smoothLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      pose.onResults(onResults);

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });

      camera.start();
    };

    init();

    return () => {
      camera?.stop();
      videoRef.current?.srcObject?.getTracks()?.forEach(t => t.stop());
    };
  }, [productImage]);

  /* ================= DRAW ================= */
  const onResults = (results) => {
    const now = performance.now();
    if (now - lastDrawTime.current < 33) return; // FPS cap ~30
    lastDrawTime.current = now;

    if (!clothReady.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    let x = 0, y = 0, w = 0, h = 0;

    /* ================= TOPWEAR ================= */
    if (productType === "Topwear") {
      const ls = results.poseLandmarks[11];
      const rs = results.poseLandmarks[12];
      const lh = results.poseLandmarks[23];
      const rh = results.poseLandmarks[24];
      if (!ls || !rs || !lh || !rh) return;

      const shoulderY = ((ls.y + rs.y) / 2) * canvas.height;
      const hipY = ((lh.y + rh.y) / 2) * canvas.height;
      const torsoHeight = hipY - shoulderY;

      w = Math.abs(rs.x - ls.x) * canvas.width * 1.9;
      h = torsoHeight * 1.25;

      x = ((ls.x + rs.x) / 2) * canvas.width - w / 2;
      y = shoulderY - h * 0.18;
    }

    /* ================= BOTTOMWEAR ================= */
    if (productType === "Bottomwear") {
  const ls = results.poseLandmarks[11];
  const rs = results.poseLandmarks[12];
  const lh = results.poseLandmarks[23];
  const rh = results.poseLandmarks[24];
  const lk = results.poseLandmarks[25];

  if (!ls || !rs || !lh || !rh) return;

  const shoulderY = ((ls.y + rs.y) / 2) * canvas.height;
  const hipY = ((lh.y + rh.y) / 2) * canvas.height;
  const waistY = shoulderY + (hipY - shoulderY) * 0.52;

  const hipX = Math.abs(rh.x - lh.x);
  const hipZ = Math.abs(rh.z - lh.z);
  const depthScale = 1 + hipZ * 2.5;

  const hipWidth = hipX * depthScale * canvas.width;

  let legHeight;
  if (lk && lk.visibility > 0.4) {
    legHeight = Math.abs(lk.y - lh.y) * canvas.height;
  } else {
    legHeight = (hipY - shoulderY) * 1.15;
  }

  w = hipWidth * 1.4;
  h = legHeight * 1.2;

  w = Math.min(w, canvas.width * 0.9);
  h = Math.min(h, canvas.height * 0.9);

  x = ((lh.x + rh.x) / 2) * canvas.width - w / 2;
  y = waistY - h * 0.05;
}

    if (w <= 0 || h <= 0) return;
    ctx.drawImage(clothImgRef.current, x, y, w, h);
  };

  return (
    <div className="flex justify-center">
      <video ref={videoRef} autoPlay playsInline muted hidden />
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
    </div>
  );
};

export default TryOnModal;
