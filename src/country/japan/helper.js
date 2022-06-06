'use strict';

const Axios = require('axios');
const AdmZip = require('adm-zip');
const xlsx = require('xlsx');

const { REQUEST_URL, REQUEST_EXTENSION, FILE_PREFIX, FILE_SUFFIX, FILE_EXTENSION, SHEET_NAME, PREFECTURES } = require('./const.js');

const getAllPrefectures = () => Object.keys(PREFECTURES).map(key => PREFECTURES[key]);

const generateRequestUrl = (prefecture) => {
  return `${REQUEST_URL}${FILE_PREFIX}${prefecture[0]}${FILE_SUFFIX}${REQUEST_EXTENSION}`;
}

const generateFilePath = (prefecture) => {
  const filePath = prefecture[1] ? `${FILE_PREFIX}${prefecture[0]}${FILE_SUFFIX}/` : '';
  return filePath + `${FILE_PREFIX}${prefecture[0]}${FILE_EXTENSION}`;
}

const request = async (prefectures) => {
  const responses = await Promise.all(prefectures.map(prefecture => Axios.get(generateRequestUrl(prefecture), { responseType: 'arraybuffer' })));

  let rawShelters = [];

  for (let index = 0; index < responses.length; index++) {
    const zip = new AdmZip(responses[index].data);
    const entry = zip.getEntry(generateFilePath(prefectures[index]));

    console.log(prefectures[index], index)

    const xlsData = xlsx.read(entry.getData());
    rawShelters = rawShelters.concat(xlsx.utils.sheet_to_json(xlsData.Sheets[SHEET_NAME]));
  }
  
  return rawShelters;
}

const format = (rawShelters) => rawShelters.map(rawShelter => {
  return {
      id: `japan-${rawShelter['NO']}`,
      type: rawShelter['P20_004'],
      name: rawShelter['P20_002'],
      subname: '',
      address: rawShelter['P20_003'],
      latitude: rawShelter['緯度'],
      longitude: rawShelter['経度']
    }
  });

module.exports = {
  getAllPrefectures,
  request,
  format
};
