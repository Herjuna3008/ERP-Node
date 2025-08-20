const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Quote');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

const read = async (req, res) => {
  // Find document by id
  const result = await Model.findOne({ where: { id: req.params.id, removed: false } });
  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success response
    return res.status(200).json({
      success: true,
      result: addId(result),
      message: 'we found this document ',
    });
  }
};

module.exports = read;
