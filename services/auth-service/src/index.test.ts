import request from 'supertest';
import app from './index';

describe('Auth Service', () => {
  describe('GET /health', () => {
    it('should return service status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'auth-service'
      });
    });
  });

  describe('GET /nonce', () => {
    it('should return nonce for valid wallet', async () => {
      const response = await request(app).get('/nonce?wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      expect(response.status).toBe(200);
      expect(response.body.nonce).toBeDefined();
    });

    it('should reject invalid wallet address', async () => {
      const response = await request(app).get('/nonce?wallet=invalid');
      expect(response.status).toBe(400);
    });
  });

  describe('POST /verify', () => {
    it('should reject request without wallet and signature', async () => {
      const response = await request(app).post('/verify').send({});
      expect(response.status).toBe(400);
    });
  });
});

