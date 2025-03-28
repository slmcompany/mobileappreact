import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import authService from '@/services/AuthService';

const PasswordUpdateScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [isPasswordValid, setIsPasswordValid] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Check password validation on change
  const validatePassword = (password: string) => {
    setIsPasswordValid({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Update password and validation when new password changes
  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    validatePassword(text);
    setNewPasswordError('');
  };

  const toggleShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      // Reset errors
      setCurrentPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');

      // Check if new password meets requirements
      const isValid = Object.values(isPasswordValid).every(value => value === true);
      
      // Check if new password and confirm password match
      const passwordsMatch = newPassword === confirmPassword;

      if (!isValid) {
        setNewPasswordError('Mật khẩu phải có ít nhất 8 ký tự, chứa cả chữ hoa, chữ thường và ký tự đặc biệt');
        return;
      }

      if (!passwordsMatch) {
        setConfirmPasswordError('Mật khẩu không trùng khớp');
        return;
      }

      // Validate current password
      const isCurrentPasswordValid = await authService.checkCurrentPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        setCurrentPasswordError('Mật khẩu không đúng');
        return;
      }
      
      // Update password
      const success = await authService.updatePassword(currentPassword, newPassword);
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Thay đổi mật khẩu thành công',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: Platform.OS === 'ios' ? 50 : 30,
          onHide: () => router.back()
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Vui lòng thử lại sau',
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: Platform.OS === 'ios' ? 50 : 30,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật mật khẩu</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Mật khẩu cần đáp ứng các yêu cầu sau:</Text>
        
        <View style={styles.requirementsList}>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={isPasswordValid.length ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={isPasswordValid.length ? "#00A86B" : "#888"} 
            />
            <Text style={[styles.requirementText, isPasswordValid.length && styles.validRequirement]}>
              Ít nhất 8 ký tự
            </Text>
          </View>
          
          <View style={styles.requirementItem}>
            <Ionicons 
              name={isPasswordValid.uppercase && isPasswordValid.lowercase && isPasswordValid.number && isPasswordValid.special ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={isPasswordValid.uppercase && isPasswordValid.lowercase && isPasswordValid.number && isPasswordValid.special ? "#00A86B" : "#888"} 
            />
            <Text style={[styles.requirementText, (isPasswordValid.uppercase && isPasswordValid.lowercase && isPasswordValid.number && isPasswordValid.special) && styles.validRequirement]}>
              Chứa cả chữ hoa, chữ thường, số và ký tự đặc biệt
            </Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={[styles.passwordInputContainer, currentPasswordError && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setCurrentPasswordError('');
              }}
            />
            {currentPassword.length > 0 && (
              <TouchableOpacity onPress={() => setCurrentPassword('')} style={styles.visibilityToggle}>
                <Ionicons name="close" size={22} color={currentPasswordError ? "#ED1C24" : "#666"} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleShowCurrentPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {currentPasswordError ? (
            <Text style={styles.errorText}>{currentPasswordError}</Text>
          ) : null}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={[styles.passwordInputContainer, newPasswordError && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={handleNewPasswordChange}
            />
            {newPassword.length > 0 && (
              <TouchableOpacity onPress={() => setNewPassword('')} style={styles.visibilityToggle}>
                <Ionicons name="close" size={22} color={newPasswordError ? "#ED1C24" : "#666"} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleShowNewPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {newPasswordError ? (
            <Text style={styles.errorText}>{newPasswordError}</Text>
          ) : null}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <View style={[styles.passwordInputContainer, confirmPasswordError && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
            />
            {confirmPassword.length > 0 && (
              <TouchableOpacity onPress={() => setConfirmPassword('')} style={styles.visibilityToggle}>
                <Ionicons name="close" size={22} color={confirmPasswordError ? "#ED1C24" : "#666"} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity 
          style={[
            styles.updateButton,
            (!currentPassword || !newPassword || !confirmPassword || isLoading) && styles.updateButtonDisabled
          ]} 
          onPress={handleUpdate}
          disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
        >
          <Text style={styles.updateButtonText}>CẬP NHẬT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholderView: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  requirementsList: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  validRequirement: {
    color: '#00A86B',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#ED1C24',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#27273E',
  },
  visibilityToggle: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ED1C24',
    marginTop: 4,
  },
  bottomActions: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  updateButton: {
    backgroundColor: '#D9261C',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#FF9295',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PasswordUpdateScreen; 