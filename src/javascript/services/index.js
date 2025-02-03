/**
 * HTML / CSS resources
 */
import initStyles from './styles.js';
import initElements from './elements.js';
import initAudio from './audio.js';
import initVisualizer from './visualizer.js';

export default function initServices($) {
  initAudio($);
  initStyles($);
  initElements($);
  initVisualizer($);
}
