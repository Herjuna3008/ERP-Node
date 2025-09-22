import { request } from '@/request';

const entityName = 'purchaseinvoice/stock-to-buy';

const stockToBuyService = {
  entity: entityName,
  list: async ({ options = {} } = {}) => {
    const page = Number(options.page) || 1;
    const pageSize = Number(options.items) || 10;
    const response = await request.get({ entity: entityName });

    if (response?.success) {
      let records = Array.isArray(response.result) ? [...response.result] : [];

      if (options.filter === 'product' && options.equal) {
        records = records.filter((item) => String(item.productId) === String(options.equal));
      }

      const start = (page - 1) * pageSize;
      const paginated = records.slice(start, start + pageSize);

      return {
        ...response,
        result: paginated,
        pagination: {
          page,
          count: records.length,
        },
      };
    }

    return response;
  },
};

export default stockToBuyService;
