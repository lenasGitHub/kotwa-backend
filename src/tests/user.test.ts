import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User API', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        // Create user and get token
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'profileuser',
                password: 'password123',
                email: 'profile@example.com',
                phoneNumber: '+1112223333',
            });

        token = res.body.data.token;
        userId = res.body.data.user.id;
    });

    describe('GET /api/users/profile', () => {
        it('should get current user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('username', 'profileuser');
            expect(res.body.data).not.toHaveProperty('password');
        });

        it('should fail without token', async () => {
            const res = await request(app).get('/api/users/profile');
            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bio: 'Updated bio',
                    isPublic: false
                });

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('bio', 'Updated bio');
            expect(res.body.data).toHaveProperty('isPublic', false);
        });
    });
});
