import gulp from 'gulp';
import plumber from 'gulp-plumber';

import { errorHandler } from './lib/utils.js';
import copy from 'copy-recursive';

const { src, dest } = gulp;

/**
 * Copies all distribution files to the build directory.
 * Does not use caching as it's a final build step.
 * @returns {Object} Gulp stream
 */
const copyBuildFiles = () =>
  src(['./dist/**/*'])
    .pipe(plumber({ errorHandler }))
    .pipe(dest('./build/'));


const copyCommonFiles = (cfg, done) => {
  copy(cfg)
    .then(() => done())
    .catch((error) => {
      console.error(error);
      done(error);
    });
};

/**
 * Export all copy tasks.
 * Each task is a function that can be used in gulp.series() or gulp.parallel()
 *
 * @example
 * import { copyFiles, copyFonts } from './copy-tasks.js';
 * export default gulp.series(copyFiles, copyFonts);
 */
export {
  copyBuildFiles,
  copyCommonFiles
};
