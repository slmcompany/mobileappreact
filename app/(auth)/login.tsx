import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Linking, Image, Switch, ImageBackground, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/context/AuthContext';
import AuthService from '@/src/services/AuthService';

// Function để kiểm tra môi trường web
const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const { login, authState } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isUserNotFoundModalVisible, setIsUserNotFoundModalVisible] = useState(false);
  const [isWrongPasswordModalVisible, setIsWrongPasswordModalVisible] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);
  const [storedUserName, setStoredUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <ImageBackground 
      source={require('../../assets/images/Splash-screen.png')}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.loginCard}>
          <Text style={styles.subheading}>Chào mừng đến với SLM</Text>
          
          {hasStoredUser ? (
            <View style={styles.storedUserContainer}>
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
                style={styles.inputWithIcon}
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
              style={styles.inputWithIcon}
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
          
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© SLM Agent được phát triển bởi SLM Co., Ltd.</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    width: '100%',
    height: '100%',
    tintColor: '#7B7D9D',
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    paddingLeft: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 5,
    marginBottom: 15,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#D9261C',
    borderRadius: 5,
    padding: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  forgotPasswordText: {
    color: '#ABACC2',
    fontSize: 14,
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    color: 'white',
    fontSize: 12,
  },
  // Styles cho modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
  boldText: {
    fontWeight: 'bold',
    color: '#666',
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
    backgroundColor: '#D9261C',
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
  storedUserContainer: {
    width: '100%',
    marginBottom: 15,
  },
  storedUserText: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    color: '#333',
  },
  changeUserButton: {
    padding: 12,
  },
  changeUserButtonText: {
    color: '#D9261C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  failIcon: {
    width: '100%',
    height: '100%',
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255, 59, 48, 0.5)',
  },
  warningIcon: {
    width: '100%',
    height: '100%',
  },
  demoAccountContainer: {
    display: 'none',
  },
  demoAccountTitle: {
    display: 'none',
  },
  demoAccountsList: {
    display: 'none',
  },
  demoAccountItem: {
    display: 'none',
  },
  demoAccountText: {
    display: 'none',
  },
  demoAccountName: {
    display: 'none',
  },
  debugContainer: {
    display: 'none',
  },
  debugButton: {
    display: 'none',
  },
  debugButtonText: {
    display: 'none',
  },
}); 