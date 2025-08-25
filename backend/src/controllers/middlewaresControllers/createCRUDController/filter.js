const { addId, hasColumn } = require('./utils');

const filter = async (repository, req, res) => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }
  try {
    const where = { [req.query.filter]: req.query.equal };
    if (hasColumn(repository, 'removed')) where.removed = false;
    const result = await repository.find({ where });
    if (!result || result.length === 0) {
      return res.status(200).json({
        success: true,
        result: [],
        message: 'No document found ',
      });
    }
    return res.status(200).json({
      success: true,
      result: addId(result),
      message: 'Successfully found all documents  ',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = filter;
