import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Linking, Image, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import AuthService from '@/services/AuthService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Function để kiểm tra môi trường web
const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, authState } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isUserNotFoundModalVisible, setIsUserNotFoundModalVisible] = useState(false);
  const [isWrongPasswordModalVisible, setIsWrongPasswordModalVisible] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);
  const [storedUserName, setStoredUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Các số điện thoại và mật khẩu mẫu
  const sampleAccounts = [
    { phone: '0964920242', password: 'slm123', name: 'Nguyễn TIến Mạnh' },
    { phone: '0966874083', password: 'slm123', name: 'Trần Bảo Ngọc' },
    { phone: '0394307569', password: 'slm123', name: 'Đỗ Thuỳ Dung' },
    { phone: '0917599966', password: 'slm123', name: 'Nguyễn Đình Linh' },
    { phone: '0969862033', password: 'slm123', name: 'Nguyễn Hoành Văn' },
    { phone: '0969663387', password: 'slm123', name: 'Lê Huy Sĩ' },
  ];
  
  useEffect(() => {
    // Kiểm tra nếu có thông tin đăng nhập đã lưu
    checkStoredLogin();
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      router.replace('/(tabs)');
    }
  }, [authState.isAuthenticated, authState.isLoading]);
  
  const checkStoredLogin = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('@slm_login_phone');
      const storedName = await AsyncStorage.getItem('@slm_user_name');
      
      if (storedPhone) {
        setHasStoredUser(true);
        setStoredUserName(storedName || storedPhone);
        setPhoneNumber(storedPhone);
      }
    } catch (error) {
      console.error('Lỗi khi đọc thông tin đăng nhập:', error);
    }
  };

  const togglePasswordVisibility = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Các hàm điều khiển modal
  const showUserNotFoundModal = () => {
    console.log('Đang hiển thị modal: User không tồn tại');
    setIsUserNotFoundModalVisible(true);
  };
  
  const hideUserNotFoundModal = () => {
    console.log('Đang ẩn modal: User không tồn tại');
    setIsUserNotFoundModalVisible(false);
  };
  
  const showWrongPasswordModal = () => {
    console.log('Đang hiển thị modal: Sai mật khẩu');
    setIsWrongPasswordModalVisible(true);
  };
  
  const hideWrongPasswordModal = () => {
    console.log('Đang ẩn modal: Sai mật khẩu');
    setIsWrongPasswordModalVisible(false);
    setPassword('slm123');
  };

  const handleLogin = async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!phoneNumber || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại và mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Đang kiểm tra đăng nhập với số điện thoại:', phoneNumber);
      
      // Kiểm tra đăng nhập với mã test
      if (phoneNumber === 'admin' && password === 'admin') {
        console.log('Đăng nhập thành công với tài khoản admin test');
        // Lưu thông tin đăng nhập giả lập
        const testUser = {
          id: 0,
          role_id: 1,
          email: null,
          password: 'admin',
          created_at: new Date().toISOString(),
          commission_rate: null,
          name: 'Admin Test',
          phone: 'admin',
          parent_id: null,
          total_commission: null,
          role: { name: 'admin', description: null, id: 1 }
        };
        await AuthService.storeUserData(testUser);
        router.replace('/(tabs)');
        return;
      }
      
      // Gọi API đăng nhập thông qua API Service
      const users = await AuthService.getUsers();
      console.log(`Đã lấy được ${users.length} người dùng từ API`);
      
      // Chuẩn hóa số điện thoại để tìm kiếm
      const normalizedPhone = phoneNumber.replace(/\s+/g, '').trim();
      
      // Tìm user phù hợp
      const user = users.find(
        (u) => {
          const userPhone = u.phone.replace(/\s+/g, '').trim();
          return userPhone === normalizedPhone && u.password === password;
        }
      );
      
      if (user) {
        // Đăng nhập thành công
        console.log(`Đăng nhập thành công với tài khoản: ${user.name}`);
        await AuthService.storeUserData(user);
        router.replace('/(tabs)');
      } else {
        // Kiểm tra xem số điện thoại có tồn tại không
        const phoneExists = users.some(u => {
          const userPhone = u.phone.replace(/\s+/g, '').trim();
          return userPhone === normalizedPhone;
        });
        
        if (phoneExists) {
          // Số điện thoại đúng, mật khẩu sai
          console.log('Số điện thoại đúng nhưng mật khẩu sai');
          showWrongPasswordModal();
        } else {
          // Số điện thoại không tồn tại
          console.log('Số điện thoại không tồn tại trong hệ thống');
          showUserNotFoundModal();
        }
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      Alert.alert('Lỗi đăng nhập', 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUser = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHasStoredUser(false);
    setPhoneNumber('');
    setPassword('');
  };

  const handleForgotPassword = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsWrongPasswordModalVisible(true);
  };
  
  const handleBiometricLogin = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Thực hiện đăng nhập tự động
    router.replace('/(tabs)');
  };

  const handleSupportCall = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL('tel:0977879291');
  };

  const handleSelectSampleAccount = (account: { phone: string; password: string }) => {
    setPhoneNumber(account.phone);
    setPassword(account.password);
    
    // Nếu đang có stored user, hãy reset nó để hiển thị input số điện thoại
    if (hasStoredUser) {
      setHasStoredUser(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Splash-screen.png')}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.formContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.loginCard}>
          <Text style={styles.heading}>Chào mừng đến với SLM</Text>
          
          {hasStoredUser ? (
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../assets/images/smartphone.png')} 
                  style={styles.inputIcon} 
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.storedUserText}>{storedUserName}</Text>
              <TouchableOpacity 
                style={styles.changeUserButton} 
                onPress={handleChangeUser}
              >
                <Text style={styles.changeUserButtonText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../assets/images/smartphone.png')} 
                  style={styles.inputIcon} 
                  resizeMode="contain"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#7B7D9D"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../assets/images/lock-2.png')} 
                style={styles.inputIcon} 
                resizeMode="contain"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#7B7D9D"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={togglePasswordVisibility}
            >
              <Ionicons 
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#7B7D9D" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
              <Ionicons name="finger-print" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPasswordButton} 
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 44) }]}>
        <Text style={styles.footerText}>© Phát triển bởi SLM Investment JSC.</Text>
      </View>

      {/* Modal thông báo tài khoản không tồn tại */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUserNotFoundModalVisible}
        onRequestClose={hideUserNotFoundModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={hideUserNotFoundModal}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            
            <View style={styles.userIconContainer}>
              <Ionicons name="close-circle" size={60} color="#ff3b30" />
            </View>
            
            <Text style={styles.modalTitle}>Tên đăng nhập không tồn tại</Text>
            
            <Text style={styles.modalMessage}>
              Vui lòng kiểm tra lại hoặc <Text style={styles.linkText}>Liên hệ Hỗ trợ</Text> để{' '}
              <Text style={styles.linkText}>Đăng ký tài khoản</Text> mới.
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.supportButton} 
                onPress={handleSupportCall}
              >
                <Text style={styles.supportButtonText}>Liên hệ Hỗ trợ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={hideUserNotFoundModal}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thông báo mật khẩu không chính xác */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWrongPasswordModalVisible}
        onRequestClose={hideWrongPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={hideWrongPasswordModal}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
            
            <View style={styles.userIconContainer}>
              <Ionicons name="warning" size={60} color="#ff9800" />
            </View>
            
            <Text style={styles.modalTitle}>Mật khẩu không chính xác</Text>
            
            <Text style={styles.modalMessage}>
              Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ nếu bạn không nhớ mật khẩu.
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.supportButton} 
                onPress={handleSupportCall}
              >
                <Text style={styles.supportButtonText}>Liên hệ Hỗ trợ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={hideWrongPasswordModal}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loginCard: {
    width: '100%',
    backgroundColor: 'rgba(39, 39, 62, 0.6)',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#27273E',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  heading: {
    fontSize: 18,
    fontFamily: 'Roboto Flex',
    color: 'white',
    marginBottom: 12,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ABACC2',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    width: '100%',
    height: '100%',
    tintColor: '#7B7D9D',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#27273E',
    fontFamily: 'Roboto Flex',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  eyeIcon: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#ED1C24',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(237, 28, 36, 0.5)',
  },
  biometricButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FF9295',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#ABACC2',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    lineHeight: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    lineHeight: 20,
  },
  storedUserText: {
    flex: 1,
    fontSize: 16,
    color: '#27273E',
    fontFamily: 'Roboto Flex',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  changeUserButton: {
    paddingHorizontal: 8,
  },
  changeUserButtonText: {
    color: '#ED1C24',
    fontSize: 14,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  userIconContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'left',
    marginBottom: 30,
    lineHeight: 22,
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#2e6db4',
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  supportButton: {
    flex: 3,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  supportButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#ED1C24',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginLeft: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 