/**
 * Initialize component styles
 */

import styles from 'root/dist/styles/main.css';

export default function initStyles($) {
  const style = document.createElement('style');
  style.textContent = styles;
  $.shadow.appendChild(style);
}
