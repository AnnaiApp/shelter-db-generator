const getJSON = require('../helper/json-request.js');

const japaneseURL = 'http://map2.bousai.metro.tokyo.jp/cgi-bin/bousai/pc/searchFacilityInfo.cgi';
const englishURL = 'http://map2.bousai.metro.tokyo.jp/cgi-bin/bousai/en/pc/searchFacilityInfo.cgi';

const parseShelters = (japaneseData, englishData) => {
  // Assuming the data from the Japanese and English CGIs come in the same order
  const count = japaneseData.length;

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

const tokyo = () => Promise.all([getJSON(japaneseURL), getJSON(englishURL)])
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

    return shelters;
  })
  .catch(error => {
    console.error(`Error when calling ${japaneseURL}: ${error}`);
    process.exit(1);
  });

  module.exports = tokyo;