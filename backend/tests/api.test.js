require('module-alias/register');
const request = require('supertest');
const { AppDataSource } = require('../src/typeorm-data-source');
const app = require('../src/app');

// Mock database connections for tests
AppDataSource.initialize = jest.fn().mockResolvedValue(AppDataSource);
AppDataSource.getRepository = jest.fn(() => ({}));

beforeAll(async () => {
  await AppDataSource.initialize();
});

describe('Authentication', () => {
  test('login requires credentials', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(409);
  });
});

// TODO: Expand test coverage to other API features once test data is available
