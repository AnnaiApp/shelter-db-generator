'use strict';

const { get: getHTTP } = require('http');
const { get: getHTTPS } = require('https');

const parseResponse = (response, resolve, reject) => {
  if (response.status >= 400) {
    reject(`Request to ${response.url} failed with HTTP ${response.status}`);
    return;
  }

  let body = '';

  response.on('data', (chunk) => {
    body += chunk;
  });

  response.on('end', () => {
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    };
  });
}

const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    try {
      var parsedURL = new URL(url);
    } catch (exception) {
      reject(`Invalid URL: ${url}`);
    }

    const protocol = parsedURL.protocol.slice(0, -1);

    switch (protocol) {
      case 'http':
        var get = getHTTP;
        break;
      case 'https':
        var get = getHTTPS;
        break;
      default:
        reject(`Unsupported URL scheme: ${protocol}`)
        return;
    }

    get(url, (response) => {
      parseResponse(response, resolve, reject);
    }).on('error', reject);
  });
}

module.exports = getJSON;