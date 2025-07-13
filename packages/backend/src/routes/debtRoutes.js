'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Debt, GlobalInfo } = require('../db');

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
