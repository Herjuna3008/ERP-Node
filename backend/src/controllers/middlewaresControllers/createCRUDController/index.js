const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');
const paginatedList = require('./paginatedList');

const createCRUDController = (repository) => {
  return {
    create: (req, res) => create(repository, req, res),
    read: (req, res) => read(repository, req, res),
    update: (req, res) => update(repository, req, res),
    delete: (req, res) => remove(repository, req, res),
    list: (req, res) => paginatedList(repository, req, res),
    listAll: (req, res) => listAll(repository, req, res),
    search: (req, res) => search(repository, req, res),
    filter: (req, res) => filter(repository, req, res),
    summary: (req, res) => summary(repository, req, res),
  };
};

module.exports = createCRUDController;
