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
  withRedaction = false,
  labeledFaceDescriptors = undefined,
  withFaces = false,
  knownFaces
) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results);

  if (withBoxes) {
    if (labeledFaceDescriptors) {
      const maxDescriptorDistance = 0.6;
      const faceMatcher = new faceapi.FaceMatcher(
        labeledFaceDescriptors,
        maxDescriptorDistance
      );

      const faceMatchResults = resizedResults.map(fd =>
        faceMatcher.findBestMatch(fd.descriptor)
      );

      const boxesWithText = faceMatchResults.map((bestMatch, i) => {
        const box = resizedResults[i].detection.box;
        const key = bestMatch.label;
        const knownFace = knownFaces.get(key);
        const text = knownFace.details.name;
        const boxWithText = new faceapi.BoxWithText(box, text);
        return boxWithText;
      });

      faceapi.drawDetection(canvas, boxesWithText);
    } else {
      faceapi.drawDetection(canvas, resizedResults.map(det => det.detection));
    }
  }

  if (withRedaction) {
    drawRedactions(resizedResults.map(det => det.detection), canvas);
    return;
  }
  if (withFaces) {
    const faceLandmarks = resizedResults.map(det => det.landmarks);

    const drawLandmarksOptions = {
      lineWidth: 2,
      drawLines: true,
      color: "green"
    };
    faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
  }
}
