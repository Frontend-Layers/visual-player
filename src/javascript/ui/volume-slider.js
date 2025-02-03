export default function initVolumeSlider($) {

  setupVolumeSlider();

  $.audio.addEventListener('volumechange', (event) => {
    $.volumeDisplay.textContent = `${Math.round($.audio.volume * 100)}%`;
  });

  /**
   * Initialize volume slider functionality
   * Handles mouse interactions for volume control
   */
  function setupVolumeSlider() {
    let isDragging = false;

    const updateVolume = (clientX) => {
      // Get slider dimensions
      const rect = $.volumeSlider.getBoundingClientRect();
      const width = rect.width;

      // Calculate new position
      const x = Math.max(0, Math.min(clientX - rect.left, width));
      const newVolume = x / width;

      // Update volume and visuals
      $.audio.volume = Math.max(0, Math.min(newVolume, 1));
      $.volumeFill.style.width = `${newVolume * 100}%`;
      $.volumeHandle.style.left = `${newVolume * 100}%`;

      // Update ARIA values
      $.volumeSlider.setAttribute('aria-valuenow', Math.round(newVolume * 100));
    };

    // Handle mouse down on the handle
    const onHandlePointerDown = (e) => {
      e.stopPropagation(); // Prevent click event on slider
      isDragging = true;
      $.volumeHandle.classList.add('active');
      $.volumeSlider.classList.add('dragging');

      // Add temporary event listeners
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };

    // Handle mouse move while dragging
    const onPointerMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent text selection
      updateVolume(e.clientX);
    };

    // Handle mouse up after dragging
    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      $.volumeHandle.classList.remove('active');
      $.volumeSlider.classList.remove('dragging');

      // Remove temporary event listeners
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    // Handle direct click on the slider
    const onSliderClick = (e) => {
      if (isDragging) return; // Ignore if we're dragging
      updateVolume(e.clientX);
    };

    // Add event listeners
    $.volumeHandle.addEventListener('pointerdown', onHandlePointerDown);
    $.volumeSlider.addEventListener('click', onSliderClick);

    // Set initial position
    $.volumeFill.style.width = `${$.audio.volume * 100}%`;
    $.volumeHandle.style.left = `${$.audio.volume * 100}%`;

    // Add keyboard support
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

    // Setup ARIA attributes
    $.volumeSlider.setAttribute('role', 'slider');
    $.volumeSlider.setAttribute('aria-label', 'Volume');
    $.volumeSlider.setAttribute('aria-valuemin', '0');
    $.volumeSlider.setAttribute('aria-valuemax', '100');
    $.volumeSlider.setAttribute('aria-valuenow', Math.round($.audio.volume * 100));
    $.volumeSlider.setAttribute('tabindex', '0');
  }
}
