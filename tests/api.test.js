// api.test.js
//
// Tests for the actual HTTP API (GET /api/route).
//
// We use "supertest" here instead of manually starting a server on a
// real port. supertest lets us send fake HTTP requests directly to our
// Express `app` object in memory - fast, and no port conflicts.

const request = require('supertest');
const app = require('../src/app');

describe('GET /api/route', () => {
  test('valid distance route returns 200 with correct fields', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Hauz Khas', to: 'Rajiv Chowk', mode: 'distance' });

    expect(res.status).toBe(200);
    expect(res.body.from).toBe('Hauz Khas');
    expect(res.body.to).toBe('Rajiv Chowk');
    expect(res.body.mode).toBe('distance');
    expect(Array.isArray(res.body.path)).toBe(true);
    expect(res.body.path[0]).toBe('Hauz Khas');
    expect(res.body.path[res.body.path.length - 1]).toBe('Rajiv Chowk');
    expect(res.body.distanceKm).toBeCloseTo(10, 5);
    expect(res.body.fareInRupees).toBeGreaterThan(0);
  });

  test('valid time route returns 200 with estimatedTimeMin', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Hauz Khas', to: 'Rajiv Chowk', mode: 'time' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('time');
    expect(res.body.estimatedTimeMin).toBe(21);
  });

  test('defaults to distance mode when mode is not provided', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Hauz Khas', to: 'Rajiv Chowk' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('distance');
  });

  test('missing "from" returns 400', async () => {
    const res = await request(app).get('/api/route').query({ to: 'Rajiv Chowk' });

    expect(res.status).toBe(400);
    expect(res.body.error.toLowerCase()).toContain('from');
  });

  test('missing "to" returns 400', async () => {
    const res = await request(app).get('/api/route').query({ from: 'Hauz Khas' });

    expect(res.status).toBe(400);
    expect(res.body.error.toLowerCase()).toContain('to');
  });

  test('unknown station returns 404', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Not A Real Station', to: 'Rajiv Chowk' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('invalid mode returns 400', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Hauz Khas', to: 'Rajiv Chowk', mode: 'speed' });

    expect(res.status).toBe(400);
    expect(res.body.error.toLowerCase()).toContain('mode');
  });

  test('same source and destination returns 200 with a single-station path', async () => {
    const res = await request(app)
      .get('/api/route')
      .query({ from: 'Rajiv Chowk', to: 'Rajiv Chowk' });

    expect(res.status).toBe(200);
    expect(res.body.path).toEqual(['Rajiv Chowk']);
    expect(res.body.distanceKm).toBe(0);
  });
});