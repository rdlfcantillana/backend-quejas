import axios from 'axios';
import { Navigate } from 'react-router-dom';

const API_URL = 'https://backend-quejas-production.up.railway.app/api/user';


// Servicio para iniciar sesión


// Función para guardar el token en localStorage
export const setToken = async (token) => {
  console.log('save token test');
  localStorage.setItem('access_token', token);
  //console.log(token)
};

// Función para obtener el token desde localStorage
export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

// Crear una instancia de axios con configuración base
export const api = axios.create({
  baseURL: API_URL,

});

// Interceptor para añadir el token en cada solicitud si existe
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('access_token'),
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};