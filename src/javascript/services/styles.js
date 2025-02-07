/**
 * Initialize component styles
 */

import css from 'root/dist/styles/main.css';

export default function initStyles($) {
  const style = document.createElement('style');
  style.textContent = css;
  $.shadow.appendChild(style);

  /**
   * Add styles method
   */
  $.addStyles = (styles) => {
    const shadow = $.shadowRoot;
    let elStyle = shadow.querySelector('style');
    if (elStyle) {
      elStyle.textContent += styles;
    }
  };

}
