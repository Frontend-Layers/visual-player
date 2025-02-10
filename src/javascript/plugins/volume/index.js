import tplSlider from './templates/volume-slider.html';
import tplLabel from './templates/volume-label.html';
import css from './styles/volume-slider.css';

export default function VolumeSlider(options = {}) {
  let cfg = {
    initialVolume: 1, // Initial volume level
    selector: '.container .controls', // Where to insert the template
    volumeLabel: true // Show Volume Label
  };

  cfg = { ...cfg, ...options };

  return {
    id: 'volume',
    run: function($, bFirst) {
      let tpl = tplSlider + (cfg.volumeLabel ? tplLabel : '');

      if (bFirst) {
        $.addStyles(css);

        $.addTpl(tpl, {
          priority: 'none',
          selector: '.container .controls'
        });
        setElements();
        setAria();
        setEvents();
      } else {
        tpl = tplSlider + tplLabel;
        $.removeTpl(tpl, {
          selector: '.container .controls'
        });

        tpl = tplSlider + (cfg.volumeLabel ? tplLabel : '');
        $.addTpl(tpl, {
          priority: 'none',
          selector: '.container .controls'
        });

        setElements();
        setAria();
        setEvents();
      }

      changeVolume(cfg.initialVolume);

      function setElements() {
        $.volumeSlider = $.shadow.querySelector('.volume-slider');
        $.volumeTrack = $.shadow.querySelector('.volume-track');
        $.volumeFill = $.shadow.querySelector('.volume-fill');
        $.volumeHandle = $.shadow.querySelector('.volume-handle');
        $.volumeLabel = $.shadow.querySelector('.volume-label');
        if ($.volumeLabel) {
          $.volumeLabel.textContent = `${Math.round($.audio.volume * 100)}%`;
        }
        $.volumeFill.style.width = `${$.audio.volume * 100}%`;
        $.volumeHandle.style.left = `${$.audio.volume * 100}%`;
      }

      function setAria() {
        $.volumeSlider.setAttribute('role', 'slider');
        $.volumeSlider.setAttribute('aria-label', 'Volume');
        $.volumeSlider.setAttribute('aria-valuemin', '0');
        $.volumeSlider.setAttribute('aria-valuemax', '100');
        $.volumeSlider.setAttribute('aria-valuenow', Math.round($.audio.volume * 100));
        $.volumeSlider.setAttribute('tabindex', '0');
      }

      function changeVolume(v) {
        $.audio.volume = Math.max(0, Math.min(v, 1));
        $.volumeFill.style.width = `${v * 100}%`;
        $.volumeHandle.style.left = `${v * 100}%`;
        $.volumeSlider.setAttribute('aria-valuenow', Math.round(v * 100));
      };

      function setEvents() {
        $.audio.addEventListener('volumechange', () => {
          if ($.volumeLabel) {
            $.volumeLabel.textContent = `${Math.round($.audio.volume * 100)}%`;
          }
        });

        let isDragging = false;

        const updateVolume = (clientX) => {
          const rect = $.volumeSlider.getBoundingClientRect();
          const width = rect.width;
          const x = Math.max(0, Math.min(clientX - rect.left, width));
          const newVolume = x / width;
          changeVolume(newVolume);
        };

        const onHandlePointerDown = (e) => {
          e.stopPropagation();
          isDragging = true;
          $.volumeHandle.classList.add('active');
          $.volumeSlider.classList.add('dragging');

          document.addEventListener('pointermove', onPointerMove);
          document.addEventListener('pointerup', onPointerUp);
        };

        const onPointerMove = (e) => {
          if (!isDragging) return;
          e.preventDefault();
          updateVolume(e.clientX);
        };

        const onPointerUp = () => {
          if (!isDragging) return;
          isDragging = false;
          $.volumeHandle.classList.remove('active');
          $.volumeSlider.classList.remove('dragging');

          document.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerup', onPointerUp);
        };

        const onSliderClick = (e) => {
          if (isDragging) return;
          updateVolume(e.clientX);
        };

        $.volumeHandle.addEventListener('pointerdown', onHandlePointerDown);
        $.volumeSlider.addEventListener('click', onSliderClick);

        $.volumeSlider.addEventListener('keydown', (e) => {
          let currentVolume = $.audio.volume;
          const step = 0.1;

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
              currentVolume = Math.min(1, currentVolume + step);
              break;
            case 'ArrowLeft':
            case 'ArrowDown':
              currentVolume = Math.max(0, currentVolume - step);
              break;
            default:
              return;
          }

          $.audio.volume = currentVolume;
          $.volumeFill.style.width = `${currentVolume * 100}%`;
          $.volumeHandle.style.left = `${currentVolume * 100}%`;
        });
      }
    }
  };
}
