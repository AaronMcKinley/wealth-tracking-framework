describe('Landing Page Test', () => {
  it('should display welcome message', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Wealth Tracking Framework'); // or your actual heading
  });
});
