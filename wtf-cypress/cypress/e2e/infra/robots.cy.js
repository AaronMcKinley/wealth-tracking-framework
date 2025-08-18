import {
  assertApiNoindex,
  assertFavicon,
  assertRobots,
  requestApiHealth,
  requestFavicon,
  requestRobots,
} from '../../support/infra/actions';

describe('infra: robots, favicon, and API crawl headers', () => {
  it('robots.txt: correct content and 1-day caching', () => {
    cy.log('GET /robots.txt');
    requestRobots().then((res) => {
      cy.log('Validate status, headers, and body');
      assertRobots(res);
    });
  });

  it('favicon: served with long immutable cache', () => {
    cy.log('GET /favicon.ico');
    requestFavicon().then((res) => {
      cy.log('Validate content-type and cache-control');
      assertFavicon(res);
    });
  });

  it('API: X-Robots-Tag noindex/nofollow present', () => {
    cy.log('GET /api/health via NGINX');
    requestApiHealth().then((res) => {
      cy.log('Validate anti-indexing headers');
      assertApiNoindex(res);
    });
  });
});
