<template>
  <div class="content">
    <div id="errorMsg"></div>
    <video id="video" position="relative" width="100%" height="100%" autoplay></video>
    <span class="heart" id="left" display=none>💚</span>
    <span class="heart" id="right" display=none>💚</span>
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

console.log('user agent', navigator.userAgent)
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  console.log('Using tensorflow with cpu backend')
  tf.setBackend('cpu')
} else {
  console.log('Using tensorflow with webgl backend')
  tf.setBackend('webgl')
}
    
const scaleVideoToWindow = () => {
  const videoElement = document.querySelector('#video')
  const previousWidth = videoElement.videoWidth
  const previousHeight = videoElement.videoHeight 
  const videoWidth = document.body.clientWidth
  const videoHeight = Math.round(videoWidth * 0.75)
  if (Math.abs(previousWidth - videoHeight) > 25) {
    videoElement.width = videoWidth 
  }
  if (Math.abs(previousHeight - videoHeight) > 50) {
    videoElement.height = videoHeight
  }
}

const videoIsNotLoaded = (videoElement) => {
  return videoElement.videoHeight === 0
}

const alignEmojisToKeypoints = (pose) => {
  const leftEye = pose.keypoints.find(point => point.part === 'leftEye')
  const rightEye = pose.keypoints.find(point => point.part === 'rightEye')
  const leftElement = document.querySelector('#left')
  const rightElement = document.querySelector('#right')
  if (leftElement.style.display === 'none' || rightElement.style.display === 'none') {
    leftElement.style.display = 'inline'
    rightElement.style.display = 'inline'
  }
  if (leftEye && leftEye.position && leftEye.position.x && leftEye.position.y) {
    const leftX = leftEye.position.x - 20
    const leftY  = leftEye.position.y - 20
    leftElement.style.left = `${leftX}px`
    leftElement.style.top = `${leftY}px`
  }
  if (rightEye && rightEye.position && rightEye.position.x && rightEye.position.y) {
    const rightX = rightEye.position.x - 40
    const rightY = rightEye.position.y - 20
    rightElement.style.left = `${rightX}px`
    rightElement.style.top = `${rightY}px`
  }
}

navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Using video device: ' + videoTracks[0].label);
  window.stream = stream; // make variable available to browser console
  document.querySelector('video').srcObject = stream;

  const runPosenet = async () => {
    let videoHeight = document.body.clientHeight
    let videoWidth = document.body.clientWidth
    const videoElement = document.querySelector('#video')
    const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: videoWidth, height: videoHeight },
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
    }, 100);
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
    font-size: 100px;
}
</style>
