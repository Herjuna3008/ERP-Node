const recapService = require('@/services/recapService');

const generate = async (req, res) => {
  const { startDate, endDate } = req.query;
  const recapData = await recapService.generateRecapData({ startDate, endDate });
  const workbook = await recapService.buildWorkbook(recapData);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="recap.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { generate };
