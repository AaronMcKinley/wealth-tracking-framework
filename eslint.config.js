// eslint.config.js (Flat Config for ESLint v9)
const globals = require('globals');

const ignorePatterns = [
  'node_modules',
  '**/node_modules',
  '**/dist',
  '**/build',
  '**/coverage',
  '**/*.min.js',
  '**/*.d.ts',

  // CI / infra
  'jenkins_home',
  'jenkins_data',
  'wtf-jenkins/',
  'wtf-ansible/',
  'wtf-nginx/',
  'wtf-cronjobs/',

  // Allure
  'allure-results',
  'allure-report',
  'allure-history',
  '.allure*',

  // Cypress output
  'wtf-cypress/cypress/screenshots',
  'wtf-cypress/cypress/videos',

  // Large/generated data
  'finnhub-api/data/',
  'wtf-finnhub/data/',
  'wtf-coingecko/data/',

  // Static public bundles
  'wtf-react/public',

  // OS noise
  '.DS_Store',
];

module.exports = [
  // Global ignores (Flat Config doesn't read .eslintignore)
  { ignores: ignorePatterns },

  // Base JS/JSX rules
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
    },
    rules: {
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['warn', 'smart'],
      radix: 'warn',
    },
  },

  // TypeScript (TS/TSX) — no type-checking, fast
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },

  // React app
  {
    files: ['wtf-react/**/*.{js,jsx,ts,tsx}'],
    settings: { react: { version: 'detect' } },
    plugins: {
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      prettier: require('eslint-plugin-prettier'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },

  // Cypress tests
  {
    files: ['wtf-cypress/**/*.js'],
    languageOptions: {
      globals: { ...globals.mocha, cy: true, Cypress: true, expect: true },
    },
    plugins: { cypress: require('eslint-plugin-cypress') },
    rules: { 'no-unused-expressions': 'off' },
  },

  // Node backend
  {
    files: ['wtf-node/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'script',
    },
    rules: {},
  },
];
