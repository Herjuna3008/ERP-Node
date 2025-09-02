const dashboardService = require('@/services/dashboardService');

const alerts = async (req, res) => {
  const result = await dashboardService.getAlerts();
  return res.status(200).json({
    success: true,
    result,
    message: 'Dashboard alerts retrieved successfully',
  });
};

module.exports = { alerts };
