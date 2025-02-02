import gulp from 'gulp';
const { src, dest, parallel } = gulp;

/**
 * System
 */
import { deleteAsync } from 'del';
import localtunnel from 'localtunnel';

/**
 * Versioning
 */
import bump from 'gulp-bump';

/**
 * Server
 */
import connect from 'gulp-connect';
import open from 'open';
import browserSync from 'browser-sync';

/**
 * Environment
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Custom
 */
import { errorHandler } from './lib/utils.js';

/**
 * Config
 */
const cfg = {
  server: {
    host: '0.0.0.0',
    root: './dist/',
    port: process.env.PORT || 4000,
    src: './dist/index.html',
    uri: `http://localhost:${process.env.PORT || 4000}/`,
  },
  lt: process.env.LT || false,
  subdomain: process.env.SUBDOMAIN || '',
};

const bs = browserSync.create();


/**
 * Enhanced error handling
 */
const handleServerError = (error) => {
  const errorMessages = {
    EADDRINUSE: `Port ${cfg.server.port} is already in use. Please use another port or free the current one.`,
    EACCES: `Insufficient permissions to run port ${cfg.server.port}. Try using port > 1024 or run as administrator.`,
    EADDRNOTAVAIL: `Address ${cfg.server.host} is not available. Check network settings.`,
    ECONNREFUSED: 'Connection refused. Check firewall and network settings.',
    DEFAULT: 'An unexpected server error occurred.'
  };

  const message = errorMessages[error.code] || errorMessages.DEFAULT;
  log(`[Server] Error: ${message}`, '\x1b[31m');

  return error;
};

/**
 * Logging
 */
const log = (message, color = '\x1b[32m') => {
  const reset = '\x1b[0m';
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
  console.log(`[${color}${timestamp}${reset}] ${message}`);
};

import net from 'net';

/**
 * Create Local Web Server
 */
const openServer = (done) => {

  // Check if port is available before starting server
  const testServer = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        handleServerError(err);
        done(err);
      }
    })
    .once('listening', () => {
      testServer.close(() => {
        try {
          connect.server({
            host: cfg.server.host,
            root: cfg.server.root,
            port: cfg.server.port,
            livereload: true,
            middleware: () => [(req, res, next) => {
              if (req.headers['content-type'] === 'application/json') {
                log(`[Server] ${req.method}: ${req.url}`);
              }
              next();
            }]
          });

          log(`[Server] Started on http://${cfg.server.host}:${cfg.server.port}`, '\x1b[32m');
          done();
        } catch (err) {
          handleServerError(err);
          done(err);
        }
      });
    })
    .listen(cfg.server.port, cfg.server.host);
};

/**
 * Open Default Browser
 */
const openBrowser = async (done) => {
  log(`[Browser] Opening browser at: ${cfg.server.uri}`, '\x1b[35m');
  try {
    await open(cfg.server.uri);
    done();
  } catch (err) {
    log(`[Browser] Failed to open: ${err.message}`, '\x1b[31m');
    done(err);
  }
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
    done();
  } catch (error) {
    log(`[Clean] Failed to clean build: ${error.message}`, '\x1b[31m');
    done(error);
  }
};


/**
 * Clean
 * Delete the dist directory
 */
const cleanDist = async (done) => {
  try {
    await deleteAsync(['./dist/**/*']);
    log('[Clean] Dist directory cleaned', '\x1b[32m');
    done();
  } catch (error) {
    log(`[Clean] Failed to clean dist: ${error.message}`, '\x1b[31m');
    done(error);
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
    log(`[Clean] Failed to clean HTML: ${error.message}`, '\x1b[31m');
    done(error);
  }
};

/**
 * Proxy Tunneling (localtunnel)
 * Create a localtunnel to expose the local server to the internet
 */
const openProxyTunnel = async (done) => {
  if (cfg.lt) {
    try {
      const tunnel = await localtunnel({
        port: cfg.server.port,
        subdomain: cfg.subdomain,
      });

      log(`[Tunnel] Created successfully: ${tunnel.url}`, '\x1b[32m');

      tunnel.on('error', (err) => {
        log(`[Tunnel] Error: ${err.message}`, '\x1b[31m');
      });

      tunnel.on('close', () => {
        log('[Tunnel] Closed', '\x1b[33m');
      });

      done();
    } catch (error) {
      log(`[Tunnel] Failed to create: ${error.message}`, '\x1b[31m');
      done(error);
    }
  } else {
    done();
  }
};

export { openServer, openBrowser, bumper, cleanBuild, cleanDist, cleanHTML, openProxyTunnel, bs };
