const recapService = require('@/services/recapService');

const generate = async (req, res) => {
  const { startDate, endDate, format } = req.query;
  const recapData = await recapService.generateRecapData({ startDate, endDate });

  const wantsJson =
    (format && format.toLowerCase() === 'json') ||
    req.headers?.accept?.includes('application/json');

  if (wantsJson) {
    return res
      .status(200)
      .json({ success: true, result: recapData, message: 'Recap data generated' });
  }

  const workbook = await recapService.buildWorkbook(recapData);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="recap.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { generate };
