import { api } from "../libs/axios";

class UserService {
    changePassword = (data) => api.put('/user-service/users/reset-password', data);
    getUserInfo = () => api.get('/user-service/auth/get-user-info');
    updateUserInfo = (data) => api.put('/user-service/auth/update-user-info', data);
    getAllUsers = () => api.get('/user-service/users/admin/get-all');
    deleteUsers = (userId) => api.delete(`/user-service/users/admin/delete/${userId}`);
}

export default new UserService();