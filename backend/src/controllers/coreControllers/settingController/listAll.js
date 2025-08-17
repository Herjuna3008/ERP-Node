const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Setting');

const listAll = async (req, res) => {
  const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC';

  const result = await Model.find({
    where: { removed: false, isPrivate: false },
    order: { created: sort },
  });

  if (result.length > 0) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
