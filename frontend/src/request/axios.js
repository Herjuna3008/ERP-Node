import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import errorHandler from './errorHandler';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const auth = storePersist.get('auth');
    if (auth?.current?.token) {
      config.headers.Authorization = `Bearer ${auth.current.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(errorHandler(error))
);

export default api;
