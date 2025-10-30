import request from 'supertest';
import app from './index';

describe('Upload Service', () => {
  describe('GET /health', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'upload-service'
      });
    });
  });

  describe('POST /upload', () => {
    it('should reject request without file', async () => {
      const response = await request(app)
        .post('/upload')
        .send({ title: 'Test', description: 'Test' });
      
      expect(response.status).toBe(400);
    });
  });
});

