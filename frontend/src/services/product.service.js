import api from '@/request/axios';

export const getProducts = async (params = {}) => {
  const { data } = await api.get('products', { params });
  return data;
};

export const createProduct = async (values) => {
  const { data } = await api.post('products', values);
  return data;
};

export const updateProduct = async (id, values) => {
  const { data } = await api.patch(`products/${id}`, values);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`products/${id}`);
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`products/${id}`);
  return data;
};

