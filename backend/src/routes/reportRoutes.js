const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const reportController = require('@/controllers/reportController');

const router = express.Router();

router.get('/reports/summary', catchErrors(reportController.summary));
router.get('/reports/ar-aging', catchErrors(reportController.arAging));
router.get('/reports/analytics', catchErrors(reportController.analytics));

module.exports = router;
