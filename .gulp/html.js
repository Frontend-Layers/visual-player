import gulp from 'gulp';

/**
 * System
 */
import path from 'path';
import connect from 'gulp-connect';
import fs from 'fs';

/**
 * Vendor
 */
import tpl from 'gulp-nunjucks-render';
import plumber from 'gulp-plumber';
import prettify from 'gulp-prettify';
import htmlMin from 'gulp-htmlmin';
import size from 'gulp-size';

/**
 * Tools
 */
import { htmlValidator } from 'gulp-w3c-html-validator';
import htmlTest from 'html-test';
import htmlPreview from 'html-pages-preview';

/**
 * Performance
 */
import cached from 'gulp-cached';
import changed from 'gulp-changed';


import { errorHandler } from './lib/utils.js';

const __dirname = path.resolve(path.dirname(''));

const { src, dest } = gulp;
const cfgPlumber = { errorHandler };

/**
 * Generate Pages Preview
 */
const htmlPagesPreview = (cfg, done) => {
  const isDev = process.env.NODE_ENV === 'development';
  const srcFiles = cfg.src;
  const destFile = cfg.dest;
  const missingFiles = srcFiles.filter(file => !fs.existsSync(file));

  // Check Files
  if (missingFiles.length > 0) {
    if (isDev) {
      console.error('Missing files:', missingFiles.join(', '));
    } else {
      console.warn('Missing files:', missingFiles.join(', '));
    }
    done();
    return;
  }

  // Check Folder
  const destDir = destFile.substring(0, destFile.lastIndexOf('/'));
  if (!fs.existsSync(destDir)) {
    if (isDev) {
      console.error('Destination directory does not exist:', destDir);
    } else {
      console.warn('Destination directory does not exist:', destDir);
    }
    done();
    return;
  }

  // Process preview
  try {
    htmlPreview(srcFiles, destFile);
  } catch (error) {
    if (isDev) {
      console.error('[HTML Pages Preview] Error:', error);
    } else {
      console.warn('[HTML Pages Preview] Error:', error);
    }
  }
  done();
};

const htmlGenerate = () =>
  src([
    './src/**/*.html',
    '!./src/report/**',
    '!./src/test/**',
    '!./src/javascript/**',
    '!./src/node_modules/**',
  ])
    .pipe(plumber(cfgPlumber))
    .pipe(cached('html'))
    .pipe(changed('./dist'))
    // .pipe(debug({ title: '[Nunjucks]' }))
    .pipe(tpl({ path: ['./src/'] }))
    .pipe(
      prettify({
        indent_inner_html: true,
        indent_size: 2,
        unformatted: ['pre', 'code'],
      })
    )
    .pipe(dest('./dist'));

const htmlReload = () =>
  src('./dist/**/*.html')
    .pipe(connect.reload());

const htmlCompress = (done) =>
  src('./dist/*.html')
    .pipe(plumber(cfgPlumber))
    .pipe(
      htmlMin({
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      })
    )
    .pipe(dest('./build/'))
    .pipe(size({
      title: '[HTML]',
      showFiles: true,
    }))
    .pipe(connect.reload())
    .on('end', done);

const testHtml = (done) => {
  htmlTest('./dist/**/*.html', {
    ignore: [
      'dist/test/**',
      'dist/javascript/**',
      'dist/report/**',
      'dist/doc/**',
      'node_modules/**'
    ]
  });
  done();
};

const validateHtml = () =>
  src('./dist/*.html')
    .pipe(plumber(cfgPlumber))
    .pipe(htmlValidator.analyzer({
      ignoreLevel: "warning"
    }))
    .pipe(htmlValidator.reporter());

export {
  htmlGenerate,
  htmlReload,
  htmlCompress,
  validateHtml,
  testHtml,
  htmlPagesPreview
};
