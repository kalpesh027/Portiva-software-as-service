import apiClient from './apiClient';

const UserService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (payload) => apiClient.put('/user/profile', payload),
  updatePassword: (payload) => apiClient.put('/user/password', payload),
  deleteAccount: () => apiClient.delete('/user/account'),
};

export default UserService;
