const { basename, extname } = require('path');
const { globSync } = require('glob');

const entityFiles = globSync('./src/entities/*.js');
const coreExclusions = [
  'Admin',
  'AdminPassword',
  'Setting',
  'Product',
  'Supplier',
  'InvoiceItem',
  'Purchase',
  'PurchaseItem',
  'StockLedger',
  'DeliveryItem',
];

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
