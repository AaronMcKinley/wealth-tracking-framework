const { defineConfig } = require('cypress');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

const baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'smoke/**/*.cy.js',
    supportFile: 'support/e2e.js',
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    }
  },
  reporterOptions: {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false
  }
});
