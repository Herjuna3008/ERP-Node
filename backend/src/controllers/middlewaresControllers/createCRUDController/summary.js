const { hasColumn } = require('./utils');

const summary = async (repository, req, res) => {
  try {
    const baseWhere = {};
    if (hasColumn(repository, 'removed')) baseWhere.removed = false;
    const countAllDocs = await repository.count({ where: baseWhere });
    const countFilter = await repository.count({
      where: { ...baseWhere, [req.query.filter]: req.query.equal },
    });

    if (countAllDocs > 0) {
      return res.status(200).json({
        success: true,
        result: { countFilter, countAllDocs },
        message: 'Successfully count all documents',
      });
    }
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Collection is Empty',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = summary;
