'use strict';

const Axios = require('axios');
const AdmZip = require('adm-zip');
const xlsx = require('xlsx');

const { BASE_URL, PREFECTURE, BASE_EXTENSION, DATA_EXTENSION } = require('./const.js');

const url = `${BASE_URL}${PREFECTURE.HOKKAIDOU}${BASE_EXTENSION}`
const filename = `${PREFECTURE.HOKKAIDOU}${DATA_EXTENSION}`

const request = async () => {
  const body = await Axios.get(url, { responseType: 'arraybuffer' });

  const zip = new AdmZip(body.data);
  const entry = zip.getEntry(filename)

  const xlsData = xlsx.read(entry.getData());

  let data = [];
  for (const sheet of xlsData.SheetNames) {
    const sheetData = xlsx.utils.sheet_to_json(xlsData.Sheets[sheet]);
    data = data.concat(sheetData);
  }
  console.log(data)
  return data
}

module.exports = request;
