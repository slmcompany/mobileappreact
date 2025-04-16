import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { globalStyles } from '@/src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonalInformationScreen = () => {
  const insets = useSafeAreaInsets();
  const { authState, getUser } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // Thêm useState cho các thông tin cá nhân
  const [name, setName] = useState(authState.user?.name || '');
  const [phone, setPhone] = useState(authState.user?.phone || '');
  const [email, setEmail] = useState(authState.user?.email || '');
  const [birthDate, setBirthDate] = useState(authState.user?.birthDate || '');
  const [gender, setGender] = useState(authState.user?.gender || '');
  const [idNumber, setIdNumber] = useState(authState.user?.idNumber || '');
  const [issueDate, setIssueDate] = useState(authState.user?.issueDate || '');
  const [issuePlace, setIssuePlace] = useState(authState.user?.issuePlace || '');
  const [address, setAddress] = useState(authState.user?.address || '');

  // Lấy thông tin người dùng khi component được tạo
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUser();
        console.log('User data from API:', userData);
        
        if (userData) {
          setName(userData.name || '');
          setPhone(userData.phone || '');
          setEmail(userData.email || '');
          setBirthDate(userData.birthDate || '');
          setGender(userData.gender || '');
          setIdNumber(userData.idNumber || '');
          setIssueDate(userData.issueDate || '');
          setIssuePlace(userData.issuePlace || '');
          setAddress(userData.address || '');
          
          // Lấy avatar từ dữ liệu user nếu có
          if (userData.avatar) {
            setUserAvatar(userData.avatar);
          } else {
            // Kiểm tra avatar trong AsyncStorage
            const storedAvatar = await AsyncStorage.getItem('@slm_user_avatar');
            if (storedAvatar) {
              setUserAvatar(storedAvatar);
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };
    
    fetchUserData();
  }, [getUser]);

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

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={[globalStyles.text, styles.infoLabel]}>{label}</Text>
      <Text style={[globalStyles.text, styles.infoValue]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#27273E" />
        </TouchableOpacity>
        <Text style={[globalStyles.text, styles.headerTitle]}>Thông tin cá nhân</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image 
                source={{ uri: userAvatar }}
                style={styles.avatar}
                defaultSource={require('../../assets/images/replace-holder.png')}
              />
            ) : (
              <Image 
                source={require('../../assets/images/replace-holder.png')}
                style={styles.avatar}
              />
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#22272F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <InfoItem 
            label="Họ và tên"
            value={name}
          />
          <InfoItem 
            label="Số điện thoại"
            value={formatPhoneNumber(phone)}
          />
          <InfoItem 
            label="Email"
            value={email}
          />
          <InfoItem 
            label="Ngày sinh"
            value={birthDate}
          />
          <InfoItem 
            label="Giới tính"
            value={gender}
          />
          <InfoItem 
            label="Số CCCD/Hộ chiếu"
            value={idNumber}
          />
          <InfoItem 
            label="Ngày cấp"
            value={issueDate}
          />
          <InfoItem 
            label="Nơi cấp"
            value={issuePlace}
          />
          <InfoItem 
            label="Địa chỉ liên hệ"
            value={address}
          />
        </View>

        {/* Change Request Button */}
        <TouchableOpacity 
          style={styles.changeRequestButton}
          onPress={() => router.push('/(profile)/profile')}
        >
          <Text style={[globalStyles.text, styles.changeRequestText]}>YÊU CẦU THAY ĐỔI</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#27273E',
    marginRight: 28,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ED1C24',
  },
  infoSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
    lineHeight: 20,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  changeRequestButton: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFECED',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  changeRequestText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ED1C24',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PersonalInformationScreen; 