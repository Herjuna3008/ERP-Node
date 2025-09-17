const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const productController = require('@/controllers/masterData/productController');
const supplierController = require('@/controllers/masterData/supplierController');
const purchaseController = require('@/controllers/masterData/purchaseController');
const stockLedgerController = require('@/controllers/masterData/stockLedgerController');
const stockController = require('@/controllers/masterData/stockController');
const rbac = require('@/middlewares/rbac');

const router = express.Router();

router
  .route('/products')
  .get(rbac(['owner', 'manager']), catchErrors(productController.list))
  .post(rbac(['owner', 'manager']), catchErrors(productController.create));

router
  .route('/products/:id')
  .get(rbac(['owner', 'manager']), catchErrors(productController.read))
  .patch(rbac(['owner', 'manager']), catchErrors(productController.update))
  .delete(rbac(['owner', 'manager']), catchErrors(productController.delete));

router
  .route('/suppliers')
  .get(rbac(['owner', 'manager']), catchErrors(supplierController.list))
  .post(rbac(['owner', 'manager']), catchErrors(supplierController.create));

router
  .route('/suppliers/:id')
  .get(rbac(['owner', 'manager']), catchErrors(supplierController.read))
  .patch(rbac(['owner', 'manager']), catchErrors(supplierController.update))
  .delete(rbac(['owner', 'manager']), catchErrors(supplierController.delete));

router
  .route('/purchases')
  .get(rbac(['owner', 'manager']), catchErrors(purchaseController.list))
  .post(rbac(['owner', 'manager']), catchErrors(purchaseController.create));

router
  .route('/purchases/:id')
  .get(rbac(['owner', 'manager']), catchErrors(purchaseController.read))
  .patch(rbac(['owner', 'manager']), catchErrors(purchaseController.update))
  .delete(rbac(['owner', 'manager']), catchErrors(purchaseController.delete));

router
  .route('/stock-ledger')
  .get(rbac(['owner', 'manager']), catchErrors(stockLedgerController.list));

router
  .route('/stocks/low')
  .get(rbac(['owner', 'manager']), catchErrors(stockController.low));

router
  .route('/stocks/adjust')
  .post(rbac(['owner', 'manager']), catchErrors(stockController.adjust));
  
module.exports = router; 
