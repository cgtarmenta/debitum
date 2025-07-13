/**
 * @typedef {object} Debt
 * @property {number} id - Unique identifier for the debt.
 * @property {string} title - Title or name of the debt.
 * @property {number} debt - Total amount of the debt.
 * @property {string} periodicity - How often payments are made (e.g., 'monthly', 'weekly').
 * @property {number} payment_term - Number of periods over which the debt is paid.
 * @property {number} nir - Nominal Interest Rate (as a percentage).
 * @property {number} aer - Annual Equivalent Rate (as a percentage).
 */

/**
 * @typedef {object} GlobalInfo
 * @property {number} id - Unique identifier for global info (should be 1).
 * @property {number} monthly_income - User's monthly income.
 * @property {number} max_debt_percentage - Maximum percentage of income to spend on debt.
 */

const Joi = require('joi');
const Boom = require('@hapi/boom');

/**
 * Registers debt-related routes with the Hapi server.
 * @param {Hapi.Server} server - The Hapi server instance.
 * @param {sqlite3.Database} db - The SQLite database instance.
 */
const registerDebtRoutes = (server, db) => {

  /**
   * @api {get} /debts Get all debts
   * @apiName GetDebts
   * @apiGroup Debts
   * @apiSuccess {Debt[]} debts List of debt objects.
   * @apiError (Error 500) InternalServerError Could not retrieve debts.
   */
  server.route({
    method: 'GET',
    path: '/debts',
    handler: async (request, h) => {
      try {
        const debts = await db.all('SELECT * FROM debts');
        return h.response(debts).code(200);
      } catch (err) {
        console.error('Error fetching debts:', err.message);
        throw Boom.badImplementation('Could not retrieve debts');
      }
    },
  });

  /**
   * @api {post} /debts Add a new debt
   * @apiName AddDebt
   * @apiGroup Debts
   * @apiParam {string} title Title of the debt.
   * @apiParam {number} debt Total amount of the debt.
   * @apiParam {string} periodicity How often payments are made.
   * @apiParam {number} payment_term Number of periods over which the debt is paid.
   * @apiParam {number} nir Nominal Interest Rate.
   * @apiParam {number} aer Annual Equivalent Rate.
   * @apiSuccess {object} message Success message.
   * @apiError (Error 400) BadRequest Invalid input data.
   * @apiError (Error 500) InternalServerError Could not add debt.
   */
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
        const { title, debt, periodicity, payment_term, nir, aer, start_date } = request.payload;
        await db.run(
          'INSERT INTO debts (title, debt, periodicity, payment_term, nir, aer, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [title, debt, periodicity, payment_term, nir, aer, start_date]
        );
        return h.response({ message: 'Debt added successfully' }).code(201);
      } catch (err) {
        console.error('Error adding debt:', err.message);
        throw Boom.badImplementation('Could not add debt');
      }
    },
  });

  /**
   * @api {put} /debts/:id Update a debt
   * @apiName UpdateDebt
   * @apiGroup Debts
   * @apiParam {number} id Debt ID.
   * @apiParam {string} [title] Title of the debt.
   * @apiParam {number} [debt] Total amount of the debt.
   * @apiParam {string} [periodicity] How often payments are made.
   * @apiParam {number} [payment_term] Number of periods over which the debt is paid.
   * @apiParam {number} [nir] Nominal Interest Rate.
   * @apiParam {number} [aer] Annual Equivalent Rate.
   * @apiSuccess {object} message Success message.
   * @apiError (Error 400) BadRequest Invalid input data.
   * @apiError (Error 404) NotFound Debt not found.
   * @apiError (Error 500) InternalServerError Could not update debt.
   */
  server.route({
    method: 'PUT',
    path: '/debts/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          title: Joi.string().optional(),
          debt: Joi.number().optional(),
          periodicity: Joi.string().optional(),
          payment_term: Joi.number().integer().optional(),
          nir: Joi.number().optional(),
          aer: Joi.number().optional(),
          start_date: Joi.date().iso().optional(),
        }).min(1), // At least one field must be provided for update
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
        const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
        const values = Object.values(fields);

        if (values.length === 0) {
          throw Boom.badRequest('No fields provided for update');
        }

        const result = await db.run(
          `UPDATE debts SET ${setClause} WHERE id = ?`,
          [...values, id]
        );

        if (result.changes === 0) {
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

  /**
   * @api {delete} /debts/:id Delete a debt
   * @apiName DeleteDebt
   * @apiGroup Debts
   * @apiParam {number} id Debt ID.
   * @apiSuccess {object} message Success message.
   * @apiError (Error 404) NotFound Debt not found.
   * @apiError (Error 500) InternalServerError Could not delete debt.
   */
  server.route({
    method: 'DELETE',
    path: '/debts/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const result = await db.run('DELETE FROM debts WHERE id = ?', id);
        if (result.changes === 0) {
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

  /**
   * @api {get} /global-info Get global financial information
   * @apiName GetGlobalInfo
   * @apiGroup GlobalInfo
   * @apiSuccess {GlobalInfo} globalInfo Global financial information object.
   * @apiError (Error 500) InternalServerError Could not retrieve global info.
   */
  server.route({
    method: 'GET',
    path: '/global-info',
    handler: async (request, h) => {
      try {
        const globalInfo = await db.get('SELECT * FROM global_info WHERE id = 1');
        return h.response(globalInfo).code(200);
      } catch (err) {
        console.error('Error fetching global info:', err.message);
        throw Boom.badImplementation('Could not retrieve global info');
      }
    },
  });

  /**
   * @api {put} /global-info Update global financial information
   * @apiName UpdateGlobalInfo
   * @apiGroup GlobalInfo
   * @apiParam {number} monthly_income User's monthly income.
   * @apiParam {number} max_debt_percentage Maximum percentage of income to spend on debt.
   * @apiSuccess {object} message Success message.
   * @apiError (Error 400) BadRequest Invalid input data.
   * @apiError (Error 500) InternalServerError Could not update global info.
   */
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
        await db.run(
          'UPDATE global_info SET monthly_income = ?, max_debt_percentage = ? WHERE id = 1',
          [monthly_income, max_debt_percentage]
        );
        return h.response({ message: 'Global info updated successfully' }).code(200);
      } catch (err) {
        console.error('Error updating global info:', err.message);
        throw Boom.badImplementation('Could not update global info');
      }
    },
  });
};

module.exports = registerDebtRoutes;
