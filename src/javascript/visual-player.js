/**
 * Visual Player Web Component
 * ==========================
 *
 * A custom audio player implementation with modern UI and cross-browser support.
 */

import services from './services';

class VisualPlayer extends HTMLElement {

  constructor() {
    super();
    // Create shadow DOM for style encapsulation
    this.shadow = this.attachShadow({ mode: 'open' });

    services(this);
  }

  /**
   * Audio inheritance
   */
  static get observedAttributes() {
    return ['src', 'autoplay', 'controls', 'crossorigin', 'loop',
      'muted', 'preload', 'volume', 'playbackrate'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.audio) {
      this.audio.setAttribute(name, newValue);
    }
  }

}

// Register web component
customElements.define('visual-player', VisualPlayer);
