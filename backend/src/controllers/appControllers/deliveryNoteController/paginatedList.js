const { AppDataSource } = require('@/typeorm-data-source');
const Model = AppDataSource.getRepository('DeliveryNote');
const clientRepository = AppDataSource.getRepository('Client');
const { In } = require('typeorm');
const { addId } = require('@/controllers/middlewaresControllers/createCRUDController/utils');

const paginatedList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;
  const { sortBy = 'id', sortValue = -1, filter, equal } = req.query;
  const columns = Model.metadata.columns.map((c) => c.propertyName);
  const orderBy = columns.includes(sortBy) ? sortBy : 'id';

  const where = {};
  if (filter && equal !== undefined) {
    where[filter] = equal;
  }

  const [result, count] = await Model.findAndCount({
    where,
    skip,
    take: limit,
    order: { [orderBy]: sortValue === -1 ? 'DESC' : 'ASC' },
  });

  const clientIds = [...new Set(result.map((r) => r.client).filter(Boolean))];
  const clients = clientIds.length
    ? await clientRepository.find({ where: { id: In(clientIds) } })
    : [];
  const clientMap = {};
  addId(clients).forEach((c) => (clientMap[c.id] = c));

  const notes = result.map((n) => ({ ...n, client: clientMap[n.client] || null }));

  const pages = Math.ceil(count / limit);
  const pagination = { page, pages, count };
  if (count > 0) {
    return res.status(200).json({
      success: true,
      result: addId(notes),
      pagination,
      message: 'Successfully found all documents',
    });
  }
  return res.status(200).json({
    success: true,
    result: [],
    pagination,
    message: 'Collection is Empty',
  });
};

module.exports = paginatedList;
