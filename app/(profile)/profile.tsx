import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { AuthState } from '@/src/models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SectionKey = 'home' | 'news' | 'products' | 'about';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { logout, authState, updateUser, getUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  
  // User info states
  const [email, setEmail] = useState(authState.user?.email || '');
  const [address, setAddress] = useState(authState.user?.address || '');
  const [idNumber, setIdNumber] = useState(authState.user?.idNumber || '');
  const [birthDate, setBirthDate] = useState(authState.user?.birthDate || '');
  const [gender, setGender] = useState(authState.user?.gender || '');
  const [name, setName] = useState(authState.user?.name || '');
  const [phone, setPhone] = useState(authState.user?.phone || '');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    home: false,
    news: false,
    products: false,
    about: false
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Lấy thông tin người dùng khi component được tạo
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUser();
        console.log('User data from API:', userData);
        console.log('Role data:', userData?.role);
        console.log('Role description:', userData?.role?.description);
        console.log('Role ID:', userData?.role_id);
        
        if (userData) {
          setEmail(userData.email || '');
          setAddress(userData.address || '');
          setIdNumber(userData.idNumber || '');
          setBirthDate(userData.birthDate || '');
          setGender(userData.gender || '');
          setName(userData.name || '');
          setPhone(userData.phone || '');
          
          // Lấy avatar từ dữ liệu user nếu có
          if (userData.avatar) {
            setUserAvatar(userData.avatar);
            // Lưu avatar vào AsyncStorage
            await AsyncStorage.setItem('@slm_user_avatar', userData.avatar);
          } else {
            // Kiểm tra avatar trong AsyncStorage
            const storedAvatar = await AsyncStorage.getItem('@slm_user_avatar');
            if (storedAvatar) {
              setUserAvatar(storedAvatar);
            }
          }
          
          // Cập nhật role nếu có
          if (userData.role) {
            console.log('Updating role:', userData.role);
            // Lưu role vào AsyncStorage
            await AsyncStorage.setItem('@slm_user_role', JSON.stringify(userData.role));
            console.log('Role saved to AsyncStorage');
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };
    
    fetchUserData();
  }, [getUser]);

  // Thêm console.log để kiểm tra authState
  useEffect(() => {
    console.log('Current authState:', authState);
    console.log('Current role:', authState.user?.role);
    console.log('Current role description:', authState.user?.role?.description);
    console.log('Current role_id:', authState.user?.role_id);
    
    // Kiểm tra AsyncStorage
    const checkAsyncStorage = async () => {
      const roleData = await AsyncStorage.getItem('@slm_user_role');
      const roleId = await AsyncStorage.getItem('@slm_user_role_id');
      console.log('Role from AsyncStorage:', roleData ? JSON.parse(roleData) : null);
      console.log('Role ID from AsyncStorage:', roleId);
    };
    checkAsyncStorage();
  }, [authState]);

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/login');
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  // Format số điện thoại theo dạng xxx.xxx.xxxx
  const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    // Loại bỏ tất cả các ký tự không phải số
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Nếu không đủ 10 số, trả về số gốc
    if (cleaned.length !== 10) return phoneNumber;
    
    // Format theo xxx.xxx.xxxx
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <ImageBackground 
            source={require('../../assets/images/info_bg.png')} 
            style={styles.headerBackground}
          >
            <TouchableOpacity 
              style={[styles.backButton, { marginTop: insets.top }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {userAvatar ? (
                  <Image 
                    source={{ uri: userAvatar }}
                    style={styles.avatar}
                    defaultSource={require('../../assets/images/avatar.png')}
                  />
                ) : (
                  <Image 
                    source={require('../../assets/images/avatar.png')}
                    style={styles.avatar}
                  />
                )}
              </View>
              <Text style={styles.name}>{name || ''}</Text>
              <Text style={styles.phone}>{formatPhoneNumber(phone) || ''}</Text>
            </View>

            <View style={styles.roleContainer}>
              <TouchableOpacity style={styles.roleButton}>
                <View style={styles.roleButtonContent}>
                  <Text style={styles.agentLevel}>
                    {authState.user?.role?.description || 
                     (authState.user?.role_id ? `ROLE ID: ${authState.user.role_id}` : 'CUSTOMER')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
              <TouchableOpacity onPress={() => setEditDrawerVisible(true)}>
                <Text style={styles.changeRequestText}>YÊU CẦU THAY ĐỔI</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(profile)/personal-information')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-circle-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Thông tin cá nhân</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
            </TouchableOpacity>

            {/* Tài khoản thụ hưởng - Chỉ hiển thị cho các role khác khách hàng (role_id != 3) */}
            {authState.user?.role_id !== 3 && (
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="card-outline" size={24} color="#7B7D9D" />
                  </View>
                  <Text style={styles.menuLabel}>Tài khoản thụ hưởng</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
              </TouchableOpacity>
            )}

            {/* Hợp đồng của bạn - Chỉ hiển thị cho các role khác khách hàng (role_id != 3) */}
            {authState.user?.role_id !== 3 && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile_contract')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="phone-portrait-outline" size={24} color="#7B7D9D" />
                  </View>
                  <Text style={styles.menuLabel}>Hợp đồng của bạn</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
              </TouchableOpacity>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CÀI ĐẶT</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/password')}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Mật khẩu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Thông báo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
            </View>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG TIN ỨNG DỤNG</Text>
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="information-circle-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Phiên bản ứng dụng</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Điều khoản sử dụng</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="help-circle-outline" size={24} color="#7B7D9D" />
                </View>
                <Text style={styles.menuLabel}>Liên hệ hỗ trợ</Text>
              </View>
              <View style={styles.chatBubbleIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#7B7D9D" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="log-out-outline" size={24} color="#D92D20" />
                </View>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editDrawerVisible}
        onRequestClose={() => setEditDrawerVisible(false)}
      >
        <Pressable 
          style={styles.drawerBackdrop}
          onPress={() => setEditDrawerVisible(false)} 
        />
        <View style={[styles.drawerContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.drawerHandle} />
          
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Chỉnh sửa thông tin</Text>
            <TouchableOpacity onPress={() => setEditDrawerVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerScrollView}>
            <View style={styles.formGroup}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Số điện thoại</Text>
                <View style={styles.fieldDisabled}>
                  <Text style={styles.fieldDisabledText}>{formatPhoneNumber(phone) || ''}</Text>
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
              onPress={() => setEditDrawerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={async () => {
                try {
                  await updateUser({
                    email,
                    address,
                    idNumber,
                    birthDate,
                    gender
                  });
                  Alert.alert('Thành công', 'Thông tin đã được cập nhật');
                  setEditDrawerVisible(false);
                } catch (error) {
                  Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
                }
              }}
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
    backgroundColor: '#F5F5F8',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: 280,
  },
  headerBackground: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  phone: {
    fontSize: 12,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  roleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  roleButton: {
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentLevel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
  },
  changeRequestText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F04437',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F8',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  versionText: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  chatBubbleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFECED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F8',
    backgroundColor: '#7B7D9D',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
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
    backgroundColor: '#ED1C24',
    borderColor: '#ED1C24',
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
    backgroundColor: '#ED1C24',
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submenuContainer: {
    backgroundColor: '#F8F8FA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
  },
  submenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  submenuText: {
    fontSize: 14,
    color: '#27273E',
    fontWeight: '400',
  },
});

export default ProfileScreen; 