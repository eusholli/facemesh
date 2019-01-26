<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col">
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">MobiledgeX</a>
            <button
              class="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto">
                <router-link to="/" tag="li" class="nav-item" active-class="active" exact>
                  <a class="nav-link">Home</a>
                </router-link>
                <router-link to="/webcam" tag="li" class="nav-item" active-class="active">
                  <a class="nav-link">WebCam</a>
                </router-link>
                <router-link to="/facetraining" tag="li" class="nav-item" active-class="active">
                  <a class="nav-link">Face Training</a>
                </router-link>
                <router-link to="/about" tag="li" class="nav-item" active-class="active">
                  <a class="nav-link">About</a>
                </router-link>
              </ul>
            </div>
          </nav>

          <div class="jumbotron text-center" style="margin-bottom:0">
            <h1>Face Mesh</h1>
          </div>

          <router-view :faceMgmt="faceMgmt"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";
import faceMgmt from "./FaceMgmt.js";

export default {
  name: "App",

  data: function() {
    return {
      faceMgmt
    };
  },
  async mounted() {
    const self = this;
    console.log(this.faceMgmt);
    this.faceMgmt.loadModels();
  }
};
</script>

<style>
</style>
