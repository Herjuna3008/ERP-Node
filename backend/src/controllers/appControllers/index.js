const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { routesList } = require('@/models/utils');
const { AppDataSource } = require('@/typeorm-data-source');

const { globSync } = require('glob');
const path = require('path');

const pattern = './src/controllers/appControllers/*/**/';
const controllerDirectories = globSync(pattern).map((filePath) => {
  return path.basename(filePath);
});

const appControllers = () => {
  const controllers = {};
  const hasCustomControllers = [];

  controllerDirectories.forEach((controllerName) => {
    try {
      const customController = require('@/controllers/appControllers/' + controllerName);

      if (customController) {
        hasCustomControllers.push(controllerName);
        controllers[controllerName] = customController;
      }
    } catch (err) {
      err.message = `${controllerName}: ${err.message}`;
      throw err;
    }
  });

  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      const repository = AppDataSource.getRepository(modelName);
      controllers[controllerName] = createCRUDController(repository);
    }
  });

  return controllers;
};

module.exports = appControllers();
