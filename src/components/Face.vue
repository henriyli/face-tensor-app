<template>
  <div class="content">
    <div id="errorMsg"></div>
    <video id="video" position="relative" width="640" height="480" autoplay></video>
    <canvas id="canvas" width="640" height="480"></canvas>
    <span class="heart" id="left">💚</span>
    <span class="heart" id="right">💚</span>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

export default {
  name: 'FaceTensor',
  props: {
    msg: String
  }
}
// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

tf.setBackend('webgl')

navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.onremovetrack = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  document.querySelector('video').srcObject = stream;

  const runPosenet = async () => {
    const videoHeight = document.body.clientHeight
    const videoWidth = document.body.clientWidth
    const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: videoWidth, height: videoHeight },
      multiplier: 0.75
    });
    const videoElement = document.querySelector('#video')
    setInterval(async () => {
      if (document.querySelector('#video').videoHeight === 0) {
        return
      }
      const pose = await net.estimateSinglePose(videoElement, {
        flipHorizontal: false
      });
      if (pose) {
        const leftEye = pose.keypoints.find(point => point.part === 'leftEye')
        const rightEye = pose.keypoints.find(point => point.part === 'rightEye')
        if (leftEye && leftEye.position) {
          const leftX = leftEye.position.x - 20
          const leftY  = leftEye.position.y - 20
          document.querySelector('#left').style.left = `${leftX}px`
          document.querySelector('#left').style.top = `${leftY}px`
        }
        if (rightEye && rightEye.position) {
          const rightX = rightEye.position.x - 20
          const rightY = rightEye.position.y - 20
          document.querySelector('#right').style.left = `${rightX}px`
          document.querySelector('#right').style.top = `${rightY}px`
        }
      }
    }, 1000);
  };
  console.log('yolo')
  runPosenet()
})
.catch(function(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.height.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
});

function errorMsg(msg, error) {
  document.querySelector('#errorMsg').innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.log(msg, error)
    console.error(error);
  }
}
</script>

<style scoped>
.heart {
    position: absolute;
    display: inline;
    text-align: left;
    font-size: 60px;
}
</style>
