/**
 * HTML / CSS resources
 */
import initThemes from './themes';
import initElements from './elements';
import initAudio from './audio';
import initVisualizer from './visualizer';
import initPlugins from './plugins';

export default function initServices($) {
  initPlugins($);
  initAudio($);
  initThemes($);
  initElements($);
  initVisualizer($);
}
