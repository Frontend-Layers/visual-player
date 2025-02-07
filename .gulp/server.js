import gulp from 'gulp';
const { src, dest, parallel } = gulp;

import connect from 'gulp-connect';

import localtunnel from 'localtunnel';

import open from 'open';
import browserSync from 'browser-sync';
import net from 'net';

import { log } from './lib/utils.js';

/**
 * Environment
 */
import dotenv from 'dotenv';
dotenv.config();

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
  } catch (error) {
    log(`[Browser] ${error}`, '\x1b[32m');
  } finally {
    done();
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

    } catch (error) {
      log(`[Tunnel] ${error}`, '\x1b[32m');
    } finally {
      done();
    }
  }
};

export { openServer, openBrowser, openProxyTunnel, bs };
