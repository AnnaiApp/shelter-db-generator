require('dotenv').config();

// const prompts = require('prompts');

// const { build: buildRealm } = require('./src/db/realm');

// (async () => {
//   const response = await prompts([
//     {
//       type: 'multiselect',
//       name: 'cities',
//       message: 'Select cities to include in the database :',
//       min: 1,
//       choices: [
//         { title: 'Kyoto', value: 'kyoto' },
//         { title: 'Tokyo', value: 'tokyo' }
//       ]
//     },
//     {
//       type: 'select',
//       name: 'dbtype',
//       message: 'What type of database do you want to build ?',
//       choices: [
//         { title: 'Realm', value: 0 }
//       ]
//     }
//   ]);

//   switch (response.dbtype) {
//     case 0: 
//       buildRealm(response.cities);
//       break;
//   }
// })();


const main = require('./src/country/japan/index')

main();
