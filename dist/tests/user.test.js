"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('User API', () => {
    let token;
    let userId;
    beforeEach(async () => {
        // Create user and get token
        const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('username', 'profileuser');
            expect(res.body.data).not.toHaveProperty('password');
        });
        it('should fail without token', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/users/profile');
            expect(res.status).toBe(401);
        });
    });
    describe('PUT /api/users/profile', () => {
        it('should update user profile', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
//# sourceMappingURL=user.test.js.map