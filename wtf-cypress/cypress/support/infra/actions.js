import Infra from './locators';

function assertHeader(res, name, patternOrSubstring) {
  const value = res.headers[name.toLowerCase()];
  if (patternOrSubstring instanceof RegExp) {
    expect(value, `header ${name}`).to.match(patternOrSubstring);
  } else {
    expect(value, `header ${name}`).to.include(String(patternOrSubstring));
  }
}

export function requestRobots() {
  return cy.request(Infra.endpoints.ROBOTS);
}
export function assertRobots(res) {
  expect(res.status, 'robots status').to.eq(200);
  assertHeader(res, Infra.headers.CONTENT_TYPE, Infra.expect.robots.CONTENT_TYPE_PART);
  assertHeader(res, Infra.headers.CACHE_CONTROL, Infra.expect.robots.CACHE_REGEX);
  expect(res.body, 'robots has UA').to.include(Infra.expect.robots.CONTENT_INCLUDES);
  expect(res.body, 'robots disallows /api').to.match(Infra.expect.robots.DISALLOW_REGEX);
}

export function requestFavicon() {
  return cy.request(Infra.endpoints.FAVICON);
}
export function assertFavicon(res) {
  expect(res.status, 'favicon status').to.eq(200);
  assertHeader(res, Infra.headers.CONTENT_TYPE, Infra.expect.favicon.TYPE_REGEX);
  assertHeader(res, Infra.headers.CACHE_CONTROL, Infra.expect.favicon.CACHE_REGEX);
  assertHeader(res, Infra.headers.CACHE_CONTROL, Infra.expect.favicon.IMMUTABLE);
}

export function requestApiHealth() {
  return cy.request(Infra.endpoints.API_HEALTH);
}
export function assertApiNoindex(res) {
  const [min, max] = Infra.expect.api.STATUS_RANGE;
  expect(res.status, 'api/health status').to.be.within(min, max);
  assertHeader(res, Infra.headers.X_ROBOTS_TAG, Infra.expect.api.NOINDEX);
  assertHeader(res, Infra.headers.X_ROBOTS_TAG, Infra.expect.api.NOFOLLOW);
}
