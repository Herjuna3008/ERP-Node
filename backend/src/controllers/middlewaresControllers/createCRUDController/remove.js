const { addId, hasColumn } = require('./utils');

const remove = async (repository, req, res) => {
  try {
    let entity = await repository.findOne({ where: { id: req.params.id } });
    if (!entity) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    }
    if (hasColumn(repository, 'removed')) {
      entity.removed = true;
      const result = await repository.save(entity);
      return res.status(200).json({
        success: true,
        result: addId(result),
        message: 'Successfully Deleted the document ',
      });
    }
    await repository.delete(req.params.id);
    return res.status(200).json({
      success: true,
      result: addId(entity),
      message: 'Successfully Deleted the document ',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = remove;
