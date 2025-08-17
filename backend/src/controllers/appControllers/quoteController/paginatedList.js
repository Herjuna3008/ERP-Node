const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('Quote');

const paginatedList = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;
  const { sortBy = 'enabled', sortValue = -1, filter, equal } = req.query;

  const where = { removed: false };
  if (filter && equal !== undefined) {
    where[filter] = equal;
  }

  const [result, count] = await Model.findAndCount({
    where,
    skip,
    take: limit,
    order: { [sortBy]: sortValue === -1 ? 'DESC' : 'ASC' },
  });
  // Calculating total pages
  const pages = Math.ceil(count / limit);

  // Getting Pagination Object
  const pagination = { page, pages, count };
  if (count > 0) {
    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    });
  }
};

module.exports = paginatedList;
