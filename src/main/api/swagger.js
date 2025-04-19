const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyBudgetManager API',
      version: '1.0.0',
      description: 'API documentation for MyBudgetManager - A privacy-focused budget management tool',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        BankAccount: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            branch: { type: 'string' },
            currency: { type: 'string' },
            initial_balance: { type: 'number' },
            color: { type: 'string' },
            notes: { type: 'string' }
          }
        },
        CreditCard: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
            issuer: { type: 'string' },
            card_number: { type: 'string' },
            limit: { type: 'number' },
            billing_day: { type: 'integer' },
            currency: { type: 'string' },
            bank_account_id: { type: 'integer' },
            color: { type: 'string' },
            notes: { type: 'string' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            date: { type: 'string', format: 'date' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            description: { type: 'string' },
            category_id: { type: 'integer' },
            account_id: { type: 'integer' },
            card_id: { type: 'integer' },
            is_recurring: { type: 'boolean' },
            is_unplanned: { type: 'boolean' },
            is_entitlement: { type: 'boolean' },
            notes: { type: 'string' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
            color: { type: 'string' },
            icon: { type: 'string' },
            parent_id: { type: 'integer' }
          }
        },
        Investment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            purchase_date: { type: 'string', format: 'date' },
            current_value: { type: 'number' },
            linked_saving_goal_id: { type: 'integer' },
            linked_business_id: { type: 'integer' },
            notes: { type: 'string' }
          }
        },
        SavingGoal: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            target_amount: { type: 'number' },
            currency: { type: 'string' },
            target_date: { type: 'string', format: 'date' },
            current_amount: { type: 'number' },
            status: { type: 'string' },
            notes: { type: 'string' }
          }
        },
        Loan: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            interest_rate: { type: 'number' },
            term_months: { type: 'integer' },
            start_date: { type: 'string', format: 'date' },
            due_date: { type: 'string', format: 'date' },
            bank_account_id: { type: 'integer' },
            notes: { type: 'string' }
          }
        },
        Insurance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
            provider: { type: 'string' },
            policy_number: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            frequency: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            bank_account_id: { type: 'integer' },
            notes: { type: 'string' }
          }
        },
        Business: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string' },
            registration_number: { type: 'string' },
            tax_id: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            currency: { type: 'string' },
            notes: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/main/api/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
}; 