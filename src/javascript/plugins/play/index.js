import tpl from './templates/btn-play.html';
import css from './styles/btn-play.css';

export default function ButtonPlay(options = {}) {
  let cfg = {
  };

  cfg = { ...cfg, ...options };

  return {
    id: 'play',
    run: function($, bFirst) {
      $.addStyles(css);
      $.addTpl(tpl, {
        priority: 'none',
        selector: '.container .controls',
        parent: 'existed'
      });

      // Initialize play button with SVG icon
      $.playButton = $.shadow.querySelector('.play-button');

      $.playButton.addEventListener('click', () => togglePlay());

      $.audio.addEventListener('ended', () => {
        $.playButton.innerHTML = createPlayIcon();
      });

      $.audio.addEventListener('pause', () => {
        $.playButton.innerHTML = createPlayIcon();
      });

      /**
       * Toggle play/pause state
       */
      function togglePlay() {
        if ($.audio.paused) {
          $.audio.play();
          $.playButton.innerHTML = createPauseIcon();
        } else {
          $.audio.pause();
          $.playButton.innerHTML = createPlayIcon();
        }
      }

      /**
       * Create play button SVG icon
       */
      function createPlayIcon() {
        return `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      }

      /**
       * Create pause button SVG icon
       */
      function createPauseIcon() {
        return `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      }

    }
  };
}
