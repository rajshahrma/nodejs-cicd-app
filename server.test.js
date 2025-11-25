const request = require('supertest');
const app = require('./server');

describe('Node.js CI/CD Application', () => {
  
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });

    it('should return health check information', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /', () => {
    it('should return home page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('CI/CD Pipeline Success');
    });
  });

  describe('GET /api/info', () => {
    it('should return application information', async () => {
      const res = await request(app).get('/api/info');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('environment');
    });

    it('should return valid JSON', async () => {
      const res = await request(app).get('/api/info');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.statusCode).toBe(404);
    });
  });
});
