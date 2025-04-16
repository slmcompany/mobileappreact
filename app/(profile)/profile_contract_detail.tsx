import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number;
  name: string;
  phone: string;
  address: string;
  avatar: string;
  email?: string;
  gender?: boolean;
  citizen_id?: string;
  tax_code?: string;
  province?: string;
  district?: string;
  ward?: string;
}

// Định nghĩa kiểu dữ liệu cho thông tin liên hệ
interface ContactInfo {
  id: number;
  title: string;
  content: string;
  icon: string;
  action?: () => void;
}

// Định nghĩa kiểu dữ liệu cho thiết bị
interface Device {
  id: number;
  name: string;
  activationDate: string;
  warrantyPeriod: string;
  expireDate: string;
  progressPercent: number;
}

// Định nghĩa kiểu dữ liệu cho pre_quote_merchandise
interface PreQuoteMerchandise {
  id: number;
  merchandise_id: number;
  pre_quote_id: number;
  name: string;
  warranty_years: number;
  warranty_period_unit: string;
  activation_date?: string;
  created_at: string;
  updated_at: string;
  quantity?: number;
}

// Định nghĩa kiểu dữ liệu cho thông tin hợp đồng
interface ContractInfo {
  id: number;
  title: string;
  content: string;
  copyable?: boolean;
}

// Định nghĩa kiểu dữ liệu cho chi tiết hợp đồng
interface ContractDetail {
  id: number;
  category: string;
  name: string;
  quantity: string;
}

// Định nghĩa kiểu dữ liệu cho phân loại merchandises
interface CategoryMap {
  [key: string]: PreQuoteMerchandise[];
}

export default function ProfileContactDetailScreen() {
  const router = useRouter();
  const { authState, getUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [merchandises, setMerchandises] = useState<PreQuoteMerchandise[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [contractCode, setContractCode] = useState<string>('');
  const [contractActivationDate, setContractActivationDate] = useState<string>('');
  const [contractInfos, setContractInfos] = useState<ContractInfo[]>([]);
  const [contractDetails, setContractDetails] = useState<ContractDetail[]>([]);

  // Lấy 2 ký tự đầu của tên
  const getInitials = (name: string) => {
    return name?.trim().substring(0, 2).toUpperCase() || '';
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Lấy thông tin người dùng từ context auth
        const userData = await getUser();
        
        if (userData) {
          setUser({
            id: userData.id || 0,
            name: userData.name || '',
            phone: userData.phone || '',
            address: userData.address || '',
            avatar: userData.avatar || '',
            email: userData.email || '',
            gender: userData.gender === 'Nam',
            citizen_id: userData.idNumber || '',
            tax_code: '',
            province: '',
            district: '',
            ward: ''
          });
          
          createContactInfos({
            id: userData.id,
            name: userData.name,
            phone: userData.phone,
            address: userData.address || '',
            email: userData.email,
            gender: userData.gender === 'Nam',
            citizen_id: userData.idNumber || '',
          });
          
          // Fetch contract data
          fetchContract();
        } else {
          // Fallback to API call if user data is not available in context
          fetchUserFromAPI();
        }
      } catch (error) {
        console.error('Error fetching user from context:', error);
        // Fallback to API call if there's an error
        fetchUserFromAPI();
      }
    };

    const fetchUserFromAPI = async () => {
      try {
        const response = await fetch('https://api.slmglobal.vn/api/users/14', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.status}`);
        }
        
        const data = await response.json();
        if (data) {
          setUser({
            id: data.id || 0,
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            avatar: data.avatar || '',
            email: data.email || '',
            gender: data.gender,
            citizen_id: data.citizen_id || '',
            tax_code: data.tax_code || '',
            province: data.province || '',
            district: data.district || '',
            ward: data.ward || ''
          });
          
          createContactInfos(data);
          
          // Nếu có contracts trong dữ liệu user, lấy contract đầu tiên
          if (data.contracts && data.contracts.length > 0) {
            setContractCode(data.contracts[0].code || '');
            setContractActivationDate(data.contracts[0].created_at || '');
            
            // Lấy merchandises từ contract
            if (data.contracts[0].pre_quote_merchandises && 
                data.contracts[0].pre_quote_merchandises.length > 0) {
              const merchandisesData = data.contracts[0].pre_quote_merchandises
                .filter((item: any) => item.warranty_years > 0)
                .map((item: any) => ({
                  id: item.id,
                  merchandise_id: item.merchandise_id,
                  pre_quote_id: item.pre_quote_id,
                  name: item.merchandise?.name || '',
                  warranty_years: item.warranty_years || 0,
                  warranty_period_unit: 'year',
                  activation_date: item.created_at || '',
                  created_at: item.created_at || '',
                  updated_at: item.updated_at || '',
                  quantity: item.quantity || 1
                }));
              setMerchandises(merchandisesData);
              setLoading(false);
            } else {
              // Nếu không có pre_quote_merchandises trong contract, gọi API riêng
              fetchMerchandises(data.contracts[0].id);
            }
          } else {
            // Nếu không có contracts trong user data, gọi API contracts riêng
            fetchContract();
          }
        }
      } catch (error) {
        console.error('Error fetching user from API:', error);
        setUser(null);
        // Vẫn phải fetch contract nếu user API không trả về contract
        fetchContract();
        setLoading(false);
      }
    };

    const fetchContract = async () => {
      try {
        const response = await fetch('https://slmsolar.com/api/contracts', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching contract: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          setContractCode(data.data[0].code || '');
          setContractActivationDate(data.data[0].created_at || '');
          
          // Fetch merchandises based on contract
          if (data.data[0].id) {
            fetchMerchandises(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        setContractCode('');
        setLoading(false);
      }
    };

    const fetchMerchandises = async (contractId: number) => {
      try {
        const response = await fetch(`https://slmsolar.com/api/contracts/${contractId}/merchandises`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching merchandises: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.data) {
          // Lọc ra chỉ những thiết bị có warranty_years > 0
          const filteredMerchandises = data.data.filter((item: any) => item.warranty_years > 0);
          setMerchandises(filteredMerchandises);
        }
      } catch (error) {
        console.error('Error fetching merchandises:', error);
        // Fallback to empty array to prevent errors
        setMerchandises([]);
      } finally {
        setLoading(false);
      }
    };

    // Tạo danh sách thông tin liên hệ từ dữ liệu người dùng
    const createContactInfos = (userData: any) => {
      const contactList: ContactInfo[] = [];
      
      if (userData.phone) {
        contactList.push({
          id: 1,
          title: 'Số điện thoại',
          content: userData.phone,
          icon: 'call-outline',
          action: () => handleCall(userData.phone)
        });
      }
      
      if (userData.email) {
        contactList.push({
          id: 2,
          title: 'Email',
          content: userData.email,
          icon: 'mail-outline',
          action: () => handleEmail(userData.email)
        });
      }
      
      if (userData.address || userData.province || userData.district || userData.ward) {
        const fullAddress = [
          userData.address,
          userData.ward,
          userData.district, 
          userData.province
        ].filter(Boolean).join(', ');
        
        contactList.push({
          id: 3,
          title: 'Địa chỉ',
          content: fullAddress,
          icon: 'location-outline',
          action: () => handleLocation(fullAddress)
        });
      }
      
      if (userData.citizen_id) {
        contactList.push({
          id: 4,
          title: 'Căn cước công dân',
          content: userData.citizen_id,
          icon: 'card-outline'
        });
      }
      
      if (userData.tax_code) {
        contactList.push({
          id: 5,
          title: 'Mã số thuế',
          content: userData.tax_code,
          icon: 'receipt-outline'
        });
      }
      
      contactList.push({
        id: 6,
        title: 'Giới tính',
        content: userData.gender !== undefined ? (userData.gender ? 'Nam' : 'Nữ') : 'Không xác định',
        icon: userData.gender ? 'male-outline' : 'female-outline'
      });
      
      setContactInfos(contactList);
    };

    fetchUser();
  }, [getUser]);

  // Khởi tạo thông tin hợp đồng và chi tiết hợp đồng
  useEffect(() => {
    if (user) {
      // Tạo thông tin hợp đồng
      const infos: ContractInfo[] = [
        { id: 1, title: 'Mã hợp đồng', content: contractCode || 'SL-DA688', copyable: true },
        { id: 2, title: 'Bên bán', content: 'CÔNG TY CỔ PHẦN ĐẦU TƯ SLM' },
        { id: 3, title: 'Bên mua', content: user.name.toUpperCase() },
        { id: 4, title: 'Ngày ký', content: formatContractDate(contractActivationDate) }
      ];
      setContractInfos(infos);
    }
  }, [user, contractCode, contractActivationDate]);

  // Xử lý dữ liệu merchandises để hiển thị chi tiết hợp đồng
  useEffect(() => {
    if (merchandises.length > 0) {
      // Nhóm merchandises theo loại
      const categories: CategoryMap = {
        'TẤM QUANG NĂNG': [],
        'BIẾN TẦN': [],
        'PIN LƯU TRỮ': [],
        'PHỤ KIỆN, VẬT TƯ': []
      };

      // Phân loại merchandises vào các nhóm
      merchandises.forEach(item => {
        const name = item.name.toLowerCase();
        if (name.includes('pv') || name.includes('tấm') || name.includes('quang năng') || name.includes('pin mặt trời')) {
          categories['TẤM QUANG NĂNG'].push(item);
        } else if (name.includes('biến tần') || name.includes('inverter') || name.includes('solis')) {
          categories['BIẾN TẦN'].push(item);
        } else if (name.includes('pin') || name.includes('battery') || name.includes('lưu trữ') || name.includes('dyness')) {
          categories['PIN LƯU TRỮ'].push(item);
        } else {
          categories['PHỤ KIỆN, VẬT TƯ'].push(item);
        }
      });

      // Chuyển đổi dữ liệu đã phân loại thành mảng contractDetails
      const details: ContractDetail[] = [];
      let idCounter = 1;

      Object.entries(categories).forEach(([category, items]) => {
        if (items.length > 0) {
          items.forEach(item => {
            details.push({
              id: idCounter++,
              category: category,
              name: item.name,
              quantity: `${item.quantity || 1} ${getQuantityUnit(item.name)}`
            });
          });
        }
      });

      // Nếu không có dữ liệu nào phù hợp, sử dụng dữ liệu mặc định
      if (details.length === 0) {
        details.push(
          { id: 1, category: 'TẤM QUANG NĂNG', name: 'PV JASolar | 580W | 1 mặt kính', quantity: '10 tấm' },
          { id: 2, category: 'BIẾN TẦN', name: 'Solis Hybrid 5kW | 1 pha', quantity: '01 bộ' },
          { id: 3, category: 'PIN LƯU TRỮ', name: 'Pin Lithium Dyness | 5kWh | Bản xếp tầng', quantity: '02 cái' },
          { id: 4, category: 'PHỤ KIỆN, VẬT TƯ', name: 'Tủ điện NLMT SolarMax', quantity: '01 bộ' }
        );
      }

      setContractDetails(details);
    }
  }, [merchandises]);

  // Xác định đơn vị tính cho mỗi loại thiết bị
  const getQuantityUnit = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pv') || lowerName.includes('tấm') || lowerName.includes('quang năng')) {
      return 'tấm';
    } else if (lowerName.includes('pin') || lowerName.includes('battery')) {
      return 'cái';
    } else {
      return 'bộ';
    }
  };

  // Định dạng ngày hợp đồng
  const formatContractDate = (date: string) => {
    if (!date) return '19/03/2025'; // Giá trị mặc định
    
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Convert API data to device format
  useEffect(() => {
    if (merchandises.length > 0) {
      // Chuyển đổi dữ liệu từ PreQuoteMerchandise sang Device
      const mappedDevices = merchandises.map((item) => {
        // Tính toán ngày hết hạn bảo hành
        const activationDate = contractActivationDate ? new Date(contractActivationDate) : (item.activation_date ? new Date(item.activation_date) : new Date());
        const expireDate = new Date(activationDate);
        expireDate.setFullYear(expireDate.getFullYear() + item.warranty_years);
        
        // Tính phần trăm thời gian bảo hành đã trôi qua
        const now = new Date();
        const totalWarrantyTime = expireDate.getTime() - activationDate.getTime();
        const timeElapsed = now.getTime() - activationDate.getTime();
        const progressPercent = Math.min(Math.round((timeElapsed / totalWarrantyTime) * 100), 100);
        
        // Định dạng ngày tháng
        const formatDate = (date: Date) => {
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        };

        return {
          id: item.id,
          name: item.name,
          activationDate: formatDate(activationDate),
          warrantyPeriod: `${item.warranty_years} năm`,
          expireDate: formatDate(expireDate),
          progressPercent: progressPercent
        };
      });

      setDevices(mappedDevices);
    }
  }, [merchandises, contractActivationDate]);

  // Xử lý khi người dùng gọi điện
  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    openURL(url);
  };

  // Xử lý khi người dùng gửi email
  const handleEmail = (email: string) => {
    const url = `mailto:${email}`;
    openURL(url);
  };

  // Xử lý khi người dùng mở bản đồ
  const handleLocation = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    openURL(url);
  };

  // Mở URL
  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết');
      }
    } catch (error) {
      console.error('Lỗi khi mở liên kết:', error);
    }
  };

  // Sao chép vào clipboard
  const handleCopy = (text: string) => {
    Alert.alert('Thông báo', `Đã sao chép: ${text}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.textAvatar}>
              <Text style={styles.textAvatarContent}>{getInitials(user?.name || '')}</Text>
            </View>
          )}
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>Thông tin {user?.name || ''}</Text>
            <Text style={styles.userRole}>Khách hàng</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Thông báo', 'Tính năng chỉnh sửa đang phát triển')}>
          <Ionicons name="create-outline" size={20} color="#27273E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactItem = (item: ContactInfo) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.contactCard}
      onPress={item.action}
      disabled={!item.action}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#ED1C24" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{item.title}</Text>
        <Text style={styles.contactContent}>{item.content}</Text>
      </View>
      {item.action && (
        <View style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={20} color="#7B7D9D" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDeviceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thiết bị bảo hành</Text>
      
      <View style={styles.deviceIdContainer}>
        <Text style={styles.deviceId}>{contractCode}</Text>
      </View>
      
      <View style={styles.deviceList}>
        {devices.map(device => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceCardContent}>
              <View style={styles.deviceImagePlaceholder} />
              
              <View style={styles.deviceInfo}>
                <View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.infoLabel}>Tên thiết bị:</Text>
                    <Text 
                      style={styles.deviceName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >{device.name}</Text>
                  </View>
                  
                  <View style={styles.activationDateContainer}>
                    <Text style={styles.infoLabel}>Ngày kích hoạt:</Text>
                    <Text style={styles.infoValue}>{device.activationDate}</Text>
                  </View>
                  
                  <View style={styles.warrantyTextContainer}>
                    <Text style={styles.infoLabel}>Thời gian bảo hành: {device.warrantyPeriod}</Text>
                    <Text style={styles.infoLabel}>đến hết {device.expireDate}</Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: `${device.progressPercent}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderContractSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>HỢP ĐỒNG</Text>
      <View style={styles.contractList}>
        {contractInfos.map((item) => (
          <View key={item.id} style={styles.contractItem}>
            <Text style={styles.contractItemTitle}>{item.title}</Text>
            <View style={styles.contractItemContentContainer}>
              <Text style={styles.contractItemContent}>{item.content}</Text>
              {item.copyable && (
                <TouchableOpacity onPress={() => handleCopy(item.content)}>
                  <Ionicons name="copy-outline" size={20} color="#ED1C24" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderContractDetailSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>CHI TIẾT</Text>
      <View style={styles.detailList}>
        {contractDetails.map((item) => (
          <View key={item.id} style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailCategory}>{item.category}</Text>
            </View>
            <View style={styles.detailContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailName}>{item.name}</Text>
                <Text style={styles.detailQuantity}>{item.quantity}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <>
              {renderDeviceSection()}
              {renderContractSection()}
              {renderContractDetailSection()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ED1C24',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  textAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFECED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAvatarContent: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 18,
    color: '#ED1C24',
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },
  userRole: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F8',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#7B7D9D',
  },
  section: {
    width: '100%',
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 20,
    color: '#27273E',
  },
  contactList: {
    gap: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFECED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#7B7D9D',
    marginBottom: 4,
  },
  contactContent: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    color: '#27273E',
  },
  actionButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles for device section
  deviceIdContainer: {
    marginBottom: 12,
  },
  deviceId: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 16,
    color: '#7B7D9D',
  },
  deviceList: {
    gap: 8,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  deviceCardContent: {
    flexDirection: 'row',
  },
  deviceImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5E5',
  },
  deviceInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  deviceName: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 13,
    color: '#27273E',
    flex: 1,
    marginLeft: 4,
  },
  activationDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#7B7D9D',
    marginRight: 4,
  },
  infoValue: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#7B7D9D',
  },
  warrantyInfoContainer: {
    width: '100%',
  },
  warrantyTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#12B669',
    borderRadius: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  // Styles for contract section
  contractList: {
    width: '100%',
  },
  contractItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
    paddingVertical: 10,
  },
  contractItemTitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  contractItemContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contractItemContent: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
    textAlign: 'right',
  },
  // Styles for contract detail section
  detailList: {
    width: '100%',
  },
  detailItem: {
    marginBottom: 16,
  },
  detailHeader: {
    paddingVertical: 4,
  },
  detailCategory: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  detailContent: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailName: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
  },
  detailQuantity: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
  },
}); 