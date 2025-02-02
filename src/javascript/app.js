/**
 * Visual Player Web Component
 * ==========================
 *
 * A custom audio player implementation with modern UI and cross-browser support.
 */

import styles from 'root/dist/styles/main.css';
import html from 'root/dist/template.html';

// import AudioVisualizer from './components/audio-visualizer.js';
import AudioVisualizer from './components/winamp-audio-visualizer.js';
// import AudioVisualizer from './components/fire-audio-visualizer.js';
// import AudioVisualizer from './components/fractal-audio-visualizer.js';

function decodeUrl(html, type) {
  const res = html.replace(`data:text/${type};base64,`, '');
  return atob(res);
}

class VisualPlayer extends HTMLElement {

  // List of attributes to observe for changes
  static get observedAttributes() {
    return [
      'src', 'autoplay', 'controls', 'crossorigin', 'loop',
      'muted', 'preload', 'volume', 'playbackrate'
    ];
  }

  constructor() {
    super();
    // Create shadow DOM for style encapsulation
    this.shadow = this.attachShadow({ mode: 'open' });

    this.audio = new Audio();

    this.AudioVisualizer = null;

    this._initStyles();
    this._initElements();
    this._setupEventListeners();
    this._initVisualizer();
  }

  /**
   * Initialize audio visualizer
   */
  _initVisualizer() {
    const canvas = this.shadow.querySelector('.visualizer');
    const ctx = canvas.getContext('2d');

    this.AudioVisualizer = new AudioVisualizer(ctx, this.audio);

    this.audio.addEventListener('play', () => {
      this.AudioVisualizer.initAudio();
    });
  }

  /**
   * Initialize component styles
   * Defines all CSS including custom slider styles
   */
  _initStyles() {
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadow.appendChild(style);
  }

  /**
   * Initialize DOM elements
   * Creates and assembles all player components
   */
  _initElements() {
    const template = decodeUrl(html, 'html');
    this.shadow.innerHTML = template;

    // Set up main container
    this.container = this.shadow.querySelector('.container');

    // Create controls section
    this.controls = this.shadow.querySelector('.controls');

    // Initialize play button with SVG icon
    this.playButton = this.shadow.querySelector('.play-button');

    // Create custom volume slider structure
    this.volumeSlider = this.shadow.querySelector('.volume-slider');
    this.volumeTrack = this.shadow.querySelector('.volume-track');
    this.volumeFill = this.shadow.querySelector('.volume-fill');
    this.volumeHandle = this.shadow.querySelector('.volume-handle');
    this.volumeDisplay = this.shadow.querySelector('.volume-display');
    this.volumeDisplay.textContent = `${Math.round(this.audio.volume * 100)}%`;

    // Create progress container and bar
    this.progressContainer = this.shadow.querySelector('.progress-container');
    this.progressBar = this.shadow.querySelector('.progress-bar');

    // Create time display
    this.timeDisplay = this.shadow.querySelector('.time-display');
  }

  /**
   * Create play button SVG icon
   */
  _createPlayIcon() {
    return `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  }

  /**
   * Create pause button SVG icon
   */
  _createPauseIcon() {
    return `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    `;
  }

  /**
   * Set up all event listeners
   */
  _setupEventListeners() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    this._setupVolumeSlider();
    this._setupProgressBar();
    this._setupKeyboardControls();

    // Update play button icon when audio is ended
    this.audio.addEventListener('ended', () => {
      this.playButton.innerHTML = this._createPlayIcon();
      this.audio.currentTime = 0;
      this.progressBar.style.width = '0%';
      this.updateTimeDisplay();
    });

    this.audio.addEventListener('volumechange', (event) => {
      this.volumeDisplay.textContent = `${Math.round(this.audio.volume * 100)}%`;
    });
  }

  /**
   * Initialize volume slider functionality
   * Handles mouse interactions for volume control
   */
  _setupVolumeSlider() {
    let isDragging = false;

    const updateVolume = (clientX) => {
      // Get slider dimensions
      const rect = this.volumeSlider.getBoundingClientRect();
      const width = rect.width;

      // Calculate new position
      const x = Math.max(0, Math.min(clientX - rect.left, width));
      const newVolume = x / width;

      // Update volume and visuals
      this.audio.volume = Math.max(0, Math.min(newVolume, 1));
      this.volumeFill.style.width = `${newVolume * 100}%`;
      this.volumeHandle.style.left = `${newVolume * 100}%`;

      // Update ARIA values
      this.volumeSlider.setAttribute('aria-valuenow', Math.round(newVolume * 100));
    };

    // Handle mouse down on the handle
    const onHandlePointerDown = (e) => {
      e.stopPropagation(); // Prevent click event on slider
      isDragging = true;
      this.volumeHandle.classList.add('active');
      this.volumeSlider.classList.add('dragging');

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
      this.volumeHandle.classList.remove('active');
      this.volumeSlider.classList.remove('dragging');

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
    this.volumeHandle.addEventListener('pointerdown', onHandlePointerDown);
    this.volumeSlider.addEventListener('click', onSliderClick);

    // Set initial position
    this.volumeFill.style.width = `${this.audio.volume * 100}%`;
    this.volumeHandle.style.left = `${this.audio.volume * 100}%`;

    // Add keyboard support
    this.volumeSlider.addEventListener('keydown', (e) => {
      let currentVolume = this.audio.volume;
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

      this.audio.volume = currentVolume;
      this.volumeFill.style.width = `${currentVolume * 100}%`;
      this.volumeHandle.style.left = `${currentVolume * 100}%`;
    });

    // Setup ARIA attributes
    this.volumeSlider.setAttribute('role', 'slider');
    this.volumeSlider.setAttribute('aria-label', 'Volume');
    this.volumeSlider.setAttribute('aria-valuemin', '0');
    this.volumeSlider.setAttribute('aria-valuemax', '100');
    this.volumeSlider.setAttribute('aria-valuenow', Math.round(this.audio.volume * 100));
    this.volumeSlider.setAttribute('tabindex', '0');
  }

  /**
   * Set up progress bar functionality
   */
  _setupProgressBar() {
    this.audio.addEventListener('timeupdate', () => {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressBar.style.width = `${percent}%`;
      this.updateTimeDisplay();
    });

    const progressContainer = this.shadow.querySelector('.progress-container');
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.audio.duration;
    });
  }

  /**
   * Set up keyboard controls
   */
  _setupKeyboardControls() {
    this.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowRight':
          this.audio.currentTime += 5;
          break;
        case 'ArrowLeft':
          this.audio.currentTime -= 5;
          break;
      }
    });

    this.setAttribute('tabindex', '0');
  }

  /**
   * Format seconds to MM:SS
   */
  _formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Toggle play/pause state
   */
  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      this.playButton.innerHTML = this._createPauseIcon();
    } else {
      this.audio.pause();
      this.playButton.innerHTML = this._createPlayIcon();
    }
  }

  /**
   * Update time display
   */
  updateTimeDisplay() {
    const current = this._formatTime(this.audio.currentTime);
    const total = this._formatTime(this.audio.duration);
    this.timeDisplay.textContent = `${current} / ${total}`;
  }

  /**
   * Called when element is connected to DOM
   */
  connectedCallback() {
    // Initialize attributes
    if (this.hasAttribute('src')) {
      this.audio.src = this.getAttribute('src');
    }
    if (this.hasAttribute('autoplay')) {
      this.audio.autoplay = true;
    }
    if (this.hasAttribute('loop')) {
      this.audio.loop = true;
    }
    if (this.hasAttribute('muted')) {
      this.audio.muted = true;
    }
    if (this.hasAttribute('volume')) {
      this.audio.volume = parseFloat(this.getAttribute('volume'));
    }
    if (this.hasAttribute('playbackrate')) {
      this.audio.playbackRate = parseFloat(this.getAttribute('playbackrate'));
    }
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'src':
        this.audio.src = newValue;
        break;
      case 'autoplay':
        this.audio.autoplay = newValue !== null;
        break;
      case 'controls':
        this.container.style.display = newValue !== null ? 'block' : 'none';
        break;
      case 'loop':
        this.audio.loop = newValue !== null;
        break;
      case 'muted':
        this.audio.muted = newValue !== null;
        break;
      case 'volume':
        this.audio.volume = parseFloat(newValue);
        break;
      case 'playbackrate':
        this.audio.playbackRate = parseFloat(newValue);
        break;
    }
  }

}

// Register web component
customElements.define('visual-player', VisualPlayer);
