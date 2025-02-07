/**
 * Plugins Service
 */

export default function initPlugins($) {
  $.plugins = new Map();

  $.use = function(plugins, options = {}) {
    if (!plugins) return;

    if (!Array.isArray(plugins)) {
      plugins = [[plugins, options]];
    } else {
      plugins = plugins.map(p => Array.isArray(p) ? p : [p, {}]);
    }

    plugins.forEach(([plugin, opts]) => {
      if (typeof plugin === 'function') {
        const instance = plugin($, opts);
        $.plugins.set(plugin.name, instance);
      }
    });
  };

  loadPlugins($);
}

function loadPlugins($) {
  $.plugins.forEach(plugin => {
    if (typeof plugin.init === 'function') {
      plugin.init();
    }
  });
}
