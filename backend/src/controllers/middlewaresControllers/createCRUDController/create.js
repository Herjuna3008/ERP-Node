const { addId, hasColumn } = require('./utils');

const create = async (repository, req, res) => {
  try {
    if (hasColumn(repository, 'removed') && req.body.removed === undefined) {
      req.body.removed = false;
    }
    const entity = repository.create({ ...req.body });
    const result = await repository.save(entity);
    return res.status(200).json({
      success: true,
      result: addId(result),
      message: 'Successfully Created the document in Model ',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

  module.exports = create;
