import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, handleApiError } from '@/src/config/api';
import User, { LoginCredentials } from '@/src/models/User';

// Authentication service class
class AuthService {
  // Fetch all users from API
  async getUsers(): Promise<User[]> {
    try {
      // Sử dụng fetch thay vì axios để tránh lỗi mạng
      const response = await fetch('https://api.slmglobal.vn/api/users', {
        method: 'GET',
        headers: API_CONFIG.HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as User[];
    } catch (error) {
      console.error('Error fetching users from API:', error);
      return []; // Trả về mảng rỗng thay vì dữ liệu mặc định
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
        // Lấy thông tin user chi tiết từ API
        try {
          const response = await fetch(`https://api.slmglobal.vn/api/users/${user.id}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const userDetail = await response.json();
            console.log('User detail from API:', userDetail);
            if (userDetail.role) {
              user.role = userDetail.role;
              console.log('Updated user role:', user.role);
            }
          }
        } catch (error) {
          console.error('Error fetching user detail:', error);
        }
        
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
      console.log('Storing user data:', user);
      console.log('User role:', user.role);
      
      // Lưu toàn bộ user data
      await AsyncStorage.setItem('@slm_user_data', JSON.stringify(user));
      await AsyncStorage.setItem('@slm_login_phone', user.phone);
      await AsyncStorage.setItem('@slm_user_name', user.name);
      
      // Lưu riêng role data
      if (user.role) {
        console.log('Storing role data:', user.role);
        await AsyncStorage.setItem('@slm_user_role', JSON.stringify(user.role));
      }
      
      if ('avatar' in user) {
        await AsyncStorage.setItem('@slm_user_avatar', (user as any).avatar);
      }
      
      // Verify stored data
      const storedUser = await AsyncStorage.getItem('@slm_user_data');
      const storedRole = await AsyncStorage.getItem('@slm_user_role');
      console.log('Stored user data:', storedUser);
      console.log('Stored role data:', storedRole);
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
      console.log('Raw user data from AsyncStorage:', userData);
      
      if (userData) {
        const user = JSON.parse(userData) as User;
        console.log('Parsed user data:', user);
        
        // Lấy role data mới từ API
        try {
          console.log('Fetching fresh role data for user ID:', user.id);
          const response = await fetch(`https://api.slmglobal.vn/api/users/${user.id}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const freshData = await response.json();
            console.log('Fresh data from API:', freshData);
            
            if (freshData.role) {
              console.log('Updating role with fresh data:', freshData.role);
              user.role = freshData.role;
              
              // Cập nhật lại AsyncStorage với role mới
              await AsyncStorage.setItem('@slm_user_role', JSON.stringify(freshData.role));
              await AsyncStorage.setItem('@slm_user_data', JSON.stringify(user));
              console.log('Updated user data in AsyncStorage');
            }
          } else {
            console.error('API response not ok:', response.status);
          }
        } catch (error) {
          console.error('Error fetching fresh role data:', error);
          // Nếu không lấy được từ API, thử lấy từ AsyncStorage
          const roleData = await AsyncStorage.getItem('@slm_user_role');
          console.log('Fallback role data from AsyncStorage:', roleData);
          if (roleData) {
            user.role = JSON.parse(roleData);
          }
        }
        
        console.log('Final user data to return:', user);
        return user;
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