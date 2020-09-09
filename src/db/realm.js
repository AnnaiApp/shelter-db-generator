'use strict';

const { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } = require('fs');
const Path = require('path');
const Realm = require('realm');

const tokyo = require('./../city/tokyo');

const scriptFolder = Path.dirname('/');
const dbName = 'shelters';

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
  }
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

const realm = async () => {
    const sheltersTokyo = await tokyo();
    console.log(sheltersTokyo);

    const shelters = sheltersTokyo;

    console.log(shelters);

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
    });

}

module.exports = realm;
