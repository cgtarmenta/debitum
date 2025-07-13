'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Debt, GlobalInfo, Amortization } = require('../db');

/**
 * Registers debt-related routes with the Hapi server.
 * @param {Hapi.Server} server - The Hapi server instance.
 */
const registerDebtRoutes = (server) => {

  server.route({
    method: 'GET',
    path: '/debts',
    handler: async (request, h) => {
      try {
        const debts = await Debt.find();
        return h.response(debts).code(200);
      } catch (err) {
        console.error('Error fetching debts:', err.message);
        throw Boom.badImplementation('Could not retrieve debts');
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/debts/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().hex().length(24).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const debt = await Debt.findById(id);
        if (!debt) {
          throw Boom.notFound('Debt not found');
        }
        return h.response(debt).code(200);
      } catch (err) {
        console.error('Error fetching debt by ID:', err.message);
        if (err.isBoom) {
          throw err;
        }
        throw Boom.badImplementation('Could not retrieve debt');
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/debts',
    options: {
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          debt: Joi.number().min(0).required(),
          periodicity: Joi.string().required(),
          payment_term: Joi.number().integer().required(),
          nir: Joi.number().required(),
          aer: Joi.number().required(),
          start_date: Joi.date().iso().required(),
          insurance_rate: Joi.number().min(0).optional(),
          contractual_payment: Joi.number().min(0).required(),
          amortization: Joi.string().valid('french').optional(),
        }),
        failAction: (request, h, err) => {
          console.error('Joi Validation Error:', err.details);
          throw Boom.badRequest('Invalid request payload input', err.details);
        },
      },
    },
    handler: async (request, h) => {
      try {
        const debt = new Debt(request.payload);
        await debt.save();

        if (debt.amortization === 'french') {
          await h.request.server.inject({
            method: 'POST',
            url: `/debts/${debt._id}/calculate-amortization`,
          });
        }

        return h.response({ message: 'Debt added successfully', id: debt._id }).code(201);
      } catch (err) {
        console.error('Error adding debt:', err.message);
        throw Boom.badImplementation('Could not add debt');
      }
    },
  });

  server.route({
    method: 'PUT',
    path: '/debts/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().hex().length(24).required(),
        }),
        payload: Joi.object({
          title: Joi.string().optional(),
          debt: Joi.number().optional(),
          periodicity: Joi.string().optional(),
          payment_term: Joi.number().integer().optional(),
          nir: Joi.number().optional(),
          aer: Joi.number().optional(),
          start_date: Joi.date().iso().optional(),
          insurance_rate: Joi.number().min(0).optional(),
          contractual_payment: Joi.number().min(0).optional(),
          amortization: Joi.string().valid('french').optional(),
        }).min(1),
        failAction: (request, h, err) => {
          console.error('Joi Validation Error:', err.details);
          throw Boom.badRequest('Invalid request payload input', err.details);
        },
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const fields = request.payload;
        const updatedDebt = await Debt.findByIdAndUpdate(id, fields, { new: true });
        if (!updatedDebt) {
          throw Boom.notFound('Debt not found');
        }

        if (fields.amortization === 'french') {
          await h.request.server.inject({
            method: 'POST',
            url: `/debts/${updatedDebt._id}/calculate-amortization`,
          });
        }

        return h.response({ message: 'Debt updated successfully' }).code(200);
      } catch (err) {
        console.error('Error updating debt:', err.message);
        if (err.isBoom) {
          throw err;
        }
        throw Boom.badImplementation('Could not update debt');
      }
    },
  });

  server.route({
    method: 'DELETE',
    path: '/debts/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().hex().length(24).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const deletedDebt = await Debt.findByIdAndDelete(id);
        if (!deletedDebt) {
          throw Boom.notFound('Debt not found');
        }
        await Amortization.deleteOne({ debt_id: id });
        return h.response({ message: 'Debt deleted successfully' }).code(200);
      } catch (err) {
        console.error('Error deleting debt:', err.message);
        if (err.isBoom) {
          throw err;
        }
        throw Boom.badImplementation('Could not delete debt');
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/debts/{id}/calculate-amortization',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().hex().length(24).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const debt = await Debt.findById(id);
        if (!debt) {
          throw Boom.notFound('Debt not found');
        }

        const { debt: principal, nir, payment_term, periodicity, insurance_rate, contractual_payment } = debt;

        let periodicInterestRate;
        let numberOfPayments;

        switch (periodicity) {
          case 'monthly':
            periodicInterestRate = nir / 100 / 12;
            numberOfPayments = payment_term;
            break;
          case 'weekly':
            periodicInterestRate = nir / 100 / 52;
            numberOfPayments = payment_term;
            break;
          case 'bi-weekly':
            periodicInterestRate = nir / 100 / 26;
            numberOfPayments = payment_term;
            break;
          case 'quarterly':
            periodicInterestRate = nir / 100 / 4;
            numberOfPayments = payment_term;
            break;
          case 'annually':
            periodicInterestRate = nir / 100 / 1;
            numberOfPayments = payment_term;
            break;
          default:
            throw Boom.badImplementation('Unsupported periodicity');
        }

        let remaining_balance = principal;
        const schedule = [];

        for (let month = 1; month <= numberOfPayments; month++) {
          const interest = remaining_balance * periodicInterestRate;
          const insuranceCost = (remaining_balance * insurance_rate) / 100;
          const principal_paid = contractual_payment - interest - insuranceCost;
          remaining_balance -= principal_paid;
          schedule.push({
            month,
            interest: parseFloat(interest.toFixed(2)),
            principal: parseFloat(principal_paid.toFixed(2)),
            insurance: parseFloat(insuranceCost.toFixed(2)),
            total_payment: parseFloat(contractual_payment.toFixed(2)),
            remaining_balance: parseFloat(remaining_balance.toFixed(2)),
          });
        }

        await Amortization.findOneAndUpdate(
          { debt_id: id },
          { schedule },
          { upsert: true, new: true }
        );

        return h.response({ message: 'Amortization schedule calculated and saved successfully' }).code(200);
      } catch (err) {
        console.error('Error calculating amortization schedule:', err.message);
        if (err.isBoom) {
          throw err;
        }
        throw Boom.badImplementation('Could not calculate amortization schedule');
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/debts/{id}/amortization',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().hex().length(24).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const amortization = await Amortization.findOne({ debt_id: id });
        if (!amortization) {
          throw Boom.notFound('Amortization schedule not found for this debt.');
        }
        return h.response(amortization).code(200);
      } catch (err) {
        console.error('Error fetching amortization schedule:', err.message);
        if (err.isBoom) {
          throw err;
        }
        throw Boom.badImplementation('Could not retrieve amortization schedule');
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/global-info',
    handler: async (request, h) => {
      try {
        const globalInfo = await GlobalInfo.findOne();
        return h.response(globalInfo).code(200);
      } catch (err) {
        console.error('Error fetching global info:', err.message);
        throw Boom.badImplementation('Could not retrieve global info');
      }
    },
  });

  server.route({
    method: 'PUT',
    path: '/global-info',
    options: {
      validate: {
        payload: Joi.object({
          monthly_income: Joi.number().required(),
          max_debt_percentage: Joi.number().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { monthly_income, max_debt_percentage } = request.payload;
        await GlobalInfo.findOneAndUpdate({}, { monthly_income, max_debt_percentage }, { upsert: true });
        return h.response({ message: 'Global info updated successfully' }).code(200);
      } catch (err) {
        console.error('Error updating global info:', err.message);
        throw Boom.badImplementation('Could not update global info');
      }
    },
  });
};

module.exports = registerDebtRoutes;
