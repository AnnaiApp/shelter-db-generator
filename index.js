require('dotenv').config();

const prompts = require('prompts');
const yargs = require('yargs')

const { build: buildRealm } = require('./src/db/realm');

const DB_TYPE_REALM = 'realm';

(async () => {
  prompts.override(
    yargs
      .option('dbtype', {
        alias: 't',
        description: 'the database type to generate',
        choices: [DB_TYPE_REALM],
        type: 'string'
      })
      .option('all', {
        alias: 'a',
        description: 'Generate a database for all available cities',
        type: 'boolean'
      })
      .help()
      .alias('help', 'h')
      .argv
  );

  let questions = [{
    type: 'select',
    name: 'dbtype',
    message: 'What type of database do you want to build ?',
    choices: [
      { title: 'Realm', value: DB_TYPE_REALM }
    ]
  }]

  if (!yargs.argv.all) {
    questions.unshift({
      type: 'multiselect',
      name: 'cities',
      message: 'Select cities to include in the database :',
      min: 1,
      choices: [
        { title: 'Kyoto', value: 'kyoto' },
        { title: 'Tokyo', value: 'tokyo' }
      ]
    })
  }

  let response = await prompts(questions)

  if (yargs.argv.all) {
    response.cities = [
      'kyoto',
      'tokyo'
    ]
  }

  switch (response.dbtype) {
    case DB_TYPE_REALM:
      buildRealm(response.cities);
      break;
  }
})();
