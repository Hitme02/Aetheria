import request from 'supertest';
import app from './index';

describe('Metadata Service', () => {
  describe('GET /health', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'metadata-service'
      });
    });
  });
});

