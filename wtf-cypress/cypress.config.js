const { defineConfig } = require('cypress');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, @shelex/cypress-allure-plugin',
    '@shelex/cypress-allure-plugin': {
      resultsDir: 'allure-results',
    },
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://wealth-tracking-framework.com',
    specPattern: 'smoke/**/*.cy.js',
    supportFile: 'support/e2e.js',
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    },
  },
  env: {
    allure: true,
    allureResultsPath: 'allure-results',
  },
});