export default function initVisualizer($) {
  const canvas = ($).shadow.querySelector('.visualizer');

  if (canvas) {
    ($).ctx = canvas.getContext('2d');
  }
}
