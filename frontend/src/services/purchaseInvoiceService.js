import { request } from '@/request';
import { createCrudService } from './crudServiceFactory';

const baseService = createCrudService('purchaseinvoice');

const purchaseInvoiceService = {
  ...baseService,
  list: async ({ entity, options = {} } = {}) => {
    const resolvedEntity = entity || baseService.entity;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.items) || Number(options.take) || 10;
    const skip = Number.isFinite(options.skip) ? Number(options.skip) : (page - 1) * pageSize;
    const take = Number.isFinite(options.take) ? Number(options.take) : pageSize;
    const queryOptions = { skip, take };

    if (options.status) {
      queryOptions.status = options.status;
    }
    if (options.supplier) {
      queryOptions.supplier = options.supplier;
    }

    const response = await request.list({ entity: resolvedEntity, options: queryOptions });

    if (response?.success) {
      const total = Number(response.totalCount ?? response.pagination?.count ?? 0);
      const pagination = {
        page,
        count: total || response.result?.length || 0,
      };
      return { ...response, pagination };
    }

    return response;
  },
};

export default purchaseInvoiceService;
