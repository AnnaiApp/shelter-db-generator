'use strict';

const { get: getHTTP } = require('http');
const { get: getHTTPS } = require('https');
const xlsx = require('xlsx'); 

const parseResponseJSON = (response, resolve, reject) => {
  let body = '';
  response.on('data', (chunk) => {
    body += chunk;
  });

  response.on('end', () => {
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
};

const parseResponseXLS = (response, resolve, reject) => {
  let body = [];
  response.on('data', (chunk) => {
    body.push(chunk);
  });

  response.on('end', () => {
    try {
      const buffer = Buffer.concat(body);
      const xlsData = xlsx.read(buffer);
      
      let data = [];

      for (const sheet of xlsData.SheetNames) {
        const sheetData = xlsx.utils.sheet_to_json(xlsData.Sheets[sheet]);
        data = data.concat(sheetData);
      }
      
      resolve({data});
    } catch (error) {
      reject(error);
    }
  });
};

const request = (url, type) => {
  return new Promise((resolve, reject) => {
    try {
      var parsedURL = new URL(url);
    } catch (exception) {
      reject(`Invalid URL: ${url}`);
    }

    const protocol = parsedURL.protocol.slice(0, -1);

    if (protocol !== 'http' && protocol !== 'https') reject(`Unsupported URL scheme: ${protocol}`);
    const get = protocol === 'http' ? getHTTP : getHTTPS;

    get(url, (response) => {
      if (response.status >= 400) {
        reject(`Request to ${response.url} failed with HTTP ${response.status}`);
      }

      switch (type) {
        case 'json': 
          parseResponseJSON(response, resolve, reject);
          break;
        case 'xls': 
          parseResponseXLS(response, resolve, reject);
          break;
      }
    }).on('error', reject);
  });
};

module.exports = request;
