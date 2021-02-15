<template>
  <div class="content">
    <div id="errorMsg"></div>
    <video id="video" position="relative" width="100%" height="100%" autoplay></video>
    <span class="heart" id="left" display=none>💚</span>
    <span class="heart" id="right" display=none>💚</span>
    <button v-on:click="switchCamera">Switch Camera</button>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import { videoIsNotLoaded, scaleVideoToWindow, alignEmojisToKeypoints  } from '../utils/utils'

export default {
  name: 'FaceTensor',
  methods: {
    switchCamera: async function() {
      window.constraints.facingMode = window.constraints.facingMode === 'user' ? 'environment' : 'user'
      const stream = await navigator.mediaDevices.getUserMedia(window.constraints)
      window.stream = stream
      document.querySelector('video').srcObject = stream;
    }
  }
}
// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true,
  facingMode: 'user'
};

// setting backend based on useragent
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  console.log('Using tensorflow with cpu backend')
  tf.setBackend('cpu')
} else {
  console.log('Using tensorflow with webgl backend')
  tf.setBackend('webgl')
}
    
navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
  window.stream = stream; // make variable available to browser console
  document.querySelector('video').srcObject = stream;

  const runPosenet = async () => {
    let videoHeight = document.body.clientHeight
    let videoWidth = document.body.clientWidth
    const videoElement = document.querySelector('#video')
    const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: videoWidth - 20, height: videoHeight},
      multiplier: 0.75
    });
    setInterval(async () => {
      if (videoIsNotLoaded(videoElement)) { 
        return
      }
      scaleVideoToWindow()
      const pose = await net.estimateSinglePose(videoElement, {
        flipHorizontal: false
      });
      if (pose && pose.keypoints) {
        alignEmojisToKeypoints(pose)
      }
    }, 150);
  };
  runPosenet()
})
.catch(function(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    setErrorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.height.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    setErrorMsg('Permissions have not been granted to use your camera');
  }
  setErrorMsg('Unknown error: ' + error.name, error);
});

function setErrorMsg(msg, error) {
  document.querySelector('#errorMsg').innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.log(msg, error)
  }
}
</script>

<style scoped>
.heart {
    position: absolute;
    display: inline;
    text-align: left;
    font-size: 80px;
}
</style>
