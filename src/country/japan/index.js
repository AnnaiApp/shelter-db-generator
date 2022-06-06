const { getAllPrefectures, request, format } = require('./helper.js');

const main = async () => {
  const shelters = format(await request(getAllPrefectures()));

  console.log(shelters.length)

  // const distinctBy = (prop, arr) => [...new Set(arr.map(o => o[prop]))]
  // const r = distinctBy('type', shelters)
  // console.log(r)
}

module.exports = main;
