import tpl from './templates/progress-bar.html';
import css from './styles/progress-bar.css';

export default function initProgressBar($) {
  $.addStyles(css);

  $.addTpl(tpl, {
    priority: 'none',
    selector: '.container'
  });

  // Create progress container and bar
  $.progressContainer = $.shadow.querySelector('.progress-container');
  $.progressBar = $.shadow.querySelector('.progress-bar');

  // Create time display
  $.timeDisplay = $.shadow.querySelector('.time-display');

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
