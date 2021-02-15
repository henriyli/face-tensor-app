export const videoIsNotLoaded = (videoElement) => {
  return videoElement.videoHeight === 0;
};

export const scaleVideoToWindow = () => {
  const videoElement = document.querySelector('#video');
  const previousWidth = videoElement.videoWidth;
  const previousHeight = videoElement.videoHeight;
  const videoWidth = document.body.clientWidth;
  const videoHeight = Math.round(videoWidth * 0.75);
  if (Math.abs(previousWidth - videoHeight) > 25) {
    videoElement.width = videoWidth;
  }
  if (Math.abs(previousHeight - videoHeight) > 50) {
    videoElement.height = videoHeight;
  }
};

export const alignEmojisToKeypoints = (pose) => {
  const leftEye = pose.keypoints.find((point) => point.part === 'leftEye');
  const rightEye = pose.keypoints.find((point) => point.part === 'rightEye');
  const leftElement = document.querySelector('#left');
  const rightElement = document.querySelector('#right');
  const heightOffset = document.body.clientWidth > 700 ? 20 : 50;
  if (
    leftElement.style.display === 'none' ||
    rightElement.style.display === 'none'
  ) {
    leftElement.style.display = 'inline';
    rightElement.style.display = 'inline';
  }
  if (leftEye && leftEye.position && leftEye.position.x && leftEye.position.y) {
    const leftX = Math.round(leftEye.position.x - 20);
    const leftY = Math.round(leftEye.position.y - heightOffset);
    leftElement.style.left = `${leftX}px`;
    leftElement.style.top = `${leftY}px`;
  }
  if (
    rightEye &&
    rightEye.position &&
    rightEye.position.x &&
    rightEye.position.y
  ) {
    const rightX = Math.round(rightEye.position.x - 40);
    const rightY = Math.round(rightEye.position.y - heightOffset);
    rightElement.style.left = `${rightX}px`;
    rightElement.style.top = `${rightY}px`;
  }
};
