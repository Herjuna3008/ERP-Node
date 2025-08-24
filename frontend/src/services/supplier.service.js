import api from '@/request/axios';

export const getSuppliers = async () => {
  const { data } = await api.get('suppliers');
  return data;
};

export const createSupplier = async (values) => {
  const { data } = await api.post('suppliers', values);
  return data;
};

export const updateSupplier = async (id, values) => {
  const { data } = await api.patch(`suppliers/${id}`, values);
  return data;
};

export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`suppliers/${id}`);
  return data;
};
