// Endpoints, header names, and expected patterns for infra checks
const InfraLocators = {
  endpoints: {
    ROBOTS: '/robots.txt',
    FAVICON: '/favicon.ico',
    API_HEALTH: '/api/health',
  },
  headers: {
    CONTENT_TYPE: 'content-type',
    CACHE_CONTROL: 'cache-control',
    X_ROBOTS_TAG: 'x-robots-tag',
  },
  expect: {
    robots: {
      CONTENT_INCLUDES: 'User-agent: *',
      DISALLOW_REGEX: /Disallow:\s*\/api\/?/,
      CACHE_REGEX: /max-age=\s*86400/,
      CONTENT_TYPE_PART: 'text/plain',
    },
    favicon: {
      TYPE_REGEX: /image\/(x-icon|vnd\.microsoft\.icon|ico)/,
      CACHE_REGEX: /max-age=\s*31536000/,
      IMMUTABLE: /immutable/,
    },
    api: {
      NOINDEX: /noindex/i,
      NOFOLLOW: /nofollow/i,
      STATUS_RANGE: [200, 299],
    },
  },
};

export default InfraLocators;
