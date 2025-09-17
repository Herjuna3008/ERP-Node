const { addId, hasColumn } = require('./utils');

const read = async (repository, req, res) => {
  try {
    const where = { id: req.params.id };
    if (hasColumn(repository, 'removed')) where.removed = false;
    const result = await repository.findOne({ where });
    if (!result) {
      // Return a 200 response with a friendly message instead of 404
      return res.status(200).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    } else {
      return res.status(200).json({
        success: true,
        result: addId(result),
        message: 'we found this document ',
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

module.exports = read;
