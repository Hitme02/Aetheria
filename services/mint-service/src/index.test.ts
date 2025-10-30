import request from 'supertest';
import app from './index';

describe('Mint Service', () => {
  describe('GET /health', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'mint-service'
      });
    });
  });

  describe('POST /mint', () => {
    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/mint')
        .send({ artworkId: 'test' });
      
      expect(response.status).toBe(401);
    });
  });
});

