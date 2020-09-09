'use strict';

const Path = require('path');
const Realm = require('realm');

const output = require('../helper/output');
const { deleteRecursive } = require('./../helper/folder');

const tokyo = require('./../city/tokyo');

const scriptFolder = Path.dirname('/');

const schema = {
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

const build = async (cities) => {
  output('title', 'Building Realm database');

  // Delete the existing database files, if they exist
  output('info', 'Deleting previous build files...');
  [
    `${process.env.REALM_DB_NAME}.realm`,
    `${process.env.REALM_DB_NAME}.realm.lock`,
    `${process.env.REALM_DB_NAME}.realm.note`,
    `${process.env.REALM_DB_NAME}.realm.management`,
  ].forEach(file => deleteRecursive(Path.join(scriptFolder, file)));
  output('info', '...Done');


  // List of shelters
  let shelters = [];

  // For every city, we get the shelters
  for (const city of cities) {
    let sheltersNew = [];
  
    switch (city) {
      case 'tokyo':
        sheltersNew = await tokyo();
    }
  
    shelters = shelters.concat(sheltersNew);
  }

  // Create the database and fill it with the shelter data
  Realm.open({
    path: Path.join(scriptFolder, `${process.env.REALM_DB_NAME}.realm`),
    schema: [schema]
  }).then(realm => {
    return realm.write(() => {
      output('info', `Processing ${shelters.length} shelters...`);

      // Populate the database
      for (const shelter of shelters) {
        realm.create(schema.name, shelter, Realm.UpdateMode.Never);
      }
      output('info', '...Done');
    });
  }).then(() => {    
    output('title', 'Realm database has been built');
    process.exit(0);
  });
};

module.exports = {
  schema,
  build
};
