const { addId } = require('./utils');

const filter = async (repository, req, res) => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }
  try {
    const where = { removed: false, [req.query.filter]: req.query.equal };
    const result = await repository.find({ where });
    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    } else {
      return res.status(200).json({
        success: true,
        result: addId(result),
        message: 'Successfully found all documents  ',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = filter;
