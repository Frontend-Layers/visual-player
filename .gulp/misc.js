import gulp from 'gulp';
import plumber from 'gulp-plumber';
import bump from 'gulp-bump';

import copy from 'copy-recursive';
import { deleteAsync } from 'del';

import { errorHandler, log } from './lib/utils.js';

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
 * Patching
 * Bump the version in package.json
 */
const bumper = (done) =>
  src('./package.json')
    .pipe(bump())
    .pipe(dest('./'))
    .on('end', done);

/**
 * Clean
 * Delete the build directory
 */
const cleanBuild = async (done) => {
  try {
    await deleteAsync(['./build/**/*']);
    log('[Clean] Build directory cleaned', '\x1b[32m');
  } catch (error) {
    log(`[Clean] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};

/**
 * Clean
 * Delete the dist directory
 */
const cleanDist = async (done) => {
  try {
    await deleteAsync(['./dist/**/*'], { force: true });
    log('[Clean] Dist directory cleaned', '\x1b[32m');
  } catch (error) {
    log(`[Clean] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};

/**
 * Clean
 * Delete the layouts directories in dist and build
 */
const cleanHTML = async (done) => {
  try {
    await deleteAsync(['./dist/layouts', './build/layouts']);
    log('[Clean] HTML layouts cleaned', '\x1b[32m');
    done();
  } catch (error) {
    log(`[Clean] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
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
  copyCommonFiles,
  bumper,
  cleanBuild,
  cleanDist,
  cleanHTML
};
