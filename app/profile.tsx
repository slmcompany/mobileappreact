import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  
  // User info states
  const [email, setEmail] = useState('tuyphong@slm.vn');
  const [address, setAddress] = useState('Somewhere over the rainbow');
  const [idNumber, setIdNumber] = useState('1234 5678 9000');
  const [birthDate, setBirthDate] = useState('14/01/1993');
  const [gender, setGender] = useState('Nam');

  const toggleBiometric = () => {
    // Implementation of toggleBiometric function
  };

  const openEditDrawer = () => {
    setEditDrawerVisible(true);
  };

  const closeEditDrawer = () => {
    setEditDrawerVisible(false);
  };

  const saveUserInfo = () => {
    // Xử lý lưu thông tin người dùng
    closeEditDrawer();
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <View style={styles.mainContent}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ImageBackground 
            source={require('../assets/images/info_bg.png')} 
            style={styles.profileHeaderBg}
            resizeMode="cover"
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#999" />
                </View>
              </View>
              <Text style={styles.name}>Tùy Phong</Text>
              <Text style={styles.phoneNumber}>0384 123 456</Text>
            </View>

            <View style={styles.salesManagementContainer}>
              <TouchableOpacity style={styles.salesManagementButton}>
                <View style={styles.salesManagementInner}>
                  <Text style={styles.salesManagementText}>Quản lý bán hàng</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <View style={[styles.section, { 
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#eee',
            marginTop: 0,
          }]}>
            <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
            <View style={styles.editButtonContainer}>
              <Text style={styles.changeRequestText}>YÊU CẦU THAY ĐỔI</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Thông tin cá nhân</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CÀI ĐẶT</Text>
          </View>

          <View style={styles.infoSection}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(auth)/password')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Mật khẩu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Thông báo</Text>
              </View>
              <Switch
                trackColor={{ false: "#dddddd", true: "#f45b69" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#dddddd"
                onValueChange={() => setNotificationsEnabled(prev => !prev)}
                value={notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>THÔNG TIN ỨNG DỤNG</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="information-circle-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Phiên bản ứng dụng</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Điều khoản sử dụng</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="help-circle-outline" size={24} color="#666" />
                </View>
                <Text style={styles.menuLabel}>Liên hệ hỗ trợ</Text>
              </View>
              <View style={styles.chatBubbleIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#666" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Floating Header */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Edit Drawer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editDrawerVisible}
        onRequestClose={closeEditDrawer}
      >
        <Pressable 
          style={styles.drawerBackdrop}
          onPress={closeEditDrawer} 
        />
        <View style={[styles.drawerContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.drawerHandle} />
          
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Chỉnh sửa thông tin</Text>
            <TouchableOpacity onPress={closeEditDrawer}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerScrollView}>
            <View style={styles.formGroup}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Số điện thoại</Text>
                <View style={styles.fieldDisabled}>
                  <Text style={styles.fieldDisabledText}>0384 123 456</Text>
                </View>
                <Text style={styles.fieldNote}>Số điện thoại không thể thay đổi</Text>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Địa chỉ</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldTextarea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Nhập địa chỉ"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Số CCCD/Hộ chiếu</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholder="Nhập số CCCD/Hộ chiếu"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Ngày sinh</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="DD/MM/YYYY"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Giới tính</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'Nam' && styles.genderButtonActive
                    ]}
                    onPress={() => setGender('Nam')}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      gender === 'Nam' && styles.genderButtonTextActive
                    ]}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'Nữ' && styles.genderButtonActive
                    ]}
                    onPress={() => setGender('Nữ')}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      gender === 'Nữ' && styles.genderButtonTextActive
                    ]}>Nữ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.drawerActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={closeEditDrawer}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveUserInfo}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeaderBg: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
    height: '100%',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  phoneNumber: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  changeRequestText: {
    color: '#D9261C',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  chatBubbleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#7B7D9D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 15,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerScrollView: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  fieldDisabled: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  fieldDisabledText: {
    color: '#999',
  },
  fieldNote: {
    color: '#666',
    fontSize: 12,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
  },
  fieldTextarea: {
    height: 80,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#D9261C',
    borderColor: '#D9261C',
  },
  genderButtonText: {
    color: '#333',
  },
  genderButtonTextActive: {
    fontWeight: 'bold',
    color: 'white',
  },
  drawerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#D9261C',
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButtonContainer: {
    justifyContent: 'center',
  },
  salesManagementContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  salesManagementButton: {
    backgroundColor: '#F79009',
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  salesManagementInner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  salesManagementText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
  },
});

export default ProfileScreen; 