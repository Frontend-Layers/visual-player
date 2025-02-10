import html from '../ui/templates/template.html';

export default function initElements($) {
  const template = html;

  const tmpHTML = document.createElement('div');
  tmpHTML.innerHTML = template;

  const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  const bodyMatch = template.match(bodyRegex);

  let contentHTML = template;

  if (bodyMatch && bodyMatch[1]) {
    contentHTML = bodyMatch[1].trim();
  }
  $.shadow.innerHTML += contentHTML || template;

  // Set up main container
  $.container = $.shadow.querySelector('.' + $.componentName);

  /**
   * Add HTML template
   *
   * @param {*} html
   * @param {*} options
   * @returns
   */
  $.addTpl = (html, options = {}) => {
    const shadow = $.container;
    const { selector } = options;

    if (!selector) {
      appendHTML(shadow, html);
      return;
    }

    const selectorParts = selector.trim().split(/\s+/);
    let currentParent = shadow;

    selectorParts.forEach((part, index) => {
      let element = currentParent.querySelector(part);
      if (!element) {
        element = createElementFromSingleSelector(part);
        currentParent.appendChild(element);
      }
      if (index === selectorParts.length - 1) {
        appendHTML(element, html);
      }
      currentParent = element;
    });
  };

  /**
   * Appends HTML content to a target DOM element.
   * Parses the HTML string into nodes and appends each child node to the target.
   *
   * @param {HTMLElement} target - The DOM element to which the HTML will be appended.
   * @param {string} html - The HTML string to parse and append.
   */
  function appendHTML(target, html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      target.appendChild(temp.firstChild);
    }
  };

  /**
   * Creates a DOM element from a single CSS-like selector string.
   * Extracts the tag name (defaults to 'div' if not provided), adds classes,
   * and sets the ID if specified in the selector.
   *
   * @param {string} selector - A CSS-like selector string (e.g., "div.class1.class2#id").
   * @returns {HTMLElement} - The newly created DOM element with the specified attributes.
   */
  const createElementFromSingleSelector = (selector) => {
    // Match tag name if present, otherwise use 'div'
    const tagMatch = selector.match(/^[a-zA-Z0-9-]+/);
    const tagName = tagMatch ? tagMatch[0] : 'div';

    const element = document.createElement(tagName);

    // Handle classes
    const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      classMatches.forEach(className => {
        element.classList.add(className.slice(1));
      });
    }

    // Handle ID
    const idMatch = selector.match(/#[a-zA-Z0-9_-]+/);
    if (idMatch) {
      element.id = idMatch[0].slice(1);
    }

    return element;
  };
}
