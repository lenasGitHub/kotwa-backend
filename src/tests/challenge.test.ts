import request from 'supertest';
import app from '../app';

describe('Challenge API', () => {
    let token: string;

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'challengeuser',
                password: 'password123',
                email: 'challenge@example.com',
                phoneNumber: '+7778889999',
            });
        token = res.body.data.token;
    });

    describe('POST /api/challenges', () => {
        it('should create a new challenge', async () => {
            const res = await request(app)
                .post('/api/challenges')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Challenge',
                    description: 'Test Description',
                    type: 'COUNTER',
                    category: 'FITNESS',
                    targetGoal: 100,
                    startDate: '2024-01-01',
                    endDate: '2024-01-31',
                });

            expect(res.status).toBe(201);
            expect(res.body.data).toHaveProperty('title', 'New Challenge');
        });
    });

    describe('GET /api/challenges', () => {
        it('should get all challenges', async () => {
            const res = await request(app)
                .get('/api/challenges')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
