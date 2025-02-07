/**
 * Javascript Tasks
 * ================================================================================
 */


import gulp from 'gulp';
const { src, dest } = gulp;

import standard from 'gulp-standard';
import concat from 'gulp-concat';
import connect from 'gulp-connect';

/**
 * System
 */
import path from 'path';
import fs from 'fs';

/**
 * Notification
 */
import plumber from 'gulp-plumber';
import size from 'gulp-size';
import fancyLog from 'fancy-log';

/**
 * Compressors
 */
import uglify from 'gulp-uglify';

/**
 * JavaScript
 */
import { rollup } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import * as babelCore from '@babel/core';


/**
 * Performance
 */
import cached from 'gulp-cached';
import changed from 'gulp-changed';
import remember from 'gulp-remember';


/**
 * CSS in JS
 */
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

/**
 * HTML in JS
 */
import nunjucks from 'rollup-plugin-nunjucks';

/**
 * Custom
 */
import { errorHandler, log } from './lib/utils.js';

const __dirname = path.resolve(path.dirname(''));

/**
 * Config
 */
const cfg = {
  src: {
    js: './src/javascript/**/*.js',
  },
  dest: {
    js: './src/javascript/**/*.js',
  },
  roll: {
    input: './src/javascript/app.js',
    output: './dist/javascript/app.js',
    format: 'iife',
  },
};


/**
 * Rollup.js Configuration
 */
const rollupCfg = () => ({
  input: cfg.roll.input,
  cache: true, // Enable Rollup cache
  plugins: [
    nunjucks(),
    postcss({
      modules: false,
      extract: false,
      namedExports: false,
      inject: false,
      minimize: false,
      plugins: [
        autoprefixer(),
      ]
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env'],
      babelHelpers: 'bundled'
    }),
    url({
      include: ['**/*.svg', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp'],
    }),
    json(),
    alias({
      entries: [
        { find: 'src', replacement: `${__dirname}/src/javascript/` },
        { find: 'root', replacement: `${__dirname}/` }
      ],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main']
    }),
    commonjs({
      include: ['node_modules/**'],
      sourceMap: true
    })
  ],
  onLog(level, log) {
    fancyLog('\x1b[33m[Rollup][Warning]\x1b[0m', '\x1b[0m' + log.message + '\x1b[0m');
  }
});


/**
 * Rollup.js tasks
 */
const roll = async function (done) {
  try {
    const bundle = await rollup(rollupCfg());

    await bundle.write({
      file: cfg.roll.output,
      format: cfg.roll.format,
      name: 'library',
      sourcemap: true,
    });

  } catch (error) {
    log(`[JS] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};


/**
 * Reload Browser after JS Changes
 */
const scriptsReload = (done) =>
  src(cfg.src.js)
    .pipe(connect.reload())
    .on('end', done);


/**
 * Compress JavaScript
 */
const compressJS = () =>
  src('./dist/javascript/**/*.js')
    .pipe(plumber({ errorHandler }))
    .pipe(changed('./build/javascript/'))
    .pipe(uglify({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }))
    .pipe(size({
      title: '[JavaScript]',
      showFiles: true,
    }))
    .pipe(dest('./build/javascript/'));

/**
 * Lints JavaScript files to ensure they follow coding standards.
 */
const standardJS = () =>
  src(['./dist/javascript/app.js'])
    .pipe(plumber({ errorHandler }))
    .pipe(cached('lint'))
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: false,
      quiet: true
    }));

/**
 * Concatenates a list of JavaScript vendor libraries with app.js into a single file with sourcemaps
 */
const jsConcatVendorLibs = (jsVendorList, done) => {
  const pink = '\x1b[35m';
  const reset = '\x1b[0m';
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

  try {
    return src(jsVendorList.src, { allowEmpty: true })
      .pipe(plumber({ errorHandler }))
      .pipe(cached('vendor-libs'))
      .pipe(remember('vendor-libs'))
      .on('data', function (file) {
        const fileContent = file.contents.toString();
        let fileMap = null;

        const mapPath = `${file.path}.map`;
        const altMapPath = `${file.path.replace('.js', '')}.map`;

        if (!fs.existsSync(mapPath) && !fs.existsSync(altMapPath)) {
          console.log(`[${pink}${timestamp}${reset}] [JavaScript] Map file not found for ${file.path}. Generating...`);

          const result = babelCore.transformSync(fileContent, {
            sourceMaps: true,
            sourceFileName: path.basename(file.path),
          });

          fileMap = JSON.stringify(result.map, null, 2);
        } else {
          const existingMapPath = fs.existsSync(mapPath) ? mapPath : altMapPath;
          fileMap = fs.readFileSync(existingMapPath, 'utf-8');
        }

        file.sourceMap = JSON.parse(fileMap);
      })
      .pipe(concat('app.js', { sourceMap: true }))
      .pipe(dest('./dist/javascript/'))
      .on('end', () => {
        console.log(`[${pink}${timestamp}${reset}] [JavaScript] JS libraries concatenated with sourcemaps.`);
        done();
      });
  } catch (error) {
    if (typeof errorHandler === 'function') {
      errorHandler.call(this, error);
    }
    done(error);
  }
};

export { roll, scriptsReload, compressJS, standardJS, jsConcatVendorLibs };
