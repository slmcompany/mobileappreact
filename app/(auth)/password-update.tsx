import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PasswordUpdateScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  const handleUpdate = () => {
    // Check if new password meets requirements
    const isValid = Object.values(isPasswordValid).every(value => value === true);
    
    // Check if new password and confirm password match
    const passwordsMatch = newPassword === confirmPassword;
    
    if (isValid && passwordsMatch) {
      // Update password logic here
      console.log('Password updated successfully');
      router.back();
    } else {
      console.log('Password validation failed');
      // Show error message
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
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={toggleShowCurrentPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={handleNewPasswordChange}
            />
            <TouchableOpacity onPress={toggleShowNewPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.visibilityToggle}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Cập nhật</Text>
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
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  visibilityToggle: {
    padding: 12,
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
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PasswordUpdateScreen; 