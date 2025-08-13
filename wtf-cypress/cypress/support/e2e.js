require('@shelex/cypress-allure-plugin');

import './commands';

Cypress.on('uncaught:exception', () => false);