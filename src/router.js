import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Webcam from "./views/WebCam.vue";
import FaceTraining from "./views/FaceTraining.vue";
import About from "./views/About.vue";

Vue.use(Router);

export default new Router({
  mode: "history",

  routes: [
    {
      path: "/public"
    },
    {
      path: "/",
      name: "faceTraining",
      component: FaceTraining
      // name: "home",
      // component: Home
    },
    {
      path: "/webcam",
      name: "webcam",
      component: Webcam
    },
    {
      path: "/facetraining",
      name: "faceTraining",
      component: FaceTraining
    },
    {
      path: "/about",
      name: "about",
      component: About
    },
    { path: "*", redirect: "/" }
  ]
});
