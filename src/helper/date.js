const format = (date) => {
  let result = '';
  
  result += '[';
  result += date.getFullYear().toString().padStart(4, '0');
  result += '/';
  result += (date.getMonth()+1).toString().padStart(2, '0');
  result += '/';
  result += date.getDate().toString().padStart(2, '0');
  result += ' ';
  result += date.getHours().toString().padStart(2, '0');
  result += ':';
  result += date.getMinutes().toString().padStart(2, '0');
  result += ':';
  result += date.getSeconds().toString().padStart(2, '0');
  result += ']';

  return result;
};

module.exports = {
  format
};
