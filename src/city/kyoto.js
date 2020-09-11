'use strict';

const request = require('./../helper/request');

const shelterURL = 'https://data.city.kyoto.lg.jp/sites/default/files/resource-files/01%E6%8C%87%E5%AE%9A%E9%81%BF%E9%9B%A3%E6%89%80H310401%E7%8F%BE%E5%9C%A8_0.xls';
const areaURL = 'https://data.city.kyoto.lg.jp/sites/default/files/resource-files/03%E5%BA%83%E5%9F%9F%E9%81%BF%E9%9B%A3%E5%A0%B4%E6%89%80H310401.xls';

const shelterInfo = {
  codeTitle: '通し\nNo.',
  nameTitle: '施設名',
  addressTitle: '住所',
  latitudeTitle: '北緯',
  longitudeTitle: '東経'
};

const areaInfo = {
  codeTitle: '№',
  nameTitle: '名称',
  addressTitle: '所在地',
  latitudeTitle: '北緯',
  longitudeTitle: '東経'
};

const parseShelters = (data, info, type) => {
  const shelters = [];

  const count = data.length;

  for (let i = 0; i < count; i++) {
    const d = data[i];

    shelters.push({
      id: `kyoto-${type}-${i}`,
      type: 1,
      code: d[info.codeTitle].toString(),
      name: d[info.nameTitle].trim(),
      subname: '',
      address: d[info.addressTitle].trim(),
      latitude: parseFloat(d[info.latitudeTitle]),
      longitude: parseFloat(d[info.longitudeTitle])
    });
  }

  return shelters;
};

const kyoto = () => Promise.all([request(shelterURL, 'xls'), request(areaURL, 'xls')])
  .then(([shelterJSON, areaJSON]) => {
    let shelters = [];
    
    if (!Object.prototype.hasOwnProperty.call(shelterJSON, 'data')) {
      console.error(`The data from ${shelterURL} doesn't contain a "data" field: ${JSON.stringify(shelterJSON)}`);
    } else {
      const shelterList = parseShelters(shelterJSON.data, shelterInfo, 1);
      shelters = shelters.concat(shelterList);
    }

    if (!Object.prototype.hasOwnProperty.call(areaJSON, 'data')) {
      console.error(`The data from ${areaURL} doesn't contain a "data" field: ${JSON.stringify(areaJSON)}`);
    } else {
      const areaList = parseShelters(areaJSON.data, areaInfo, 2);
      shelters = shelters.concat(areaList);
    }

    return shelters;
  })
  .catch((error) => {
    throw error;
  });

module.exports = kyoto;
