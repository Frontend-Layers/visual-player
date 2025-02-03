import decodeUrl from './utils.js';
import html from 'root/dist/template.html';

export default function initElements($) {
  const template = decodeUrl(html, 'html');

  const tmpHTML = document.createElement('div');
  tmpHTML.innerHTML = template;
  const tmpBody = tmpHTML.querySelector('body');
  let contentHTML = '';

  if (tmpBody) {
    contentHTML = tmpBody.innerHTML;
  }

  $.shadow.innerHTML += contentHTML || template;

  // Set up main container
  $.container = $.shadow.querySelector('.container');

  // Create controls section
  $.controls = $.shadow.querySelector('.controls');

  // Initialize play button with SVG icon
  $.playButton = $.shadow.querySelector('.play-button');

  // Create custom volume slider structure
  $.volumeSlider = $.shadow.querySelector('.volume-slider');
  $.volumeTrack = $.shadow.querySelector('.volume-track');
  $.volumeFill = $.shadow.querySelector('.volume-fill');
  $.volumeHandle = $.shadow.querySelector('.volume-handle');
  $.volumeDisplay = $.shadow.querySelector('.volume-display');
  $.volumeDisplay.textContent = `${Math.round($.audio.volume * 100)}%`;

  // Create progress container and bar
  $.progressContainer = $.shadow.querySelector('.progress-container');
  $.progressBar = $.shadow.querySelector('.progress-bar');

  // Create time display
  $.timeDisplay = $.shadow.querySelector('.time-display');
}
