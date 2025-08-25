const { addId, hasColumn } = require('./utils');

const search = async (repository, req, res) => {
  const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['name'];
  const qb = repository.createQueryBuilder('model');
  if (hasColumn(repository, 'removed')) {
    qb.where('model.removed = :removed', { removed: false });
  } else {
    qb.where('1 = 1');
  }

  if (req.query.q && req.query.q.trim() !== '') {
    const where = fieldsArray.map((f) => `model.${f} LIKE :q`).join(' OR ');
    qb.andWhere(`(${where})`, { q: `%${req.query.q}%` });
  }

  const results = await qb.limit(20).getMany();

  if (results.length >= 1) {
    return res.status(200).json({
      success: true,
      result: addId(results),
      message: 'Successfully found all documents',
    });
  }
  return res.status(200).json({
    success: true,
    result: [],
    message: 'No document found by this request',
  });
};

module.exports = search;
