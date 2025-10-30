import request from 'supertest';
import app from './index';

describe('Voting Service', () => {
  describe('GET /health', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'voting-service'
      });
    });
  });

  describe('GET /featured', () => {
    it('should return featured artworks', async () => {
      const response = await request(app).get('/featured?n=3');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('artworks');
    });
  });
});

