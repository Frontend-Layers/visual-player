export default function initAudio($) {
  $.audio = document.createElement('audio'); // new Audio();

  $.audio.stop = function() {
    this.pause();
    this.currentTime = 0;
  };

  for (let attr of $.attributes) {
    $.audio.setAttribute(attr.name, attr.value);
  }

  // Update play button icon when audio is ended
  $.audio.addEventListener('ended', () => {
    $.audio.currentTime = 0;
  });

  // Create observer for theme attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'single-player') {
        //
      }
    });
  });

  observer.observe($, {
    attributes: true,
    attributeFilter: ['single-player']
  });

  // Apply Single Player Mode
  if ($.hasAttribute('single-player')) {

    $.audio.addEventListener('play', () => {
      const elVisualPlayers = document.querySelectorAll('visual-player');

      if (elVisualPlayers) {
        elVisualPlayers.forEach(element => {
          if (element.audio !== $.audio && !element.paused) {
            element.audio.stop();
          }
        });
      }

    });

  }
};
