"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Challenge API', () => {
    let token;
    beforeEach(async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/challenges')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
//# sourceMappingURL=challenge.test.js.map