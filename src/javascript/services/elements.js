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
  $.mainContainer = $.shadow.querySelector('.' + $.componentName);

  /**
   * Add HTML template
   *
   * @param {*} html
   * @param {*} options
   * @returns
   */
  $.addTpl = (html, options = {}) => {
    const mainContainer = $.mainContainer;
    const { selector } = options;

    if (!selector) {
      appendHTML(mainContainer, html);
      return;
    }

    const selectorParts = selector.trim().split(/\s+/);
    let currentParent = mainContainer;

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
   * Remove HTML template
   *
   * @param {string} tpl - HTML template string to remove
   * @param {Object} options - Additional options for removal
   * @param {string} options.selector - CSS selector for target container
   * @param {boolean} [options.keepContainer=true] - If true, keeps the container element but removes its contents
   * @returns {void}
   */
  $.removeTpl = (tpl, options = {}) => {
    const { selector, keepContainer = true } = options;
    if (!tpl || !selector) return;

    const mainContainer = $.mainContainer;
    const elements = mainContainer.querySelectorAll(selector);

    // Create a temporary div to parse the template
    const temp = document.createElement('div');
    temp.innerHTML = tpl;

    elements.forEach(container => {
      // Handle comment nodes and text nodes
      const containerNodes = Array.from(container.childNodes);
      containerNodes.forEach(node => {
        // For comment nodes, compare nodeValue
        if (node.nodeType === Node.COMMENT_NODE) {
          temp.childNodes.forEach(templateNode => {
            if (templateNode.nodeType === Node.COMMENT_NODE &&
              templateNode.nodeValue.trim() === node.nodeValue.trim()) {
              node.remove();
            }
          });
        }
        // For element nodes, compare structure but ignore text content
        else if (node.nodeType === Node.ELEMENT_NODE) {
          temp.childNodes.forEach(templateNode => {
            if (templateNode.nodeType === Node.ELEMENT_NODE &&
              node.tagName === templateNode.tagName &&
              node.className === templateNode.className) {
              if (keepContainer) {
                container.removeChild(node);
              } else {
                container.parentNode?.removeChild(container);
              }
            }
          });
        }
      });
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
      temp.firstChild._init = true;
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
