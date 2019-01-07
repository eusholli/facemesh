function resizeCanvasAndResults(dimensions, canvas, results) {
  const { width, height } =
    dimensions instanceof HTMLVideoElement
      ? faceapi.getMediaDimensions(dimensions)
      : dimensions;
  canvas.width = width;
  canvas.height = height;

  // resize detections (and landmarks) in case displayed image is smaller than
  // original size
  return results.map(res => res.forSize(width, height));
}

function drawRedactions(resizedDetections, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  resizedDetections.forEach(function(resizedDetection) {
    const box = resizedDetection._box;
    if (box) {
      const x = box._x;
      const y = box._y;
      const width = box._width;
      const height = box._height;
      ctx.fillRect(x, y, width, height);
    } else {
      console && console.log("box is null");
    }
  });
}

function drawDetections(
  dimensions,
  canvas,
  detections,
  withBoxes,
  withRedaction
) {
  const resizedDetections = resizeCanvasAndResults(
    dimensions,
    canvas,
    detections
  );
  if (withRedaction) {
    drawRedactions(resizedDetections, canvas);
  } else if (withBoxes) {
    faceapi.drawDetection(canvas, resizedDetections);
  }
}

function drawLandmarks(
  dimensions,
  canvas,
  results,
  withBoxes = true,
  withRedaction
) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results);

  if (withRedaction) {
    drawRedactions(resizedResults.map(det => det.detection), canvas);
    return;
  }

  if (withBoxes) {
    faceapi.drawDetection(canvas, resizedResults.map(det => det.detection));
  }

  const faceLandmarks = resizedResults.map(det => det.landmarks);
  const drawLandmarksOptions = {
    lineWidth: 2,
    drawLines: true,
    color: "green"
  };
  faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
}
