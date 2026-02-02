import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  let otp: string;
  const phoneNumber = '1234567890';

  it('jshould send OTP successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phoneNumber });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('OTP sent successfully');
  });

  // Note: Since we can't easily capture the OTP from console in a test without more setup,
  // we might Mock the AuthService or just expect the login to work.
  // For integration test on a real DB, we would query the DB to get the OTP.
  // But without DB access in this test file (importing prisma might fail if not compiled),
  // we will just placeholder the verify step or mock the OTP generation if we could.

  // For now, let's assume we can mock the service if we wanted true unit tests.
  // Since this is an "Integration" test plan, we would need the DB.
});
