import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa các kiểu dữ liệu
interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts?: District[];
}

interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards?: Ward[];
}

interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

// Interface cho dữ liệu gửi lên API
interface PotentialCustomerData {
  agent_id: number;
  assumed_code: string;
  name: string;
  phone: string;
  gender: boolean;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  interested_in_combo_id: number | null;
  description: string;
}

// Interface cho thông tin user
interface User {
  id: number;
  name: string;
  role_id?: number;
  phone?: string;
  address?: string;
  avatar?: string;
  code?: string;
  // các thông tin khác của user
}

export default function NewContactScreen() {
  const router = useRouter();
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  
  // State cho danh sách dữ liệu
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // State cho việc hiển thị modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'province' | 'district' | 'ward' | 'gender'>('province');
  
  // ID của tỉnh/quận đã chọn
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  // State cho dữ liệu form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interestedComboId, setInterestedComboId] = useState<number>(0);
  const [assumedCode, setAssumedCode] = useState('');
  
  // State cho validation
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneTimeout, setPhoneTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // State cho thông tin user đăng nhập
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch dữ liệu user và token khi component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);
        // Lấy thông tin user từ AsyncStorage
        const userData = await AsyncStorage.getItem('@slm_user_data');
        const userName = await AsyncStorage.getItem('@slm_user_name');
        const userPhone = await AsyncStorage.getItem('@slm_login_phone');
        const userIdStr = await AsyncStorage.getItem('@slm_user_id');
        const token = await AsyncStorage.getItem('@slm_token');
        
        if (userIdStr) {
          const parsedId = parseInt(userIdStr);
          setUserId(parsedId);
          console.log(`Đã lấy ID người dùng: ${parsedId}`);
        }
        
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          if (user.id) setUserId(user.id);
          console.log('Đã lấy thông tin user từ @slm_user_data:', user);
        } else if (userIdStr && userName) {
          // Nếu không có dữ liệu đầy đủ, tạo đối tượng user từ các thông tin riêng lẻ
          const parsedId = parseInt(userIdStr);
          const user = {
            id: parsedId,
            name: userName,
            phone: userPhone || '',
          };
          setCurrentUser(user);
          console.log('Đã tạo thông tin user từ dữ liệu riêng lẻ:', user);
        } else {
          console.warn('Không tìm thấy thông tin user đã đăng nhập');
        }
        
        if (token) {
          setAuthToken(token);
          console.log('Đã lấy token xác thực');
        } else {
          console.warn('Không tìm thấy token xác thực');
          // Demo: Sử dụng token giả lập cho môi trường development
          const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwibmFtZSI6Ik5ndXnhu4VuIFRow6BuaCBUcsOhbmciLCJpYXQiOjE2OTgwMDAwMDB9.mocktoken';
          setAuthToken(mockToken);
          console.log('Đã sử dụng token giả lập cho phát triển');
          
          // Lưu token giả lập vào AsyncStorage để tránh lỗi lần sau
          await AsyncStorage.setItem('@slm_token', mockToken);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin user/token:', error);
        // Demo: Tạo dữ liệu giả lập để test
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwibmFtZSI6Ik5ndXnhu4VuIFRow6BuaCBUcsOhbmciLCJpYXQiOjE2OTgwMDAwMDB9.mocktoken';
        setAuthToken(mockToken);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Thêm kiểm tra thông tin user mỗi khi component hiển thị
  useEffect(() => {
    const checkUserId = async () => {
      // Nếu chưa có userId, thử lấy lại từ AsyncStorage
      if (!userId) {
        try {
          const userIdStr = await AsyncStorage.getItem('@slm_user_id');
          if (userIdStr) {
            const parsedId = parseInt(userIdStr);
            setUserId(parsedId);
            console.log(`Đã cập nhật ID người dùng từ AsyncStorage: ${parsedId}`);
            
            // Cập nhật currentUser nếu cần
            if (!currentUser || !currentUser.id) {
              const userName = await AsyncStorage.getItem('@slm_user_name');
              if (userName) {
                setCurrentUser({
                  id: parsedId,
                  name: userName
                });
                console.log(`Đã cập nhật thông tin user với ID: ${parsedId} và tên: ${userName}`);
              }
            }
          } else {
            console.warn('Không tìm thấy ID người dùng trong AsyncStorage');
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra ID người dùng:', error);
        }
      }
    };
    
    checkUserId();
  }, [userId, currentUser]);

  // Fetch dữ liệu tỉnh thành từ API khi component được mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Cập nhật districts khi chọn province
  useEffect(() => {
    if (selectedProvinceCode) {
      fetchDistricts(selectedProvinceCode);
    } else {
      setDistricts([]);
      setDistrict('');
    }
    // Reset district và ward selection khi province thay đổi
    setSelectedDistrictCode(null);
    setDistrict('');
    setWard('');
  }, [selectedProvinceCode]);

  // Cập nhật wards khi chọn district
  useEffect(() => {
    if (selectedDistrictCode) {
      fetchWards(selectedDistrictCode);
    } else {
      setWards([]);
      setWard('');
    }
  }, [selectedDistrictCode]);

  // Hàm fetch data tỉnh thành
  const fetchProvinces = async () => {
    try {
      console.log('Đang tải danh sách tỉnh thành...');
      const response = await fetch('https://provinces.open-api.vn/api/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Đã tải ${data.length} tỉnh thành`);
      setProvinces(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tỉnh thành:', error);
    }
  };

  // Hàm fetch data quận huyện theo tỉnh/thành
  const fetchDistricts = async (provinceCode: number) => {
    try {
      console.log(`Đang tải quận/huyện cho tỉnh có mã: ${provinceCode}`);
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dữ liệu tỉnh/thành nhận được:', data);
      
      if (data && data.districts && Array.isArray(data.districts)) {
        console.log(`Đã tải ${data.districts.length} quận/huyện`);
        setDistricts(data.districts);
      } else {
        console.warn('Không tìm thấy dữ liệu quận/huyện hoặc định dạng không đúng:', data);
        setDistricts([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu quận huyện:', error);
      setDistricts([]);
    }
  };

  // Hàm fetch data phường xã theo quận/huyện
  const fetchWards = async (districtCode: number) => {
    try {
      console.log(`Đang tải phường/xã cho quận/huyện có mã: ${districtCode}`);
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dữ liệu quận/huyện nhận được:', data);
      
      if (data && data.wards && Array.isArray(data.wards)) {
        console.log(`Đã tải ${data.wards.length} phường/xã`);
        setWards(data.wards);
      } else {
        console.warn('Không tìm thấy dữ liệu phường/xã hoặc định dạng không đúng:', data);
        setWards([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phường xã:', error);
      setWards([]);
    }
  };

  // Hàm kiểm tra số điện thoại đã tồn tại
  const checkPhoneExists = async (phone: string) => {
    try {
      setPhoneError('');
      if (!phone || phone.length < 10) {
        setPhoneError('Số điện thoại không hợp lệ');
        return true;
      }

      setIsCheckingPhone(true);
      console.log(`Đang kiểm tra số điện thoại: ${phone}`);

      // Kiểm tra token
      if (!authToken) {
        console.warn('Không có token xác thực cho API checkPhoneExists');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Thêm token nếu có
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`https://id.slmsolar.com/api/mini_admins/potential-customer/check-exist-by-phone/${phone}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Kết quả kiểm tra số điện thoại:', data);
      
      if (data && data.exist === true) {
        setPhoneError('Số điện thoại đã tồn tại trong hệ thống');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Lỗi khi kiểm tra số điện thoại:', error);
      setPhoneError('Không thể kiểm tra số điện thoại, vui lòng thử lại sau');
      return true;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Hàm debounce cho kiểm tra số điện thoại
  const debouncedCheckPhone = useCallback((phoneNumber: string) => {
    if (phoneTimeout) {
      clearTimeout(phoneTimeout);
    }

    if (phoneNumber.length >= 10) {
      setIsCheckingPhone(true);
      const timeoutId = setTimeout(() => {
        checkPhoneExists(phoneNumber);
      }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
      setPhoneTimeout(timeoutId);
    } else {
      setPhoneError(phoneNumber.length > 0 ? 'Số điện thoại phải có ít nhất 10 ký tự' : '');
      setIsCheckingPhone(false);
    }
  }, [phoneTimeout]);

  // Hàm validate form trước khi submit
  const validateForm = async () => {
    let isValid = true;
    
    // Kiểm tra số điện thoại
    if (!phoneNumber) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (phoneNumber.length < 10) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    } else if (phoneError) {
      // Nếu đã có lỗi từ việc kiểm tra realtime trước đó
      isValid = false;
    }
    
    // Kiểm tra các trường khác
    if (!fullName) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      isValid = false;
    }
    
    return isValid;
  };

  // Hàm chuẩn bị dữ liệu trước khi gửi
  const prepareSubmitData = (): PotentialCustomerData => {
    // Mặc định gender = true cho nam, false cho nữ
    const genderValue = gender === 'Nam' ? true : false;
    
    // Sử dụng occupation dưới dạng string thay vì convert sang số
    let descriptionValue = occupation || '';

    // Ưu tiên sử dụng userId từ state độc lập
    const agentId = userId || (currentUser?.id || null);

    // Đảm bảo luôn có agent_id hợp lệ
    if (!agentId) {
      console.error('Không thể xác định ID người dùng đang đăng nhập');
      // Tạo giá trị mặc định cho trường hợp khẩn cấp (khuyến cáo: chỉ sử dụng cho môi trường phát triển)
      const defaultAgentId = 9; // ID mặc định cho development
      console.warn(`Sử dụng ID mặc định: ${defaultAgentId} cho agent_id`);
      return {
        agent_id: defaultAgentId,
        assumed_code: assumedCode || 'string',
        name: fullName,
        phone: phoneNumber,
        gender: genderValue,
        email: email || '',
        address: address || '',
        province: province || '',
        district: district || '',
        ward: ward || '',
        interested_in_combo_id: null,
        description: descriptionValue
      };
    }
    
    console.log(`Đang gửi form với agent_id = ${agentId} từ user: ${currentUser?.name || 'không xác định'}`);
    
    return {
      agent_id: agentId,
      assumed_code: assumedCode || 'string',
      name: fullName,
      phone: phoneNumber,
      gender: genderValue,
      email: email || '',
      address: address || '',
      province: province || '',
      district: district || '',
      ward: ward || '',
      interested_in_combo_id: null,
      description: descriptionValue
    };
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async () => {
    // Kiểm tra token
    if (!authToken) {
      Alert.alert(
        'Lỗi xác thực',
        'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
        [
          { 
            text: 'Đăng nhập', 
            onPress: () => {
              // Xóa dữ liệu user/token cũ
              AsyncStorage.multiRemove(['@slm_user_data', '@slm_user_name', '@slm_login_phone', '@slm_user_id', '@slm_token']);
              // Điều hướng đến màn hình đăng nhập 
              router.replace('/(auth)/login');
            } 
          }
        ]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      
      if (isValid) {
        // Chuẩn bị dữ liệu
        const customerData = prepareSubmitData();
        
        console.log('Dữ liệu gửi đi:', customerData);
        // Log JSON body được gửi đi
        console.log('JSON BODY:', JSON.stringify(customerData, null, 2));
        
        // Gửi dữ liệu lên server với URL đầy đủ
        const apiUrl = 'https://id.slmsolar.com/api/agents/create-new-potential-customer';
        console.log('Gửi request đến:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(customerData),
        });
        
        if (!response.ok) {
          let errorMessage = '';
          try {
            const errorData = await response.json();
            console.error('API response error data:', errorData);
            errorMessage = errorData.message || 'Lỗi từ máy chủ';
            
            // Kiểm tra lỗi token hết hạn
            if (errorData.status === 401 || errorData.statusCode === 401 || errorMessage.includes('token')) {
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          } catch (e) {
            const errorText = await response.text();
            console.error('API response error text:', response.status, errorText);
            
            // Kiểm tra lỗi token từ status code
            if (response.status === 401) {
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            
            errorMessage = `Lỗi HTTP: ${response.status}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Kết quả từ server:', result);
        
        Alert.alert(
          'Thành công',
          'Đã gửi thông tin khách hàng thành công',
          [{ text: 'OK', onPress: () => {
            // Điều hướng về màn hình danh sách với tham số để biết cần refresh
            router.back();
          }}]
        );
      }
    } catch (error) {
      console.error('Lỗi khi gửi form:', error);
      let errorMessage = 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.';
      
      // Kiểm tra chi tiết lỗi để hiển thị thông báo phù hợp
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
        
        // Kiểm tra nếu lỗi liên quan đến token
        if (errorMessage.includes('đăng nhập') || errorMessage.includes('xác thực') || errorMessage.includes('token')) {
          Alert.alert(
            'Lỗi xác thực',
            errorMessage,
            [
              { 
                text: 'Đăng nhập lại', 
                onPress: () => {
                  // Xóa dữ liệu user/token cũ
                  AsyncStorage.multiRemove(['@slm_user_data', '@slm_user_name', '@slm_login_phone', '@slm_user_id', '@slm_token']);
                  // Điều hướng đến màn hình đăng nhập 
                  router.replace('/(auth)/login');
                } 
              }
            ]
          );
          return;
        }
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm mở modal chọn
  const openModal = (type: 'province' | 'district' | 'ward' | 'gender') => {
    setModalType(type);
    setModalVisible(true);
  };

  // Hàm xử lý khi chọn một item
  const handleSelectItem = (item: Province | District | Ward | string) => {
    if (modalType === 'province') {
      setProvince((item as Province).name);
      setSelectedProvinceCode((item as Province).code);
      console.log(`Đã chọn tỉnh/thành: ${(item as Province).name}, mã: ${(item as Province).code}`);
    } else if (modalType === 'district') {
      setDistrict((item as District).name);
      setSelectedDistrictCode((item as District).code);
      console.log(`Đã chọn quận/huyện: ${(item as District).name}, mã: ${(item as District).code}`);
    } else if (modalType === 'ward') {
      setWard((item as Ward).name);
      console.log(`Đã chọn phường/xã: ${(item as Ward).name}`);
    } else if (modalType === 'gender') {
      setGender(item as string);
      console.log(`Đã chọn giới tính: ${item}`);
    }
    setModalVisible(false);
  };

  // Danh sách giới tính
  const genderOptions = ['Nam', 'Nữ'];

  // Component renderItem cho FlatList trong Modal
  const renderLocationItem = ({ item }: { item: Province | District | Ward | string }) => (
    <TouchableOpacity 
      style={styles.modalItem} 
      onPress={() => handleSelectItem(item)}
    >
      <Text style={styles.modalItemText}>
        {modalType === 'gender' 
          ? item as string
          : (item as any).name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]} edges={['bottom']}>
      {isLoadingUser && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#EE0033" />
          <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Nhập thông tin khách hàng</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {currentUser && (
        <View style={styles.agentInfoContainer}>
          <Text style={styles.agentInfoText}>
            Đại lý: <Text style={styles.agentInfoValue}>{currentUser.name}</Text> (ID: {currentUser.id})
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingTop: 0 }}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            placeholder="Họ và tên *"
            style={styles.input}
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            placeholder="Số điện thoại *"
            style={styles.input}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              debouncedCheckPhone(text);
            }}
          />
          {isCheckingPhone && (
            <ActivityIndicator size="small" color="#EE0033" style={styles.inputSpinner} />
          )}
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => openModal('gender')}
        >
          <Ionicons name="male-female" size={20} color="#666" style={styles.inputIcon} />
          <Text style={[styles.input, !gender && styles.placeholder]}>
            {gender || 'Giới tính'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            placeholder="Số Nhà, Tên Đường"
            style={styles.input}
            placeholderTextColor="#666"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.addressRow}>
          <TouchableOpacity 
            style={[styles.inputContainer, styles.halfInput]}
            onPress={() => openModal('province')}
          >
            <Text style={[styles.input, !province && styles.placeholder]}>
              {province || 'Tỉnh/TP'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.inputContainer, styles.halfInput]}
            onPress={() => selectedProvinceCode ? openModal('district') : null}
            disabled={!selectedProvinceCode}
          >
            <Text style={[styles.input, !district && styles.placeholder]}>
              {district || 'Quận, Huyện'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => selectedDistrictCode ? openModal('ward') : null}
          disabled={!selectedDistrictCode}
        >
          <Text style={[styles.input, !ward && styles.placeholder]}>
            {ward || 'Phường, Xã'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons name="briefcase-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            placeholder="Nghề nghiệp (mã số)"
            style={styles.input}
            placeholderTextColor="#666"
            value={occupation}
            onChangeText={setOccupation}
            keyboardType="number-pad"
          />
        </View>

        <Text style={[styles.sectionTitle, styles.productTitle]}>Sản phẩm quan tâm</Text>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Tôi xác nhận thông tin đã cung cấp là chính xác và phù hợp với yêu cầu của SLM Agent App, đồng thời Xác nhận rằng Tôi đã Đọc và Chấp thuận các{' '}
            <Text style={styles.link}>Điều khoản & Điều kiện</Text>
            {' '}của ứng dụng trước khi tiến hành gửi.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal chọn */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'province' ? 'Chọn Tỉnh/Thành phố' : 
                 modalType === 'district' ? 'Chọn Quận/Huyện' : 
                 modalType === 'ward' ? 'Chọn Phường/Xã' : 'Chọn Giới tính'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={
                modalType === 'province' ? provinces : 
                modalType === 'district' ? districts : 
                modalType === 'ward' ? wards : genderOptions
              }
              renderItem={renderLocationItem}
              keyExtractor={(item, index) => 
                typeof item === 'string' ? `gender-${index}` : item.code.toString()
              }
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 0,
    marginBottom: 10,
  },
  productTitle: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  placeholder: {
    color: '#666',
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  disclaimer: {
    marginTop: 15,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EE0033',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffb3b3',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#EE0033',
    fontSize: 13,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 5,
  },
  inputSpinner: {
    marginLeft: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  agentInfoContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  agentInfoText: {
    fontSize: 14,
    color: '#666',
  },
  agentInfoValue: {
    fontWeight: '600',
    color: '#333',
  },
  // Styles cho Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalList: {
    paddingHorizontal: 15,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
}); 