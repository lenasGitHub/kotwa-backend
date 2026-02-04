import request from 'supertest';
import app from '../app';

describe('Habit API', () => {
    let token: string;

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'habituser',
                password: 'password123',
                email: 'habit@example.com',
                phoneNumber: '+4445556666',
            });
        token = res.body.data.token;
    });

    describe('GET /api/habits/categories', () => {
        it('should return categories', async () => {
            const res = await request(app)
                .get('/api/habits/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
