<template>
  <div>
    <div class="row">
      <div class="col">
        <h1>Learn Faces</h1>
      </div>
    </div>

    <template v-if="cameras.length > 0">
      <div class="form-group row">
        <label class="col-sm-4 col-form-label">Select Camera</label>
        <div class="col">
          <select
            class="form-control"
            id="selectCamera"
            @change="chooseCamera()"
            v-model="selectedCamera"
          >
            <template v-for="(camera, index) in cameras">
              <option :key="index" :value="camera.value">{{camera.label}}</option>
            </template>
          </select>
        </div>
      </div>

      <div v-show="selectedCamera != 'None'">
        <div class="row">
          <div class="col">
            <div id="camera">
              <video
                ref="inputVideo"
                @pause="onPause()"
                @play="onPlay()"
                id="inputVideo"
                autoplay
                muted
              ></video>
              <canvas ref="overlay" id="overlay"/>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Face Detection</h2>
          </div>
        </div>
        <div class="row">
          <div class="col-7">
            <div class="form-group row">
              <label for="processingTime" class="col col-form-label">Processing Time (ms)</label>
              <div class="col-4">
                <input
                  type="text"
                  readonly
                  class="form-control-plaintext form-control"
                  id="processingTime"
                  v-model="processingTime"
                >
              </div>
            </div>
          </div>
          <div class="col">
            <div class="form-group row">
              <label for="fps" class="col col-form-label">FPS</label>
              <div class="col-5">
                <input
                  type="text"
                  readonly
                  class="form-control-plaintext form-control"
                  id="fps"
                  v-model="fps"
                >
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="form-group row">
              <label class="col-sm-4 col-form-label">Select Algorithm</label>
              <div class="col">
                <select
                  id="faceDetection"
                  @change="changeFaceDetection()"
                  class="form-control input-sm"
                  v-model="selectedFaceDetector"
                >
                  <template v-for="(option, index) in faceDetectionOptions">
                    <option :key="index" :value="option.value">{{ option.label }}</option>
                  </template>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="form-group">
              <label for="withBoxes">
                <input type="checkbox" id="withBoxes" v-model="withBoxes"> Boxes
              </label>
            </div>
          </div>
          <div class="col">
            <div class="form-group">
              <label for="withFaceLandmarks">
                <input type="checkbox" id="withFaceLandmarks" v-model="withFaceLandmarks"> Face Marks
              </label>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="form-group">
              <label for="withRedaction">
                <input type="checkbox" id="withRedaction" v-model="withRedaction"> Redaction
              </label>
            </div>
          </div>
          <div class="col">
            <div class="form-group">
              <label for="withAllFaces">
                <input type="checkbox" id="withAllFaces" v-model="withAllFaces"> All Faces
              </label>
            </div>
          </div>
        </div>

        <div class="row">
          <div v-if="selectedFaceDetector != 'None'">
            <div class="col">
              <h2>Advanced Settings</h2>
            </div>
            <div class="col">
              <div v-if="selectedFaceDetector === 'ssd_mobilenetv1'">
                Min Confidence: {{minConfidence}}
                <button
                  class="btn btn-primary"
                  @click="dec('minConfidence',0.1,0)"
                >-</button>
                <button class="btn btn-primary" @click="inc('minConfidence',0.1,1)">+</button>
              </div>
              <div v-if="selectedFaceDetector === 'tiny_face_detector'">
                <div class="form-group">
                  <label>Input Size</label>
                  <select id="inputSize" @change="changeResolution()" v-model.number="inputSize">
                    <option value="128">128 x 128</option>
                    <option value="160">160 x 160</option>
                    <option value="224">224 x 224</option>
                    <option value="320">320 x 320</option>
                    <option value="416">416 x 416</option>
                    <option value="512">512 x 512</option>
                    <option value="608">608 x 608</option>
                  </select>
                </div>
                <div class="col">
                  Score Threshold: {{scoreThreshold}}
                  <button
                    class="btn btn-primary"
                    @click="dec('scoreThreshold',0.1,0)"
                  >-</button>
                  <button class="btn btn-primary" @click="inc('scoreThreshold',0.1,1)">+</button>
                </div>
              </div>
              <div v-if="selectedFaceDetector === 'mtcnn'">
                Min Face Size: {{minFaceSize}}
                <button
                  class="btn btn-primary"
                  @click="dec('minFaceSize',20,50)"
                >-</button>
                <button class="btn btn-primary" @click="inc('minFaceSize',20,300)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
function stopVideo(self) {
  self.currentStream.getTracks().forEach(track => {
    track.stop();
  });
  if (self.playTimer) {
    clearTimeout(self.playTimer);
    self.playTimer = undefined;
  }
  const video = self.$refs.inputVideo;
  if (video) {
    video.srcObject = undefined;
  }
}

const SSD_MOBILENETV1 = "ssd_mobilenetv1";
const TINY_FACE_DETECTOR = "tiny_face_detector";
const MTCNN = "mtcnn";

export default {
  name: "FaceTraining",

  data: function() {
    return {
      faceDetectionOptions: [
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
      ],
      cameras: [
        {
          label: "None",
          value: "None"
        }
      ],
      currentStream: undefined,
      playTimer: undefined,
      video: undefined,
      forwardTimes: [],
      withBoxes: true,
      withFaceLandmarks: false,
      withAllFaces: false,
      withRedaction: false,
      processingTime: 0,
      fps: 0,

      selectedCamera: "None",
      selectedFaceDetector: "None",
      modelLoaded: false,
      faceDetectorSsd: undefined,
      faceDetectorTiny: undefined,
      faceDetectorMtcnn: undefined,

      // SSD_MOBILENETV1
      minConfidence: 0.5,

      // TINY_FACE_DETECTOR
      inputSize: 512,
      scoreThreshold: 0.5,

      // MTCNN
      minFaceSize: 50
    };
  },
  async mounted() {
    let count = 1;
    const self = this;
    navigator.mediaDevices.enumerateDevices().then(function(mediaDevices) {
      mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === "videoinput") {
          self.cameras.push({
            label: mediaDevice.label || `Camera ${count++}`,
            value: mediaDevice.deviceId
          });
        }
      });
    });
    console.log("before loadFaceLandmarkModel loaded");
    await faceapi.loadFaceLandmarkModel("/models");
    console.log("loadFaceLandmarkModel loaded");
  },
  methods: {
    inc(property, amt, max) {
      this[property] = Math.min(faceapi.round(this[property] + amt), max);
    },
    dec(property, amt, min) {
      this[property] = Math.max(faceapi.round(this[property] - amt), min);
    },
    chooseCamera: function() {
      console.log(this.selectedCamera);

      if (typeof this.currentStream !== "undefined") {
        stopVideo(this);
      }
      if (this.selectedCamera === "None") {
        return;
      }

      const self = this;

      const videoConstraints = {};
      if (this.selectedCamera === "") {
        videoConstraints.facingMode = "environment";
      } else {
        videoConstraints.deviceId = { exact: this.selectedCamera };
      }
      const constraints = {
        video: videoConstraints,
        audio: false
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          self.currentStream = stream;
          self.$refs.inputVideo.srcObject = stream;
        })
        .catch(error => {
          console.error(error);
        });
    },
    changeResolution: function() {
      console.log(this.inputSize);
    },

    getCurrentFaceDetectionNet: function() {
      console.log("getCurrentFaceDetectionNet: " + this.selectedFaceDetector);
      if (this.selectedFaceDetector === SSD_MOBILENETV1) {
        return faceapi.nets.ssdMobilenetv1;
      }
      if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
        return faceapi.nets.tinyFaceDetector;
      }
      if (this.selectedFaceDetector === MTCNN) {
        return faceapi.nets.mtcnn;
      }
      return null;
    },

    isFaceDetectionModelLoaded: function() {
      return !!this.getCurrentFaceDetectionNet().params;
    },

    changeFaceDetection: async function() {
      console.log(this.selectedFaceDetector);
      this.modelLoaded = false;

      this.setFaceDetectorOptions(
        this.minConfidence,
        this.inputSize,
        this.scoreThreshold,
        this.minFaceSize
      );
      await this.getCurrentFaceDetectionNet().load("/models");
      console.log("FaceDetectionNet Model loaded");
      this.modelLoaded = true;
    },

    updateTimeStats: function(timeInMs) {
      this.forwardTimes = [timeInMs].concat(this.forwardTimes).slice(0, 30);
      const avgTimeInMs =
        this.forwardTimes.reduce((total, t) => total + t) /
        this.forwardTimes.length;
      this.processingTime = `${Math.round(avgTimeInMs)}`;
      this.fps = `${faceapi.round(1000 / avgTimeInMs)}`;
    },

    setFaceDetectorOptions: function(
      minConfidence,
      inputSize,
      scoreThreshold,
      minFaceSize
    ) {
      if (this.selectedFaceDetector === SSD_MOBILENETV1) {
        return (this.faceDetectorSsd = new faceapi.SsdMobilenetv1Options({
          minConfidence
        }));
      } else if (this.selectedFaceDetector === TINY_FACE_DETECTOR) {
        return (this.faceDetectorTiny = new faceapi.TinyFaceDetectorOptions({
          inputSize,
          scoreThreshold
        }));
      } else {
        return (this.faceDetectorMtcnn = new faceapi.MtcnnOptions({
          minFaceSize
        }));
      }
    },

    getFaceDetectorOptions: function(
      minConfidence,
      inputSize,
      scoreThreshold,
      minFaceSize
    ) {
      return this.selectedFaceDetector === SSD_MOBILENETV1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : this.selectedFaceDetector === TINY_FACE_DETECTOR
        ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
        : new faceapi.MtcnnOptions({ minFaceSize });
    },

    onPause: function() {
      console.log("onPause");
      if (typeof this.currentStream !== "undefined") {
        stopVideo(this);
      }
    },

    onPlay: async function() {
      // console.log("onPlay");
      const videoEl = this.$refs.inputVideo;

      // race situation between changing route and timer?
      if (!videoEl) {
        console.log("onPlay pause race error?");
        return;
      }

      if (videoEl.paused || videoEl.ended || !this.modelLoaded)
        return (this.playTimer = setTimeout(() => this.onPlay()));

      const options = this.getFaceDetectorOptions(
        this.minConfidence,
        this.inputSize,
        this.scoreThreshold,
        this.minFaceSize
      );

      const ts = Date.now();
      let faceDetectionTask = null;
      if (this.withAllFaces) {
        faceDetectionTask = faceapi.detectAllFaces(videoEl, options);
      } else {
        faceDetectionTask = faceapi.detectSingleFace(videoEl, options);
      }

      const result = this.withFaceLandmarks
        ? await faceDetectionTask.withFaceLandmarks()
        : await faceDetectionTask;

      const resultArray = Array.isArray(result) ? result : [result];

      const drawFunction = this.withFaceLandmarks
        ? drawLandmarks
        : drawDetections;

      if (result) {
        drawFunction(
          videoEl,
          this.$refs.overlay,
          resultArray,
          this.withBoxes,
          this.withRedaction
        );
      }

      this.updateTimeStats(Date.now() - ts);

      this.playTimer = setTimeout(() => this.onPlay());
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#camera {
  margin: 20px auto;
  position: relative;
}

#inputVideo {
  width: 100%;
  height: auto;
  top: 0;
  left: 0;
}

#overlay {
  width: 100%;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}
</style> 
