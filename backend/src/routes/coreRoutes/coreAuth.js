const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

router.route('/login').post(loginLimiter, catchErrors(adminAuth.login));

router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

module.exports = router;
