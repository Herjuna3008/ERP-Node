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

module.exports = { addId };

