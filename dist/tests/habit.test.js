"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Habit API', () => {
    let token;
    beforeEach(async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/habits/categories')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
//# sourceMappingURL=habit.test.js.map