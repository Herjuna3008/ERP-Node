const paginatedList = async (repository, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'id', sortValue = -1, filter, equal } = req.query;
  const columns = repository.metadata.columns.map((c) => c.propertyName);
  const orderBy = columns.includes(sortBy) ? sortBy : 'id';
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

  try {
    const qb = repository
      .createQueryBuilder('model')
      .where('model.removed = :removed', { removed: false });

    if (filter && equal !== undefined) {
      qb.andWhere(`model.${filter} = :equal`, { equal });
    }

    if (fieldsArray.length && req.query.q) {
      const where = fieldsArray.map((f) => `model.${f} LIKE :q`).join(' OR ');
      qb.andWhere(`(${where})`, { q: `%${req.query.q}%` });
    }

    qb.orderBy(`model.${orderBy}`, sortValue == -1 ? 'DESC' : 'ASC');
    qb.skip(skip).take(limit);

    const [result, count] = await qb.getManyAndCount();
    const pages = Math.ceil(count / limit);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = paginatedList;
