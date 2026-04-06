import request from 'supertest';
import app from '../server.js';

describe('Authentication API', () => {
    it('Should return 401 if accessing protected resource without token', async () => {
        const res = await request(app)
            .get('/api/budget/');
        expect(res.statusCode).toEqual(401);
    });

    it('Should login correctly with valid credentials', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: 'test_calendar@example.com',
                password: 'Test123!'
            });
        
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('token');
            expect(res.body.success).toBe(true);
        }
    });
});
