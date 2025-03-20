import api from './api';


//fetch all users
export const getAllUsers = () => {
  return api.get('/users');
};  
//fetch user by id
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};




