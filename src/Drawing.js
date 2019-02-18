class Drawing {
  constructor(videoEl, canvasEl) {
    this.videoEl = videoEl;
    this.canvasEl = canvasEl;
  }

  resizeCanvasAndResults(results) {
    const { width, height } =
      this.videoEl instanceof HTMLVideoElement
        ? faceapi.getMediaDimensions(this.videoEl)
        : this.videoEl;

    this.canvasEl.width = width;
    this.canvasEl.height = height;

    return faceapi.resizeResults(results, {
      width: width,
      height: height
    });
  }

  drawRedactions(resizedDetections) {
    const ctx = this.canvasEl.getContext("2d");
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

  annotateCanvas(
    results,
    withBoxes = true,
    withRedaction = false,
    withFaces = false
  ) {
    if (results.length === 0) {
      return;
    }

    if (withRedaction) {
      drawRedactions(results.map(det => det.detection), this.canvasEl);
      return;
    }

    if (withBoxes) {
      results.map(fd => {
        if (fd.boxWithText) {
          faceapi.drawDetection(this.canvasEl, fd.boxWithText);
        } else {
          faceapi.drawDetection(this.canvasEl, fd.detection);
        }
      });
    }

    if (withFaces) {
      const faceLandmarks = results.map(det => det.landmarks);

      const drawLandmarksOptions = {
        lineWidth: 2,
        drawLines: true,
        color: "green"
      };
      faceapi.drawLandmarks(this.canvasEl, faceLandmarks, drawLandmarksOptions);
    }
  }

  draw(
    results,
    withBoxes = true,
    withRedaction = false,
    labeledFaceDescriptors = undefined,
    withFaces = false,
    knownFaces
  ) {
    const resizedResults = this.resizeCanvasAndResults(results);

    let hideFaces = [];
    let showFaces = [];

    if (labeledFaceDescriptors) {
      const maxDescriptorDistance = 0.6;
      const faceMatcher = new faceapi.FaceMatcher(
        labeledFaceDescriptors,
        maxDescriptorDistance
      );

      resizedResults.map(fd => {
        const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
        if (bestMatch.label !== "unknown") {
          const box = fd.detection.box;
          const key = bestMatch.label;
          const knownFace = knownFaces.get(key);
          const text = knownFace.details.name;
          const boxWithText = new faceapi.BoxWithText(box, text);
          fd.boxWithText = boxWithText;
          if (knownFace.privacy.consent) {
            showFaces.push(fd);
          } else {
            hideFaces.push(fd);
          }
        } else {
          showFaces.push(fd);
        }
      });

      this.annotateCanvas(hideFaces, withBoxes, withRedaction, withFaces);
      this.annotateCanvas(showFaces, withBoxes, false, withFaces);
    }
  }
}

export default Drawing;
