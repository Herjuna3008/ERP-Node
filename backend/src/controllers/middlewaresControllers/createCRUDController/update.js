const { addId } = require('./utils');

const update = async (repository, req, res) => {
  try {
    req.body.removed = false;
    let entity = await repository.findOne({
      where: { id: req.params.id, removed: false },
    });
    if (!entity) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    }
    repository.merge(entity, req.body);
    const result = await repository.save(entity);
    return res.status(200).json({
      success: true,
      result: addId(result),
      message: 'we update this document ',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = update;
