describe('Landing Page Test', () => {
  it('should display welcome message', () => {
    cy.visit('/');
    cy.contains('Wealth Tracking Framework');
  });
});
