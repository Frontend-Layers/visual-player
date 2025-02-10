/**
 * Visual Player Web Component
 * ==========================
 *
 * A custom audio player implementation with modern UI and cross-browser support.
 */

import './visual-player';
import play from './plugins/play';
import volume from './plugins/volume';
import progressBar from './plugins/progress-bar';
import visualizer from './plugins/visualizer';

document.addEventListener('DOMContentLoaded', () => {
  const allPlayers = document.querySelectorAll('visual-player');
  allPlayers.forEach(element => {
    element.use([
      play(),
      volume()
    ]);
  });

  const player = document.querySelector('#visualPlayer');
  player.use([
    visualizer(),
    progressBar(),
    volume(
      {
        initialVolume: 0.2,
        volumeLabel: false
      }
    )
  ]);

});
