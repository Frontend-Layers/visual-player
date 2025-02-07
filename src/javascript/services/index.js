/**
 * HTML / CSS resources
 */
import initStyles from './styles';
import initElements from './elements';
import initAudio from './audio';
import initVisualizer from './visualizer';
import initPlugins from './plugins';

export default function initServices($) {
  initPlugins($);
  initAudio($);
  initStyles($);
  initElements($);
  initVisualizer($);
}
