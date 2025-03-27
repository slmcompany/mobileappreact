import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Linking, Image, Switch, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function để kiểm tra môi trường web
const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isUserNotFoundModalVisible, setIsUserNotFoundModalVisible] = useState(false);
  const [isWrongPasswordModalVisible, setIsWrongPasswordModalVisible] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);
  const [storedUserName, setStoredUserName] = useState('');
  
  useEffect(() => {
    // Kiểm tra nếu có thông tin đăng nhập đã lưu
    checkStoredLogin();
  }, []);
  
  const checkStoredLogin = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('@slm_login_phone');
      if (storedPhone) {
        setHasStoredUser(true);
        setStoredUserName(storedPhone);
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

  const handleLogin = async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Kiểm tra đăng nhập ảo với id: admin và password: admin
    if (phoneNumber === '' && password === '') { 
      // Cho phép đăng nhập trống để dễ test
      router.replace('/(tabs)');
    } else if (phoneNumber === 'admin' && password !== 'admin') {
      // Mật khẩu không chính xác
      setIsWrongPasswordModalVisible(true);
    } else if (phoneNumber !== 'admin') {
      // Tài khoản không tồn tại
      setIsUserNotFoundModalVisible(true);
    } else {
      // Đăng nhập thành công
      router.replace('/(tabs)');
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
      source={require('../assets/images/Splash-screen.png')}
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
                    source={require('../assets/images/smartphone.png')} 
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
                  source={require('../assets/images/smartphone.png')} 
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
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../assets/images/lock-2.png')} 
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
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
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
        animationType="fade"
        transparent={true}
        visible={isUserNotFoundModalVisible}
        onRequestClose={() => setIsUserNotFoundModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsUserNotFoundModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
            
            <View style={styles.userIconContainer}>
              <Image 
                source={require('../assets/images/Fail-button-icon.png')} 
                style={styles.failIcon} 
                resizeMode="contain"
              />
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
                onPress={() => setIsUserNotFoundModalVisible(false)}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thông báo mật khẩu không chính xác */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isWrongPasswordModalVisible}
        onRequestClose={() => setIsWrongPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsWrongPasswordModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
            
            <View style={styles.userIconContainer}>
              <Image 
                source={require('../assets/images/fail-pass-button-icon.png')} 
                style={styles.failIcon} 
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.modalTitle}>Mật khẩu bạn nhập không chính xác.</Text>
            
            <Text style={styles.modalMessage}>
              Vui lòng <Text style={styles.boldText}>Thử lại</Text> hoặc <Text style={styles.linkText}>Liên hệ Hỗ trợ</Text> để được
              cấp lại mật khẩu mới.
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
                onPress={() => setIsWrongPasswordModalVisible(false)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'flex-start',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  userIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  closeCircleIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
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
}); 