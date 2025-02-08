/**
 * Initialize component styles and themes
 * @param {HTMLElement} $ - Web component instance (this)
 */
import css from '../ui/styles/visual-player.css';

export default function initStyles($) {
  // Wait for all stylesheets to load
  const waitForStylesheets = () => {
    return Promise.all(
      Array.from(document.styleSheets).map(sheet => {
        if (sheet.href) {
          const link = [...document.querySelectorAll('link[rel="stylesheet"]')]
            .find(l => new URL(l.href, document.baseURI).href === sheet.href);

          if (!link) {
            // console.warn(`Stylesheet not found in <link>: ${sheet.href}`);
            return Promise.resolve();
          }

          return new Promise(resolve => {
            if (link.sheet) {
              resolve();
            } else {
              link.onload = () => resolve();
              link.onerror = () => {
                // console.warn(`Error loading stylesheet: ${link.href}`);
                resolve();
              };
            }
          });
        }
        return Promise.resolve();
      })
    );
  };

  // Add base styles if they haven't been added yet
  if (!$.shadowRoot.querySelector('style[data-base]')) {
    const baseStyle = document.createElement('style');
    baseStyle.setAttribute('data-base', '');
    baseStyle.textContent = css;

    $.shadowRoot.appendChild(baseStyle);
  }

  /**
   * Add custom styles to the component
   * @param {string} styles - CSS styles to append
   */
  $.addStyles = (styles) => {
    const shadow = $.shadowRoot;
    let elStyle = shadow.querySelector('style[data-base]');

    if (!elStyle) {
      elStyle = document.createElement('style');
      elStyle.setAttribute('data-base', '');
      shadow.appendChild(elStyle);
    }

    elStyle.textContent += styles;
  };

  /**
   * Add theme styles from global CSS layers
   * @returns {Promise<void>}
   */
  $.addTheme = async() => {
    const theme = $.getAttribute('theme');
    if (!theme) return;

    // Wait for stylesheets to load
    await waitForStylesheets();

    // Remove previous theme styles if they exist
    const oldThemeStyle = $.shadowRoot.querySelector('style[data-theme]');
    if (oldThemeStyle) {
      oldThemeStyle.remove();
    }

    let foundTheme = false;
    const styleSheets = Array.from(document.styleSheets);

    for (const sheet of styleSheets) {
      try {
        // Check if stylesheet is accessible
        if (!sheet.cssRules) {
          // console.warn('Cannot access rules of stylesheet:', sheet.href);
          continue;
        }

        const rules = Array.from(sheet.cssRules);
        const themeLayer = rules.find(rule =>
          rule instanceof CSSLayerBlockRule &&
          rule.name === `visual-player-${theme}`
        );

        if (themeLayer) {
          foundTheme = true;
          const themeStyle = document.createElement('style');
          themeStyle.setAttribute('data-theme', theme);

          try {
            const themeRules = Array.from(themeLayer.cssRules).map(layerRule => {
              const selector = layerRule.selectorText.replace(/^\./, '');
              const properties = layerRule.style.cssText;
              return `.${selector} { ${properties} }`;
            }).join('\n');

            themeStyle.textContent = themeRules;

            $.shadowRoot.appendChild(themeStyle);
            // console.info(`Theme "${theme}" applied successfully`);
            break; // Stop searching after finding the first matching layer
          } catch (ruleError) {
            // console.error(`Error processing theme rules: ${ruleError.message}`);
          }
        }
      } catch (sheetError) {
        // Log detailed error information for debugging
        // console.warn('Error accessing stylesheet:', {
        //   href: sheet.href,
        //   error: sheetError.message,
        //   origin: sheet.href ? new URL(sheet.href).origin : 'inline'
        // });
      }
    }

    if (!foundTheme) {
      // console.warn(`Theme "${theme}" not found in available stylesheets`);
    }
  };

  // Create observer for theme attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'theme') {
        $.addTheme().catch(error => {
          console.error('Error applying theme:', error);
        });
      }
    });
  });

  observer.observe($, {
    attributes: true,
    attributeFilter: ['theme']
  });

  // Apply initial theme if set
  if ($.getAttribute('theme')) {
    $.addTheme().catch(error => {
      console.error('Error applying initial theme:', error);
    });
  }
}
