/**
 * Plugins Service
 */

export default function initPlugins($) {

  // Plugins registry
  $.plugins = [];

  // Plugins factory
  $.use = function(plugins) {
    if (!plugins) return;

    plugins = plugins.map(p => {
      if (typeof p === 'object') return p;
      return null;
    }).filter(Boolean);

    plugins.forEach((plugin) => {

      // bFirst tells the plugin that it is being called for the first time or several times.
      let bFirst = true;
      if ($.plugins.includes(plugin.id)) {
        bFirst = false;
      }

      plugin.run($, bFirst);
      $.plugins.push(plugin.id);
    });
  };

}
