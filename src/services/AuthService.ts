import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, handleApiError } from '@/src/config/api';
import User, { LoginCredentials } from '@/src/models/User';

// Authentication service class
class AuthService {
  // Fetch all users from API
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.LIST}`,
        {
          headers: API_CONFIG.HEADERS,
          timeout: API_CONFIG.TIMEOUT
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users from API:', error);
      throw handleApiError(error);
    }
  }

  // Authenticate user with phone and password
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Fetch all users
      const users = await this.getUsers();
      console.log(`Tổng số người dùng từ API: ${users.length}`);
      
      // Tiền xử lý số điện thoại để loại bỏ khoảng trắng và ký tự đặc biệt
      const normalizedPhone = credentials.phone.replace(/\s+/g, '').trim();
      console.log(`Đang kiểm tra SĐT: '${normalizedPhone}' và mật khẩu: '${credentials.password}'`);
      
      // Log tất cả số điện thoại để kiểm tra
      users.forEach(u => {
        const userPhone = u.phone.replace(/\s+/g, '').trim();
        console.log(`User trong database: ${u.name} - SĐT: '${userPhone}'`);
      });
      
      // Find user with matching phone and password
      const user = users.find(
        (u) => {
          const userPhone = u.phone.replace(/\s+/g, '').trim();
          const phoneMatch = userPhone === normalizedPhone;
          const passwordMatch = u.password === credentials.password;
          
          if (phoneMatch) {
            console.log(`Tìm thấy số điện thoại khớp: ${u.name}`);
            if (!passwordMatch) {
              console.log(`Mật khẩu không khớp cho ${u.name} - Nhập: '${credentials.password}', Cần: '${u.password}'`);
            }
          }
          
          return phoneMatch && passwordMatch;
        }
      );
      
      if (user) {
        // Store user data in AsyncStorage
        await this.storeUserData(user);
        console.log(`Đăng nhập thành công: ${user.name}`);
        return user;
      }
      
      console.log(`Không tìm thấy người dùng phù hợp`);
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem('@slm_user_data');
      return !!userData;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Store user data in AsyncStorage
  async storeUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('@slm_user_data', JSON.stringify(user));
      await AsyncStorage.setItem('@slm_login_phone', user.phone);
      await AsyncStorage.setItem('@slm_user_name', user.name);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Update user profile information
  async updateUserProfile(userInfo: {
    email?: string | null;
    address?: string;
    idNumber?: string;
    birthDate?: string;
    gender?: string;
    avatar?: string;
  }): Promise<User | null> {
    try {
      // Get current user data
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No user data found');
      }
      
      // Update user information
      const updatedUser: User = {
        ...currentUser,
        email: userInfo.email !== undefined ? userInfo.email : currentUser.email,
        // Store additional user info in user object
        // These fields are not in the User interface, so we use type assertion
        ...(userInfo.address && { address: userInfo.address }),
        ...(userInfo.idNumber && { idNumber: userInfo.idNumber }),
        ...(userInfo.birthDate && { birthDate: userInfo.birthDate }),
        ...(userInfo.gender && { gender: userInfo.gender }),
        ...(userInfo.avatar && { avatar: userInfo.avatar }),
      };
      
      // Store updated user data
      await this.storeUserData(updatedUser);
      console.log('User profile updated successfully');
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('@slm_user_data');
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@slm_user_data');
      // Keep the phone number for convenience on next login
      // await AsyncStorage.removeItem('@slm_login_phone');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export default new AuthService(); 