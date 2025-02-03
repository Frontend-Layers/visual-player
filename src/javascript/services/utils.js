export default function decodeUrl(html, type) {
  // Check if 'html' is a string
  if (typeof html !== 'string') {
    throw new TypeError('The "html" argument must be a string.');
  }

  // Check if 'type' is a string
  if (typeof type !== 'string') {
    throw new TypeError('The "type" argument must be a string.');
  }

  // Look for the prefix in the string
  const prefix = `data:text/${type};base64,`;
  if (!html.startsWith(prefix)) {
    throw new Error(`The string does not start with the expected prefix: ${prefix}`);
  }

  // Remove the prefix
  const base64Data = html.substring(prefix.length);

  // Decode Base64
  try {
    return atob(base64Data);
  } catch (error) {
    throw new Error('Base64 decoding error: ' + error.message);
  }
}
