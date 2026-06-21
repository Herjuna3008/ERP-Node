const { basename, extname } = require('path');
const { globSync } = require('glob');

const entityFiles = globSync('./src/entities/*.js');
// Entities that must NOT get an auto-wired action-suffix CRUD route:
// - Admin/AdminPassword/Setting: core/admin surface, handled by coreApi.
// - PurchaseInvoiceItem: a real relation managed only via PurchaseInvoice (cascade); it has no
//   standalone REST surface (the old purchaseInvoiceItemController was removed — HANDOVER bug H).
const coreExclusions = ['Admin', 'AdminPassword', 'Setting', 'PurchaseInvoiceItem'];

const constrollersList = [];
const entityList = [];
const routesList = [];

for (const filePath of entityFiles) {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(extname(fileNameWithExtension), '');
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toUpperCase());
  if (coreExclusions.includes(modelName)) continue;
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(firstChar, firstChar.toLowerCase());
  const entity = fileNameWithoutExtension.toLowerCase();
  const controllerName = fileNameLowerCaseFirstChar + 'Controller';
  constrollersList.push(controllerName);
  entityList.push(entity);
  routesList.push({ entity, modelName, controllerName });
}

module.exports = { constrollersList, entityList, routesList };
