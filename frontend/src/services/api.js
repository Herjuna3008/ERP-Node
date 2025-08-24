import axios from 'axios';
import http from '@/request/axios';
import successHandler from '@/request/successHandler';

export async function create({ entity, jsonData }) {
  try {
    const response = await http.post(entity + '/create', jsonData);
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function createAndUpload({ entity, jsonData }) {
  try {
    const response = await http.post(entity + '/create', jsonData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function read({ entity, id }) {
  try {
    const response = await http.get(entity + '/read/' + id);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function update({ entity, id, jsonData }) {
  try {
    const response = await http.patch(entity + '/update/' + id, jsonData);
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function updateAndUpload({ entity, id, jsonData }) {
  try {
    const response = await http.patch(entity + '/update/' + id, jsonData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function remove({ entity, id }) {
  try {
    const response = await http.delete(entity + '/delete/' + id);
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function filter({ entity, options = {} }) {
  try {
    let filter = options.filter ? 'filter=' + options.filter : '';
    let equal = options.equal ? '&equal=' + options.equal : '';
    let query = `?${filter}${equal}`;
    const response = await http.get(entity + '/filter' + query);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: false,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function search({ entity, options = {} }) {
  try {
    let query = '?';
    for (var key in options) {
      query += key + '=' + options[key] + '&';
    }
    query = query.slice(0, -1);
    const response = await http.get(entity + '/search' + query);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: false,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function list({ entity, options = {} }) {
  try {
    let query = '?';
    for (var key in options) {
      query += key + '=' + options[key] + '&';
    }
    query = query.slice(0, -1);
    const response = await http.get(entity + '/list' + query);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: false,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function listAll({ entity, options = {} }) {
  try {
    let query = '?';
    for (var key in options) {
      query += key + '=' + options[key] + '&';
    }
    query = query.slice(0, -1);
    const response = await http.get(entity + '/listAll' + query);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: false,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function post({ entity, jsonData }) {
  try {
    const response = await http.post(entity, jsonData);
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function get({ entity }) {
  try {
    const response = await http.get(entity);
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function patch({ entity, jsonData }) {
  try {
    const response = await http.patch(entity, jsonData);
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function upload({ entity, id, jsonData }) {
  try {
    const response = await http.patch(entity + '/upload/' + id, jsonData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export function source() {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  return source;
}

export async function summary({ entity, options = {} }) {
  try {
    let query = '?';
    for (var key in options) {
      query += key + '=' + options[key] + '&';
    }
    query = query.slice(0, -1);
    const response = await http.get(entity + '/summary' + query);
    successHandler(response, {
      notifyOnSuccess: false,
      notifyOnFailed: false,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function mail({ entity, jsonData }) {
  try {
    const response = await http.post(entity + '/mail/', jsonData);
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function convert({ entity, id }) {
  try {
    const response = await http.post(`${entity}/${id}/convert`, {});
    successHandler(response, {
      notifyOnSuccess: true,
      notifyOnFailed: true,
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

const api = {
  create,
  createAndUpload,
  read,
  update,
  updateAndUpload,
  remove,
  filter,
  search,
  list,
  listAll,
  post,
  get,
  patch,
  upload,
  source,
  summary,
  mail,
  convert,
};

export default api;

