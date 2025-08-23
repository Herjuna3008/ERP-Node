const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const expenseController = require('@/controllers/appControllers/expenseController');
const payrollController = require('@/controllers/appControllers/payrollController');
const rbac = require('@/middlewares/rbac');

const router = express.Router();

router
  .route('/expenses')
  .get(rbac(['owner', 'manager']), catchErrors(expenseController.list))
  .post(rbac(['owner', 'manager']), catchErrors(expenseController.create));

router
  .route('/expenses/:id')
  .get(rbac(['owner', 'manager']), catchErrors(expenseController.read))
  .patch(rbac(['owner', 'manager']), catchErrors(expenseController.update))
  .delete(rbac(['owner', 'manager']), catchErrors(expenseController.delete));

router
  .route('/payroll')
  .get(rbac(['owner', 'manager']), catchErrors(payrollController.list))
  .post(rbac(['owner', 'manager']), catchErrors(payrollController.create));

router
  .route('/payroll/:id')
  .get(rbac(['owner', 'manager']), catchErrors(payrollController.read))
  .patch(rbac(['owner', 'manager']), catchErrors(payrollController.update))
  .delete(rbac(['owner', 'manager']), catchErrors(payrollController.delete));

module.exports = router;