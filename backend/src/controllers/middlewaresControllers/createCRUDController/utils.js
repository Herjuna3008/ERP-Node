// Helper utilities for CRUD controllers

/**
 * Adds a Mongo style `_id` field to the provided entity or array of entities.
 * This keeps backward compatibility with frontend components that expect
 * objects to expose both `id` and `_id` properties.
 *
 * @param {object|object[]} entity - The entity or list of entities returned from the database.
 * @returns {object|object[]} - The entity/entities with an `_id` field.
 */
function addId(entity) {
  if (Array.isArray(entity)) {
    return entity.map((e) => addId(e));
  }

  if (entity && typeof entity === 'object') {
    return { ...entity, _id: entity.id };
  }

  return entity;
}

/**
 * Checks if the provided TypeORM repository contains a specific column.
 *
 * Some legacy entities in this project do not implement the `removed`
 * column used for soft deletes. Generic CRUD helpers need to know if the
 * column exists before referencing it in queries.
 *
 * @param {import('typeorm').Repository} repository - TypeORM repository instance
 * @param {string} column - Column name to look for
 * @returns {boolean} True when the column exists on the entity
 */
function hasColumn(repository, column) {
  return repository.metadata.columns.some((c) => c.propertyName === column);
}

module.exports = { addId, hasColumn };

