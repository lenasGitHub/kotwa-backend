import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    email: 'test@example.com',
                    phoneNumber: '+1234567890',
                });

            if (res.status !== 201) {
                console.log('Register Error Response:', res.body);
            }
            expect(res.status).toBe(201);
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data.user).toHaveProperty('username', 'testuser');
        });

        it('should fail if username already exists', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    email: 'test@example.com',
                    phoneNumber: '+1234567890',
                });

            // Second registration
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser', // Duplicate username
                    password: 'password123',
                    email: 'test2@example.com',
                    phoneNumber: '+0987654321',
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login-password', () => {
        beforeEach(async () => {
            // Create user for login test
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'loginuser',
                    password: 'password123',
                    email: 'login@example.com',
                    phoneNumber: '+1122334455',
                });
            if (res.status !== 201) console.log('Setup Register Error:', res.body);
            expect(res.status).toBe(201);
        });

        it('should login with correct password', async () => {
            const res = await request(app)
                .post('/api/auth/login-password')
                .send({
                    username: 'loginuser',
                    password: 'password123',
                });

            if (res.status !== 200) console.log('Login Error:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login-password')
                .send({
                    username: 'loginuser',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/auth/login (OTP)', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'otpuser',
                    password: 'password123',
                    email: 'otp@example.com',
                    phoneNumber: '+1234567890',
                });
        });

        it('should send OTP', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    phoneNumber: '+1234567890',
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/OTP sent/i);
        });
    });
});
