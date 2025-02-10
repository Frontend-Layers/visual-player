/**
 * HTML / CSS resources
 */
import initThemes from './themes';
import initElements from './elements';
import initAudio from './audio';
import initPlugins from './plugins';

export default function initServices($) {
  initAudio($);
  initPlugins($);
  initThemes($);
  initElements($);
}
