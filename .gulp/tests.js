// Tests

import mobileFriendlyTest from 'mobile-friendly-test-npm';
import htmlSpeed from 'html-speed';
import cssTest from 'css-test-npm';

import { log } from './lib/utils.js';

import dotenv from 'dotenv';
dotenv.config();

/**
 * Mobile Friendly Test
 */
const mftApiKey = process.env.MFT_KEY || '';
const mftUrl = process.env.PROXY_URL || '';

const mobileTestRes = async (done) => {
  try {
    await mobileFriendlyTest(mftUrl, mftApiKey);
  } catch (error) {
    log(`[mobileFriendlyTest] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};


/**
 * HTML Speed Test
 */
const hstApiKey = process.env.HST_KEY || '';
const hstUrl = process.env.PROXY_URL || '';

const htmlSpeedRes = async (done) => {
  try {
    await htmlSpeed(hstUrl, hstApiKey);
  } catch (error) {
    log(`[htmlSpeedRes] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};


/**
 * CSS Test
 */
const cssUrl = process.env.PROXY_URL || '';

const cssTestRes = async (done) => {
  try {
    await cssTest(cssUrl);
  } catch (error) {
    log(`[cssTest] ${error}`, '\x1b[32m');
  } finally {
    done();
  }
};

export { mobileTestRes, htmlSpeedRes, cssTestRes };
