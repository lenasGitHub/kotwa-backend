"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'testuser',
                password: 'password123',
                email: 'test@example.com',
                phoneNumber: '+1234567890',
            });
            // Second registration
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'loginuser',
                password: 'password123',
                email: 'login@example.com',
                phoneNumber: '+1122334455',
            });
            if (res.status !== 201)
                console.log('Setup Register Error:', res.body);
            expect(res.status).toBe(201);
        });
        it('should login with correct password', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login-password')
                .send({
                username: 'loginuser',
                password: 'password123',
            });
            if (res.status !== 200)
                console.log('Login Error:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('token');
        });
        it('should fail with incorrect password', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'otpuser',
                password: 'password123',
                email: 'otp@example.com',
                phoneNumber: '+1234567890',
            });
        });
        it('should send OTP', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                phoneNumber: '+1234567890',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/OTP sent/i);
        });
    });
});
//# sourceMappingURL=auth.test.js.map