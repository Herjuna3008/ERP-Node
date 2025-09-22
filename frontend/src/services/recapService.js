import { request } from '@/request';

const entityName = 'reports/recap';

const recapService = {
  entity: entityName,
  download: async ({ startDate, endDate } = {}) => {
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    const response = await request.get({ entity: entityName, options, responseType: 'blob' });
    return response;
  },
};

export default recapService;
