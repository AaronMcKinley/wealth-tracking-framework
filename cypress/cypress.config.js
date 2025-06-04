const { defineConfig } = require('cypress');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    },
    specPattern: 'smoke/**/*.cy.js',
    baseUrl: 'http://localhost:3000',
    supportFile: 'support/e2e.js'
  },
  reporterOptions: {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false
  }
});
