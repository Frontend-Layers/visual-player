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
    this.componentName = 'visual-player';

    services(this);
  }

  /**
   * Audio inheritance
   */
  static get observedAttributes() {
    return [
      'src',
      'autoplay',
      'controls',
      'crossorigin',
      'loop',
      'muted',
      'preload',
      'volume',
      'playbackrate',
      'theme',
      'single-player'
    ];
  }

  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.audio && name !== 'theme' && name !== 'single-player') {
      this.audio.setAttribute(name, newValue);
    }
  }

}

// Register web component
customElements.define('visual-player', VisualPlayer);
