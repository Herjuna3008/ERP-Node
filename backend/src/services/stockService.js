const { AppDataSource } = require('@/typeorm-data-source');
const { adjustStock } = require('@/utils/stock');

const productRepository = AppDataSource.getRepository('Product');

const getLow = async () => {
  return productRepository
    .createQueryBuilder('p')
    .where('p.removed = false')
    .andWhere('p.stock < p.minStock')
    .getMany();
};

const adjust = async ({ productId, quantity }) => {
  return adjustStock({ productId, quantity });
};

module.exports = { getLow, adjust };
