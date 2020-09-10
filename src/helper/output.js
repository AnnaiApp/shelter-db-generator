const { format: formatDate } = require('./date');

const output = (type, message) => {
  const date = formatDate(new Date());

  switch (type) {
    case 'title':
      console.log(`${date} ------------------ ${message}`);
      break;
    case 'info':
      console.log(`${date} >> ${message}`);
      break;
    case 'error':
      console.error(`${date} X ${message}`);
      break;
  }
};

module.exports = output;
