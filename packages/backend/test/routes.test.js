const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { createServer } = require('../src/index');
const initializeDatabase = require('../src/db');

const path = require('path');
const fs = require('fs');

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe('Backend API Tests', () => {
  let server;
  let db;

  beforeEach(async () => {
    // Set a unique DB path for each test
    const DB_TEST_PATH_UNIQUE = path.resolve(__dirname, `../debitum_test_${Date.now()}_${Math.random().toString(36).substring(7)}.db`);
    process.env.DB_PATH = DB_TEST_PATH_UNIQUE; // Set for createServer

    // Clean up any old test database if it exists (shouldn't be necessary with unique names, but good practice)
    if (fs.existsSync(DB_TEST_PATH_UNIQUE)) {
      fs.unlinkSync(DB_TEST_PATH_UNIQUE);
    }

    // Initialize the server with a test database
    server = await createServer();
    db = await initializeDatabase(DB_TEST_PATH_UNIQUE); // Pass unique path directly
  });

  afterEach(async () => {
    await server.stop();
    db.close();
    const currentDbPath = path.resolve(__dirname, process.env.DB_PATH);
    if (fs.existsSync(currentDbPath)) {
      fs.unlinkSync(currentDbPath);
    }
  });

  it('should initialize the database with default global info', async () => {
    const globalInfo = await db.get('SELECT * FROM global_info WHERE id = 1');
    expect(globalInfo).to.be.an.object();
    expect(globalInfo).to.include({ id: 1, monthly_income: 0, max_debt_percentage: 0 });
  });

  it('should get global info', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/global-info',
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result).to.include({ id: 1, monthly_income: 0, max_debt_percentage: 0 });
  });

  it('should update global info', async () => {
    const payload = { monthly_income: 5000, max_debt_percentage: 40 };
    const res = await server.inject({
      method: 'PUT',
      url: '/global-info',
      payload: payload,
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.include({ message: 'Global info updated successfully' });

    const getRes = await server.inject({
      method: 'GET',
      url: '/global-info',
    });
    expect(getRes.statusCode).to.equal(200);
    expect(getRes.result).to.include(payload);
  });

  it('should add a new debt', async () => {
    const payload = {
      title: 'Car Loan',
      debt: 25000,
      periodicity: 'monthly',
      payment_term: 60,
      nir: 5.5,
      aer: 5.65,
    };
    const res = await server.inject({
      method: 'POST',
      url: '/debts',
      payload: payload,
    });
    expect(res.statusCode).to.equal(201);
    expect(res.result).to.include({ message: 'Debt added successfully' });
  });

  it('should get all debts', async () => {
    // Add a debt first to ensure there's data to retrieve
    const addPayload = {
      title: 'Student Loan',
      debt: 10000,
      periodicity: 'monthly',
      payment_term: 120,
      nir: 4.0,
      aer: 4.1,
    };
    await server.inject({
      method: 'POST',
      url: '/debts',
      payload: addPayload,
    });

    const res = await server.inject({
      method: 'GET',
      url: '/debts',
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.array();
    expect(res.result.length).to.be.above(0);
    expect(res.result[0]).to.include({
      title: 'Student Loan',
      debt: 10000,
    });
  });

  it('should update a debt', async () => {
    // Add a debt first to ensure there's data to update
    const addPayload = {
      title: 'Credit Card',
      debt: 5000,
      periodicity: 'monthly',
      payment_term: 24,
      nir: 18.0,
      aer: 19.5,
    };
    const addRes = await server.inject({
      method: 'POST',
      url: '/debts',
      payload: addPayload,
    });

    const getRes = await server.inject({
      method: 'GET',
      url: '/debts',
    });
    const debtId = getRes.result.find(d => d.title === 'Credit Card').id;

    const payload = { debt: 4000, nir: 15.0 };
    const res = await server.inject({
      method: 'PUT',
      url: `/debts/${debtId}`,
      payload: payload,
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.include({ message: 'Debt updated successfully' });

    const updatedDebtRes = await server.inject({
      method: 'GET',
      url: '/debts',
    });
    const updatedDebt = updatedDebtRes.result.find(d => d.id === debtId);
    expect(updatedDebt).to.include({ debt: 4000, nir: 15.0 });
  });

  it('should delete a debt', async () => {
    // Add a debt first to ensure there's data to delete
    const addPayload = {
      title: 'Personal Loan',
      debt: 7000,
      periodicity: 'monthly',
      payment_term: 36,
      nir: 10.0,
      aer: 10.5,
    };
    const addRes = await server.inject({
      method: 'POST',
      url: '/debts',
      payload: addPayload,
    });

    const getRes = await server.inject({
      method: 'GET',
      url: '/debts',
    });
    const debtId = getRes.result.find(d => d.title === 'Personal Loan').id;

    const res = await server.inject({
      method: 'DELETE',
      url: `/debts/${debtId}`,
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.include({ message: 'Debt deleted successfully' });

    const checkRes = await server.inject({
      method: 'GET',
      url: '/debts',
    });
    const deletedDebt = checkRes.result.find(d => d.id === debtId);
    expect(deletedDebt).to.be.undefined();
  });

  it('should return 404 for non-existent debt on update', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: '/debts/9999',
      payload: { title: 'Non Existent' },
    });
    expect(res.statusCode).to.equal(404);
  });

  it('should return 404 for non-existent debt on delete', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: '/debts/9999',
    });
    expect(res.statusCode).to.equal(404);
  });

  it('should return 400 for invalid payload on add debt', async () => {
    const payload = {
      title: 'Invalid Debt',
      debt: -100, // Invalid debt amount
      periodicity: 'monthly',
      payment_term: 12,
      nir: 5,
      aer: 5.1,
    };
    const res = await server.inject({
      method: 'POST',
      url: '/debts',
      payload: payload,
    });
    expect(res.statusCode).to.equal(400);
  });

  it('should return 400 for invalid payload on update global info', async () => {
    const payload = { monthly_income: -100 }; // Invalid monthly income
    const res = await server.inject({
      method: 'PUT',
      url: '/global-info',
      payload: payload,
    });
    expect(res.statusCode).to.equal(400);
  });
});