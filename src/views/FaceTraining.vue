<template>
  <div>
    <div class="row">
      <div class="col">
        <h1>Learn Faces</h1>
      </div>
    </div>

    <div v-show="status === 'camera'">
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
                  loop
                ></video>
                <canvas ref="overlay" id="overlay"/>
              </div>
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

          <div v-if="learnButtonActive === true" class="row">
            <div class="col">
              <button
                type="button"
                class="btn btn-primary"
                @click="captureWebCamImage()"
              >Learn Captured Faces</button>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="form-group">
                <label for="withEdgeMesh">
                  <input type="checkbox" id="withEdgeMesh" v-model="withEdgeMesh"> Edge Mesh Active
                </label>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <h2>Face Detection</h2>
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
                    <template v-for="(option, index) in faceMgmt.faceDetectionOptions">
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
                  Min Confidence: {{faceMgmt.minConfidence}}
                  <button
                    class="btn btn-primary"
                    @click="dec('minConfidence',0.1,0)"
                  >-</button>
                  <button class="btn btn-primary" @click="inc('minConfidence',0.1,0.9)">+</button>
                </div>
                <div v-if="selectedFaceDetector === 'tiny_face_detector'">
                  <div class="form-group">
                    <label>Input Size</label>
                    <select
                      id="inputSize"
                      @change="changeAdvancedSettings()"
                      v-model.number="faceMgmt.inputSize"
                    >
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
                    Score Threshold: {{faceMgmt.scoreThreshold}}
                    <button
                      class="btn btn-primary"
                      @click="dec('scoreThreshold',0.1,0)"
                    >-</button>
                    <button class="btn btn-primary" @click="inc('scoreThreshold',0.1,0.9)">+</button>
                  </div>
                </div>
                <div v-if="selectedFaceDetector === 'mtcnn'">
                  Min Face Size: {{faceMgmt.minFaceSize}}
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

    <div v-if="status === 'processImage'">
      <div class="row">
        <div class="col">
          <h3>Captured Image</h3>
          <img :src="capturedImage">
        </div>
      </div>

      <h3>Captured Faces</h3>
      <form>
        <div id="trainingFaces" class="row">
          <div class="col-3 form-group">
            <template v-for="(face, index) in capturedFaces">
              <div :key="index">
                <img :id="'face-image-' + index" :src="face.imageUrl">
                <div>
                  <label :for="'face-name-' + index">Name</label>
                  <input
                    type="text"
                    :id="'face-name-' + index"
                    class="form-control"
                    v-model="face.name"
                  >
                </div>
                <div class="form-group">
                  <label :for="'face-consent-' + index">
                    <input type="checkbox" :id="'face-consent-' + index" v-model="face.consent"> Consent
                  </label>
                </div>
                <div>
                  <country-select v-model="face.country" :country="face.country" topCountry="US"/>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <button type="button" class="btn btn-primary" @click="storeFaces()">Store Faces</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Drawing from "../Drawing.js";

function stopVideo(self) {
  if (self.playTimer) {
    clearTimeout(self.playTimer);
    self.playTimer = undefined;
  }

  if (self.currentStream) {
    self.currentStream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const video = self.$refs.inputVideo;
  if (video) {
    video.srcObject = undefined;
    video.src = undefined;
  }
}

export default {
  name: "FaceTraining",

  props: {
    faceMgmt: Object
  },
  data: function() {
    return {
      drawing: undefined,
      cameras: [
        {
          label: "None",
          value: "None"
        },
        {
          label: "Simulate",
          value: "Simulate"
        }
      ],
      learnButtonActive: false,
      status: "camera",
      capturedImage: undefined,
      capturedFaces: [],
      labeledFaceDescriptors: [],
      currentStream: undefined,
      playTimer: undefined,
      video: undefined,
      withBoxes: true,
      withFaceLandmarks: true,
      forwardTimes: [],
      withAllFaces: false,
      withRedaction: false,
      processingTime: 0,
      fps: 0,

      selectedCamera: "None",
      selectedFaceDetector: "None",
      currentFaceDetector: undefined,

      withEdgeMesh: true
    };
  },
  mounted() {
    const videoEl = this.$refs.inputVideo;
    const canvasEl = this.$refs.overlay;
    this.drawing = new Drawing(videoEl, canvasEl);
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
  },
  methods: {
    inc(property, amt, max) {
      this.faceMgmt[property] = Math.min(
        faceapi.round(this.faceMgmt[property] + amt),
        max
      );
      this.currentFaceDetector = this.faceMgmt.updateModel(
        this.selectedFaceDetector
      );
    },
    dec(property, amt, min) {
      this.faceMgmt[property] = Math.max(
        faceapi.round(this.faceMgmt[property] - amt),
        min
      );
      this.currentFaceDetector = this.faceMgmt.updateModel(
        this.selectedFaceDetector
      );
    },
    changeEdgeMeshStatus: function() {
      if (this.withEdgeMesh) {
        alert("To reactivate Edge Mesh please reload the page");
      } else {
        navigator.serviceWorker
          .getRegistrations()
          .then(function(registrations) {
            for (let registration of registrations) {
              registration
                .unregister()
                .then(function() {
                  return self.clients.matchAll();
                })
                .then(function(clients) {
                  clients.forEach(client => {
                    if (client.url && "navigate" in client) {
                      client.navigate(client.url);
                    }
                  });
                });
            }
          });
      }
    },

    updateTimeStats: function(timeInMs) {
      this.forwardTimes = [timeInMs].concat(this.forwardTimes).slice(0, 30);
      const avgTimeInMs =
        this.forwardTimes.reduce((total, t) => total + t) /
        this.forwardTimes.length;
      this.processingTime = `${Math.round(avgTimeInMs)}`;
      this.fps = `${faceapi.round(1000 / avgTimeInMs)}`;
    },
    changeFaceDetection: async function() {
      console.log(this.selectedFaceDetector);
      if (this.selectedFaceDetector === "None") {
        this.currentFaceDetector = undefined;
        this.learnButtonActive = false;
        const overlay = this.$refs.overlay;
        overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
      } else {
        this.currentFaceDetector = this.faceMgmt.getFaceDetector(
          this.selectedFaceDetector
        );
        this.learnButtonActive = true;
      }
    },
    changeAdvancedSettings: function() {
      console.log("changeAdvancedSettings");
      this.currentFaceDetector = this.faceMgmt.updateModel(
        this.selectedFaceDetector
      );
    },

    chooseCamera: function() {
      console.log(this.selectedCamera);

      if (typeof this.currentStream !== "undefined") {
        stopVideo(this);
      }

      if (this.selectedCamera === "None") {
        return;
      } else if (this.selectedCamera === "Simulate") {
        this.$refs.inputVideo.src = "/Friends.mp4";
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

    imageUpload: async function(event) {
      console.log("captureWebCamImage");
      const imgFile = this.$refs.imageUpload.files[0];
      const img = await faceapi.bufferToImage(imgFile);
      const imgUrl = img.currentSrc;
      this.processImage(imgUrl);
    },

    captureWebCamImage: function() {
      console.log("captureWebCamImage");

      const overlay = this.$refs.overlay;
      const videoEl = this.$refs.inputVideo;

      const context = overlay
        .getContext("2d")
        .drawImage(videoEl, 0, 0, overlay.width, overlay.height);

      const imgUrl = overlay.toDataURL("image/png");

      this.processImage(imgUrl);
    },

    processImage: async function(capturedImageUrl) {
      console.log("processImage");

      this.capturedImage = capturedImageUrl;
      const self = this;

      console.log("before fetchImage");
      const img = await faceapi.fetchImage(capturedImageUrl);
      console.log("after fetchImage");

      const faceDetector = this.faceMgmt.getDefaultFaceDetector();

      console.log("before faceDetector.detectFaces");
      const fullFaceDescriptions = await faceDetector.detectFaces(img, {
        withAllFaces: true,
        withFaceLandmarks: true,
        withFaceDescriptor: true
      });
      console.log("after faceDetector.detectFaces...");
      console.log(fullFaceDescriptions);

      if (!fullFaceDescriptions) {
        console.log(`no faces detected in training image`);
        return;
      }

      const detectionsArray = fullFaceDescriptions.map(async ffd => {
        const faceImage = await faceapi.extractFaces(img, [ffd.detection]);

        self.capturedFaces.push({
          imageUrl: faceImage[0].toDataURL("image/png"),
          name: "",
          consent: false,
          country: "",
          faceDescriptor: ffd.descriptor
        });
      });

      this.status = "processImage";
      stopVideo(this);
      this.selectedCamera = "None";
    },

    storeFaces: function() {
      console.log("storeFaces");

      this.faceMgmt.saveLabeledFaces(this.capturedFaces);
      this.status = "camera";
      this.capturedFaces.length = 0;
    },

    onPause: function() {
      console.log("onPause");
      if (typeof this.currentStream !== "undefined") {
        stopVideo(this);
      }
    },

    onPlay: async function() {
      const ts = Date.now();

      const videoEl = this.$refs.inputVideo;
      const overlay = this.$refs.overlay;
      const self = this;

      // race situation between changing route and timer?
      if (!videoEl) {
        console.log("onPlay pause race error?");
        return;
      }

      if (videoEl.paused || videoEl.ended) {
        return;
      }
      if (!this.currentFaceDetector)
        return (this.playTimer = setTimeout(() => this.onPlay()));

      const faceDetector = this.currentFaceDetector;

      const resultArray = await faceDetector.detectFaces(videoEl, {
        withAllFaces: this.withAllFaces,
        withFaceLandmarks: true,
        withFaceDescriptor: true
      });

      if (!this.currentFaceDetector)
        return (this.playTimer = setTimeout(() => this.onPlay()));

      if (resultArray) {
        const labeledFaceDescriptors = this.faceMgmt.labeledFaceDescriptors;
        if (labeledFaceDescriptors.length > 0) {
          this.drawing.draw(
            resultArray,
            this.withBoxes,
            this.withRedaction,
            labeledFaceDescriptors,
            this.withFaceLandmarks,
            this.faceMgmt.knownFaces
          );
        } else {
          this.drawing.draw(
            resultArray,
            this.withBoxes,
            this.withRedaction,
            undefined,
            this.withFaceLandmarks
          );
        }
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
