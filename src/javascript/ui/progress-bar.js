export default function initProgressBar($) {

  setupProgressBar();

  /**
   * Set up progress bar functionality
   */
  function setupProgressBar() {
    $.audio.addEventListener('timeupdate', () => {
      const percent = ($.audio.currentTime / $.audio.duration) * 100;
      $.progressBar.style.width = `${percent}%`;
      updateTimeDisplay();
    });

    const progressContainer = $.shadow.querySelector('.progress-container');
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      $.audio.currentTime = percent * $.audio.duration;
    });
  }

  /**
   * Format seconds to MM:SS
   */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update time display
   */
  function updateTimeDisplay() {
    const current = formatTime($.audio.currentTime);
    const total = formatTime($.audio.duration);
    $.timeDisplay.textContent = `${current} / ${total}`;
  }

  // Update play button icon when audio is ended
  $.audio.addEventListener('ended', () => {
    $.progressBar.style.width = '0%';
    updateTimeDisplay();
  });

}
