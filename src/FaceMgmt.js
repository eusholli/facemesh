import { async } from "q";

const SSD_MOBILENETV1 = "ssd_mobilenetv1";
const TINY_FACE_DETECTOR = "tiny_face_detector";
const MTCNN = "mtcnn";
const faceAlgorithmTypes = [SSD_MOBILENETV1, TINY_FACE_DETECTOR, MTCNN];

class FaceDetector {
  constructor(algorithmType, settings) {
    console.log("Algorithm Type: " + algorithmType);

    this.detectorReady = false;
    this.algorithmType = algorithmType;
    this.labeledFaceDescriptors = [];
    this.knownFaces = new Map();
    this.dbUrl =
      "https://facemesh-2b98b.firebaseio.com/" + this.algorithmType + ".json";

    if (algorithmType === SSD_MOBILENETV1) {
      this.options = new faceapi.SsdMobilenetv1Options(settings);
      this.model = faceapi.nets.ssdMobilenetv1;
    } else if (algorithmType === TINY_FACE_DETECTOR) {
      this.options = new faceapi.TinyFaceDetectorOptions(settings);
      this.model = faceapi.nets.tinyFaceDetector;
    } else if (algorithmType === MTCNN) {
      this.options = new faceapi.MtcnnOptions(settings);
      this.model = faceapi.nets.mtcnn;
    } else {
      throw new Error("algorithmType not recognized: " + this.algorithmType);
    }

    fetch(this.dbUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data != null) {
          for (const key in data) {
            let value = data[key];
            const faceDescriptor = new Float32Array(value.faceDescriptor);
            const labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors(
              key,
              [faceDescriptor]
            );
            this.labeledFaceDescriptors.push(labeledFaceDescriptors);
            this.knownFaces.set(key, value);
          }
        }
        console.log(data);
      })
      .catch(err => console.error(err));
  }
  async loadModel() {
    await this.model.load("/models");
    console.log("FaceDetectionNet Model loaded:" + this.algorithmType);
    this.detectorReady = true;
  }

  async detectFaces(
    media,
    {
      withAllFaces = false,
      withFaceLandmarks = false,
      withFaceDescriptor = false
    } = {}
  ) {
    // console.log("detectFaces, withAllFaces=" + withAllFaces);

    const result = withAllFaces
      ? await faceapi
          .detectAllFaces(media, this.options)
          .withFaceLandmarks()
          .withFaceDescriptors()
      : await faceapi
          .detectSingleFace(media, this.options)
          .withFaceLandmarks()
          .withFaceDescriptor();

    const resultArray =
      result == undefined ? [] : Array.isArray(result) ? result : [result];

    return resultArray;
  }

  saveDetector(name, faceDescriptor) {
    const body = {
      details: {
        name
      },
      faceDescriptor
    };

    const options = {
      method: "post",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(body)
    };

    fetch(this.dbUrl, options)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors(
          name,
          [faceDescriptor]
        );
        this.labeledFaceDescriptors.push(labeledFaceDescriptors);
        this.knownFaces.set(data.key, labeledFaceDescriptors);
      })
      .catch(err => {
        console.error("Request failed", err);
      });
  }
}

class FaceMgnt {
  constructor() {
    this.faceDetectionOptions = [
      {
        label: "None",
        value: "None"
      },
      {
        label: "ssd_mobilenetv1",
        value: "ssd_mobilenetv1"
      },
      {
        label: "tiny_face_detector",
        value: "tiny_face_detector"
      },
      {
        label: "mtcnn",
        value: "mtcnn"
      }
    ];
    this.selectedDetector = SSD_MOBILENETV1;
    // this.selectedDetector = MTCNN;
    this.faceDetectors = new Map();
    this.minConfidence = 0.5;
    this.inputSize = 512;
    this.scoreThreshold = 0.5;
    this.minFaceSize = 200;

    this.faceDetectors.set(
      SSD_MOBILENETV1,
      new FaceDetector(SSD_MOBILENETV1, {
        minConfidence: this.minConfidence
      })
    );
    this.faceDetectors.set(
      TINY_FACE_DETECTOR,
      new FaceDetector(TINY_FACE_DETECTOR, {
        inputSize: this.inputSize,
        scoreThreshold: this.scoreThreshold
      })
    );
    this.faceDetectors.set(
      MTCNN,
      new FaceDetector(MTCNN, {
        minFaceSize: this.minFaceSize
      })
    );
  }
  async loadModels() {
    console.log("before loadFaceLandmarkModel loaded");
    await faceapi.loadFaceLandmarkModel("/models");
    console.log("loadFaceLandmarkModel loaded");
    console.log("before loadFaceRecognitionModel loaded");
    await faceapi.loadFaceRecognitionModel("/models");
    console.log("loadFaceRecognitionModel loaded");

    for (var [key, faceDetector] of this.faceDetectors) {
      console.log(faceDetector);
      faceDetector.loadModel();
    }
  }
  getFaceDetector(algorithmType) {
    return this.faceDetectors.get(algorithmType);
  }
  getDefaultFaceDetector() {
    return this.faceDetectors.get(this.selectedDetector);
  }
  getFaceAlgorithmTypes() {
    return faceAlgorithmTypes;
  }

  saveLabeledFaces(labeledFaces) {
    console.log("saveLabeledFaces: ");

    const faceDetector = this.getDefaultFaceDetector();
    labeledFaces.map(face => {
      if (face.name) {
        faceDetector.saveDetector(face.name, face.faceDescriptor);
      }
    });
  }
}

const faceMgnt = new FaceMgnt();

export default faceMgnt;
