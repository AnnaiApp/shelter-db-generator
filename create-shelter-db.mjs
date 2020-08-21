#!/usr/bin/env node

'use strict';

import {copyFile, existsSync, lstatSync, mkdirSync, readdirSync, rmdirSync, unlinkSync} from 'fs';
import Path from 'path';
import Realm from 'realm';
import {fileURLToPath} from 'url';
import getJSON from './json-request.mjs';

const scriptFolder = Path.dirname(fileURLToPath(import.meta.url));
const dbName = 'shelters';
const japaneseURL =
  'http://map2.bousai.metro.tokyo.jp/cgi-bin/bousai/pc/searchFacilityInfo.cgi';
const englishURL =
  'http://map2.bousai.metro.tokyo.jp/cgi-bin/bousai/en/pc/searchFacilityInfo.cgi';

const ShelterSchema = {
  name: 'Shelter',
  primaryKey: 'id',
  properties: {
    id: 'int',
    type: 'int',
    code: 'string',
    name: 'string',
    subname: 'string',
    address: 'string',
    latitude: 'double',
    longitude: 'double',
  },
};

function deleteRecursive(path) {
  if (!existsSync(path)) {
    return;
  }
  if (!lstatSync(path).isDirectory()) {
    // Delete the file
    unlinkSync(path);
    return;
  }
  readdirSync(path).forEach((file, index) => {
    const curPath = Path.join(path, file);
    if (lstatSync(curPath).isDirectory()) {
      // Recurse
      deleteRecursive(curPath);
    } else {
      // Delete the file
      unlinkSync(curPath);
    }
  });
  rmdirSync(path);
}

function parseShelters(japaneseData, englishData) {
  // Assuming the data from the Japanese and English CGIs come in the same order
  const count = japaneseData.length;
  console.log(`Retrieved ${count} shelters`);

  let shelters = [];

  for (let i = 0; i < count; i++) {
    const jp = japaneseData[i];
    const en = englishData[i];

    // 1  => 避難所 (shelter)
    // 2  => 避難場所 (evacuation site)
    // 3  => 給水拠点 (water)
    // 4  => 医療機関 (medical facility)
    // 5  => 都立学校(災害時帰宅支援ステーション) (metropolitan school)
    // 6  => コンビニエンスストア(災害時帰宅支援ステーション) (convenience store)
    // 7  => 飲食店チェーン等(災害時帰宅支援ステーション) (restaurant)
    // 8  => ガソリンスタンド(災害時帰宅支援ステーション) (gas station)
    // 51 => 一時滞在施設 (temporary accomodation facility)
    const type = parseInt(jp.type, 10);

    if (type !== 1 && type !== 2) {
      // Only keep the shelters and evacuation sites
      continue;
    }

    const lat = parseFloat(jp.lat);
    const lon = parseFloat(jp.lon);

    shelters.push({
      id: i,
      type: type,
      code: jp.facility_code.trim(),
      name: jp.name.trim(),
      subname: en.name.trim(),
      address: jp.address.trim(),
      latitude: lat,
      longitude: lon,
    });
  }

  return shelters;
}

Promise.all([getJSON(japaneseURL), getJSON(englishURL)])
  .then(([japaneseJSON, englishJSON]) => {
    if (!japaneseJSON.hasOwnProperty('data')) {
      console.error(`The data from ${japaneseURL} doesn't contain a "data" field: ${JSON.stringify(japaneseJSON)}`);
      process.exit(1);
    }
    if (!englishJSON.hasOwnProperty('data')) {
      console.error(`The data from ${englishURL} doesn't contain a "data" field: ${JSON.stringify(englishJSON)}`);
      process.exit(1);
    }

    const shelters = parseShelters(englishJSON.data, japaneseJSON.data);

    // Delete the existing database files, if they exist
    [
      `${dbName}.realm`,
      `${dbName}.realm.lock`,
      `${dbName}.realm.note`,
      `${dbName}.realm.management`,
    ].forEach(file => deleteRecursive(Path.join(scriptFolder, file)));

    // Create the database and fill it with the shelter data
    Realm.open({
      path: Path.join(scriptFolder, 'shelters.realm'),
      schema: [ShelterSchema],
    }).then(realm => {
      realm.write(() => {
        console.log(`Start processing ${shelters.length} shelters...`);

        // Populate the database
        for (const shelter of shelters) {
          console.log(`Inserting ${shelter.name}...`);
          realm.create(ShelterSchema.name, shelter, Realm.UpdateMode.Never);
        }
      });

      console.log(`Done loading ${shelters.length} shelters`);

      [
        Path.join(scriptFolder, '..', 'android', 'app', 'src', 'main', 'assets'),
        Path.join(scriptFolder, '..', 'ios', 'Annai')
      ].forEach(assetsFolder => {
        // Create the asset folder if it doesn't exist
        mkdirSync(assetsFolder, {recursive: true, mode: 0o755})
        // Copy the database file to the Android and iOS projects
        copyFile(Path.join(scriptFolder, `${dbName}.realm`), Path.join(assetsFolder, `${dbName}.realm`), err => {
          if (err) {
            console.error(`Couldn't copy ${dbName}.realm to ${assetsFolder}`);
            return
          }
          console.log(`Successfully copied ${dbName}.realm to ${assetsFolder}`)
        });
      });
    });
  })
  .catch(error => {
    console.error(`Error when calling ${japaneseURL}: ${error}`);
    process.exit(1);
  });
