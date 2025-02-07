/**
 * Error handler function for Gulp tasks.
 *
 * This function logs the error message using `fancy-log` and changes the color of the date style in `util.inspect` to red.
 * After logging the error, it resets the date style color and emits the 'end' event to signal the end of the task.
 *
 * @param {Object} error - The error object containing details about the error.
 * @param {string} [error.messageFormatted] - The formatted error message, if available.
 * @param {string} [error.message] - The error message.
 */
import fancyLog from 'fancy-log';
import util from 'util';


/**
 * errorHandler
 *
 * @description Error handler function for Gulp tasks.
 * @param {*} error
 */
const errorHandler = function (error, done) {
  const defColor = util.inspect.styles.date;
  util.inspect.styles.date = 'red';

  fancyLog(error.messageFormatted || error.message || error.stack);

  util.inspect.styles.date = defColor;

  if (done) {
    done();
  }

  if (typeof this !== 'undefined' && typeof this.emit === 'function') {
    this.emit('end');
  }
};


/**
 * Logging
 */
const log = (message, color = '\x1b[32m') => {
  const reset = '\x1b[0m';
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
  console.log(`[${color}${timestamp}${reset}] ${message}`);
};

export { errorHandler, log };
