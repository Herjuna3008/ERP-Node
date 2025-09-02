const { AppDataSource } = require('@/typeorm-data-source');
const { In, LessThan } = require('typeorm');

const ProductRepository = AppDataSource.getRepository('Product');
const InvoiceRepository = AppDataSource.getRepository('Invoice');

const getAlerts = async () => {
  const lowStockProducts = await ProductRepository.createQueryBuilder('product')
    .where('product.removed = false')
    .andWhere('product.stock < product.minStock')
    .getMany();

  const overdueInvoices = await InvoiceRepository.find({
    where: {
      removed: false,
      paymentStatus: In(['UNPAID', 'PARTIAL']),
      expiredDate: LessThan(new Date()),
    },
  });

  return { lowStockProducts, overdueInvoices };
};

module.exports = { getAlerts };
