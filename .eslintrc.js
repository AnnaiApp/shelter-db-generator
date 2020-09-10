module.exports = {
  'env': {
    'node': true,
    'browser': true,
    'commonjs': true,
    'es2021': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 12
  },
  'rules': {
    'comma-dangle': [1, 'never'],
    'quotes': [2, 'single', 'avoid-escape'],
    'arrow-parens': ['warn', 'always'],
    'eol-last': ['error', 'always']
  }
};
