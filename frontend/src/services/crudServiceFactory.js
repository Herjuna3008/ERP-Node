import { request } from '@/request';

const resolveEntity = (providedEntity, fallbackEntity) => providedEntity || fallbackEntity;

export const createCrudService = (entity) => {
  const baseEntity = entity;

  return {
    entity: baseEntity,
    list: async ({ entity: customEntity, options = {} } = {}) => {
      const resolvedEntity = resolveEntity(customEntity, baseEntity);
      return request.list({ entity: resolvedEntity, options });
    },
    read: async ({ entity: customEntity, id }) => {
      const resolvedEntity = resolveEntity(customEntity, baseEntity);
      return request.read({ entity: resolvedEntity, id });
    },
    create: async ({ entity: customEntity, jsonData, withUpload = false }) => {
      const resolvedEntity = resolveEntity(customEntity, baseEntity);
      if (withUpload) {
        return request.createAndUpload({ entity: resolvedEntity, jsonData });
      }
      return request.create({ entity: resolvedEntity, jsonData });
    },
    update: async ({ entity: customEntity, id, jsonData, withUpload = false }) => {
      const resolvedEntity = resolveEntity(customEntity, baseEntity);
      if (withUpload) {
        return request.updateAndUpload({ entity: resolvedEntity, id, jsonData });
      }
      return request.update({ entity: resolvedEntity, id, jsonData });
    },
    delete: async ({ entity: customEntity, id }) => {
      const resolvedEntity = resolveEntity(customEntity, baseEntity);
      return request.delete({ entity: resolvedEntity, id });
    },
  };
};

export default createCrudService;
