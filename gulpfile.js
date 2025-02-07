/**
 * Load Modules
 * ================================================================================
 */
import gulp from 'gulp';

/**
 * Load Tasks
 */

// Styles
import { scss, cssCompress, stylesReload, scssInJs } from './.gulp/styles.js';

// JavaScript
import { roll, scriptsReload, compressJS, jsConcatVendorLibs } from './.gulp/javascript.js';

// HTML
import { htmlGenerate, htmlReload, htmlCompress, validateHtml, testHtml, htmlPagesPreview } from './.gulp/html.js';

// Images
import { webpCompress, copyImages, copyBuildImages } from './.gulp/images.js';
import getSprite from './.gulp/sprite.js';

// Server
import { openServer, openBrowser, openProxyTunnel } from './.gulp/server.js';

// Misc
import { copyBuildFiles, copyCommonFiles, bumper, cleanBuild, cleanDist, cleanHTML } from './.gulp/misc.js';

// Tests
import { mobileTestRes, htmlSpeedRes, cssTestRes } from './.gulp/tests.js';

/**
 * @todo Tasks
 * @todo Statistics
 */

/**
 * System
 */
const { parallel, series, watch } = gulp;


/**
 * Gulp Configuration
 */
import dataGulp from './.gulp-settings.json' with { type: 'json' };


/**
 * System Init
 */

// Disable deprecation warnings
process.noDeprecation = true;

// Increase event listener limit
process.setMaxListeners(0);

// Clear shell screen
console.clear();

/**
 * Settings
 * ================================================================================
 */


/**
 * HTML Pages Preview List
 */
const getHtmlPagesPreview = (done) => htmlPagesPreview(dataGulp.htmlPreview, done);


/**
 * Common Files
 *
 * These folders and files are copied to the ./dist directory without any changes.
 */
const copyCommon = (done) => copyCommonFiles(dataGulp.commonFiles, done);


/**
 * JS Libraries List
 *
 * This list concatenates the specified scripts and libraries into a single script
 * to avoid recompilation if an external script has already been processed.
 */
const jsConcat = (done) => jsConcatVendorLibs(dataGulp.scripts, done);

/**
 * Tasks
 * ================================================================================
 */

/**
 * Watcher
 */

const cfgWatch = {
  usePolling: true,
  interval: 500,
  ignoreInitial: true
};

const watcher = (done) => {
  watch('./src/scss/**/*.scss', cfgWatch, series(scss, stylesReload));
  watch('./src/javascript/**/*.scss', cfgWatch, series(scssInJs, roll, jsConcat, scriptsReload));

  watch('./src/**/*.html', cfgWatch, series(htmlGenerate, cleanHTML, htmlReload, testHtml));
  watch('./src/javascript/**/*.js', cfgWatch, series(roll, jsConcat, scriptsReload));
  watch('./src/images/**/*', cfgWatch, series(webpCompress, copyImages));
  watch([
    './src/favicons/**/*',
    './src/fonts/**/*',
    './src/video/**/*',
    './src/test/**/*',
    './src/report/**/*'
  ], cfgWatch, copyCommon);

  done();
};

/**
 * Default Tasks
 */
export default series(
  cleanDist,
  cleanBuild,
  copyCommon,
  parallel(
    series(series(scssInJs, roll, jsConcat)),
    series(scss),
    series(webpCompress, copyImages),
    series(htmlGenerate, cleanHTML, openBrowser),
    openServer,
    openProxyTunnel,
    watcher
  )
);

/**
 * Test Tasks
 */
const test = parallel(mobileTestRes, htmlSpeedRes, cssTestRes, validateHtml);

/**
 * Build Tasks
 */
const build = series(
  cleanDist,
  cleanBuild,
  copyBuildFiles,
  parallel(
    series(series(scssInJs, roll, jsConcat, compressJS)),
    series(scss, cssCompress),
    series(webpCompress, copyImages, copyBuildImages),
    series(htmlGenerate, cleanHTML, htmlCompress)
  ),
  bumper
);

/**
 * Generate Images
 */
const images = series(webpCompress, copyImages);

/**
 * Generate SVG Sprite
 */
const sprite = series(getSprite);

export { test, build, images, sprite };
