import React, { useState, useRef, Fragment, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text as RNText, Image, SafeAreaView, Platform, StatusBar, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { 
  Text, 
  Button,
  Flex, 
  WhiteSpace, 
  WingBlank,
} from '@ant-design/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSectors } from '@/src/hooks/useSector';
import { Sector, Combo } from '@/src/models/sector';
import ContentGallery from '@/app/components/ContentGallery';
import HomeAgentCTA from '@/app/components/home_agent_cta';

// Interface cho banner
interface BannerImage {
  id: number;
  link: string;
  banner_id: number;
  created_at: string | null;
}

interface Banner {
  id: number;
  title: string;
  slug: string;
  location: string;
  created_at: string | null;
  sector_id: number;
  banner_images: BannerImage[];
}

// Định nghĩa interface cho user để sửa lỗi linter
interface User {
  id?: number;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  code?: string;
  role_id?: number;
}

// Định nghĩa interface cho commission
interface Commission {
  id: number;
  created_at: string;
  paid: boolean;
  seller: number;
  money: number;
  sector_id: number;
  contract_id: number | null;
  sector: any;
  contract: any;
}

interface MonthlyCommission {
  month: number;
  commissions: Commission[];
}

// Định nghĩa kiểu dữ liệu cho thiết bị
interface Device {
  id: number;
  name: string;
  activationDate: string;
  warrantyPeriod: string;
  expireDate: string;
  progressPercent: number;
  imageUrl?: string;
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
  merchandise?: {
    id: number;
    name: string;
    images?: Array<{
      id: number;
      merchandise_id: number;
      link: string;
    }>;
  };
}

// Thêm component riêng để xử lý ảnh và lỗi CORS
interface ImageWithFallbackProps {
  uri: string | undefined;
  style: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ uri, style, resizeMode = 'cover' }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fallbackImage = require('../../assets/images/replace-holder.png');
  
  return (
    <View style={[style, {overflow: 'hidden', position: 'relative'}]}>
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5'}]}>
          <ActivityIndicator size="small" color="#ED1C24" />
        </View>
      )}
      
      {hasError || !uri ? (
        <Image 
          source={fallbackImage}
          style={{width: '100%', height: '100%'}}
          resizeMode={resizeMode}
          onLoadEnd={() => setIsLoading(false)}
        />
      ) : (
        <Image 
          source={{ uri: uri }}
          style={{width: '100%', height: '100%'}}
          resizeMode={resizeMode}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            console.log("Lỗi khi tải ảnh:", uri);
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const promoFlatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');
  const { authState } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRoleId, setUserRoleId] = useState<number | null>(null);
  const [hasCustomers, setHasCustomers] = useState<boolean>(false);
  const [checkingCustomers, setCheckingCustomers] = useState<boolean>(false);
  const { data: sectors, isLoading: isSectorsLoading, error: sectorsError } = useSectors();
  
  // Thêm state để lưu trữ dữ liệu hoa hồng
  const [commissionData, setCommissionData] = useState<MonthlyCommission[]>([]);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingCommission, setIsLoadingCommission] = useState<boolean>(false);
  
  // Thêm state để theo dõi trạng thái ẩn/hiện số tiền
  const [isAmountVisible, setIsAmountVisible] = useState<boolean>(false);
  
  // Thêm state để lưu trữ dữ liệu banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState<boolean>(false);
  const [bannersError, setBannersError] = useState<Error | null>(null);
  
  // Thêm states cho thiết bị
  const [merchandises, setMerchandises] = useState<PreQuoteMerchandise[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [contractCode, setContractCode] = useState<string>('');
  const [contractActivationDate, setContractActivationDate] = useState<string>('');
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);
  
  useEffect(() => {
    if (sectorsError) {
      console.error('Error loading sectors:', sectorsError);
    }
  }, [sectorsError]);
  
  // Lấy ID người dùng
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('@slm_user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        } else {
          // Fallback ID nếu không có user đang đăng nhập
          setUserId(4);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
        // Fallback ID nếu có lỗi
        setUserId(4);
      }
    };

    getUserId();
  }, []);
  
  // Thêm useEffect mới để lấy avatar khi có userId
  useEffect(() => {
    // Chỉ gọi khi có userId và không có userAvatar
    if (userId && !userAvatar) {
      fetchUserAvatar();
    }
  }, [userId, userAvatar]);
  
  // Sau khi có userId, gọi API để lấy thông tin hoa hồng
  useEffect(() => {
    if (userId) {
      fetchCommissionData(userId);
      checkUserCustomers(userId);
    }
  }, [userId]);
  
  // Xử lý dữ liệu commission sau khi nhận được
  useEffect(() => {
    if (commissionData.length > 0) {
      // Tính tổng tiền hoa hồng
      const totalAmount = commissionData.reduce((sum, month) => {
        return sum + month.commissions.reduce((monthSum, comm) => monthSum + comm.money, 0);
      }, 0);
      setTotalCommissionAmount(totalAmount);
    }
  }, [commissionData]);
  
  // Hàm lấy dữ liệu hoa hồng từ API
  const fetchCommissionData = async (id: number) => {
    try {
      setIsLoadingCommission(true);
      const currentYear = new Date().getFullYear();
      const response = await fetch(`https://api.slmglobal.vn/api/user/commission/${id}/${currentYear}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi lấy dữ liệu hoa hồng: ${response.status}`);
      }
      
      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Phản hồi không phải JSON: ${contentType}`);
      }
      
      // Lấy text và kiểm tra trước khi parse
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) {
        throw new Error('Phản hồi không phải định dạng JSON');
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      
      if (data && Array.isArray(data)) {
        setCommissionData(data);
      } else {
        setCommissionData([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hoa hồng:', error);
      setCommissionData([]);
    } finally {
      setIsLoadingCommission(false);
    }
  };
  
  // Format số tiền
  const formatCurrency = (amount: number) => {
    // Làm tròn đến hàng nghìn
    const roundedAmount = Math.round(amount / 1000) * 1000;
    // Format không hiển thị phần thập phân
    return new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0
    }).format(roundedAmount);
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
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Lấy trực tiếp từ AsyncStorage để đảm bảo dữ liệu mới nhất
        const storedName = await AsyncStorage.getItem('@slm_user_name');
        const storedPhone = await AsyncStorage.getItem('@slm_login_phone');
        const storedAvatar = await AsyncStorage.getItem('@slm_user_avatar');
        const userData = await AsyncStorage.getItem('@slm_user_data');
        
        if (storedName) {
          setUserName(storedName);
        } else if (authState.user?.name) {
          setUserName(authState.user.name);
        }
        
        if (storedPhone) {
          setUserPhone(storedPhone);
        } else if (authState.user?.phone) {
          setUserPhone(authState.user.phone);
        }
        
        // Lấy role ID từ user data
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.role_id) {
            setUserRoleId(parsedUserData.role_id);
          }
        } else if (authState.user?.role_id) {
          setUserRoleId(authState.user.role_id);
        }
        
        // Lấy avatar từ AsyncStorage hoặc authState
        if (storedAvatar) {
          console.log('Sử dụng avatar từ AsyncStorage');
          setUserAvatar(storedAvatar);
        } else if (authState.user && 'avatar' in authState.user && authState.user.avatar) {
          console.log('Sử dụng avatar từ authState');
          // Ép kiểu cho avatar từ authState để tránh lỗi type
          const userAvatar = (authState.user as any).avatar as string;
          setUserAvatar(userAvatar);
          // Lưu avatar từ authState vào AsyncStorage
          await AsyncStorage.setItem('@slm_user_avatar', userAvatar);
        } else {
          // Nếu không có trong authState và AsyncStorage, thử lấy từ API
          console.log('Không tìm thấy avatar, sẽ lấy từ API');
          await fetchUserAvatar();
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
      }
    };
    
    loadUserData();
  }, [authState]);
  
  // Hàm lấy avatar từ API
  const fetchUserAvatar = async () => {
    try {
      // Lấy user ID từ AsyncStorage hoặc authState
      let userId = null;
      
      if (authState.user?.id) {
        userId = authState.user.id;
      } else {
        const storedUserId = await AsyncStorage.getItem('@slm_user_id');
        if (storedUserId) {
          userId = storedUserId;
        } else {
          // Tìm user ID từ user data nếu có
          const userData = await AsyncStorage.getItem('@slm_user_data');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            if (parsedUserData.id) {
              userId = parsedUserData.id;
            }
          }
        }
      }
      
      if (!userId) {
        console.log('Không tìm thấy ID người dùng để lấy avatar');
        return;
      }
      
      console.log(`Đang lấy avatar cho user ID: ${userId}`);
      
      const response = await fetch(`https://api.slmglobal.vn/api/users/${userId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi lấy thông tin: ${response.status}`);
      }
      
      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Phản hồi không phải JSON: ${contentType}`);
      }
      
      // Lấy text và kiểm tra trước khi parse
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) {
        throw new Error('Phản hồi không phải định dạng JSON');
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      
      if (data && data.avatar) {
        console.log('Đã lấy được avatar từ API:', data.avatar);
        setUserAvatar(data.avatar);
        
        // Lưu avatar vào AsyncStorage để sử dụng sau này
        await AsyncStorage.setItem('@slm_user_avatar', data.avatar);
      } else {
        console.log('Không tìm thấy avatar trong dữ liệu API');
      }
    } catch (error) {
      console.error('Lỗi khi lấy avatar người dùng:', error);
    }
  };

  const renderTypeTag = (type: string) => {
    let color = '';
    let displayText = type;
    
    switch(type) {
      case 'Đặt hàng lại':
        color = '#E07C24';  // Màu cam đậm hơn
        displayText = 'Xử lý hợp đồng';
        break;
      case 'Hàng tháng':
        color = '#4CAF50';  // Màu xanh lá vừa phải
        displayText = 'Hoàn thành';
        break;
      case 'Hàng tháng đơn lẻ':
        color = '#2196F3';
        break;
      default:
        color = '#999';
    }
    
    return (
      <View style={{
        backgroundColor: color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
        alignSelf: 'flex-start'
      }}>
        <RNText style={{ color: 'white', fontSize: 12 }}>{displayText}</RNText>
      </View>
    );
  };

  const handleProductScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32; // accounting for padding
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activeProductIndex) {
      setActiveProductIndex(index);
    }
  };
  
  const scrollToProduct = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveProductIndex(index);
    }
  };

  const handlePromoScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32; // accounting for padding
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activePromoIndex) {
      setActivePromoIndex(index);
    }
  };
  
  const scrollToPromo = (index: number) => {
    if (promoFlatListRef.current) {
      promoFlatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActivePromoIndex(index);
    }
  };

  // Thêm nút điều hướng đến màn hình thống kê hoa hồng
  const navigateToCommissionHistory = () => {
    router.push('/(tabs)/stats');
  };

  // Thêm nút điều hướng đến màn hình cộng đồng
  const navigateToGroupAgent = () => {
    router.push('/(group)/group_agent');
  };

  // Hàm chuyển đổi trạng thái ẩn/hiện
  const toggleAmountVisibility = () => {
    setIsAmountVisible(prev => !prev);
  };

  // Hàm tạo chuỗi * thay thế số tiền
  const getMaskedAmount = (amount: number) => {
    // Tạo chuỗi * với độ dài tương ứng với số tiền
    const amountString = formatCurrency(amount);
    return '*'.repeat(Math.min(amountString.length, 10));
  };

  // Fetch dữ liệu banners từ API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoadingBanners(true);
        setBannersError(null);
        
        const response = await fetch('https://api.slmglobal.vn/api/banners', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu banners: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Phản hồi không phải JSON: ${contentType}`);
        }
        
        const text = await response.text();
        if (!text || text.trim().startsWith('<')) {
          throw new Error('Phản hồi không phải định dạng JSON');
        }
        
        const data = JSON.parse(text);
        
        if (data && Array.isArray(data)) {
          // Lọc để chỉ hiển thị banner ở location 'home'
          const homeBanners = data.filter(banner => banner.location === 'home');
          setBanners(homeBanners);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu banners:', error);
        setBannersError(error instanceof Error ? error : new Error('Lỗi không xác định'));
      } finally {
        setIsLoadingBanners(false);
      }
    };
    
    fetchBanners();
  }, []);

  // Thêm component ProductItem
  const ProductItem = ({ item, width }: { item: Combo, width: number }) => {
    // Thêm hàm lấy tag cho sản phẩm
    const getProductTag = (combo: Combo) => {
      if (combo.installation_type) {
        return combo.installation_type.toUpperCase();
      }
      return null;
    };

    return (
      <TouchableOpacity 
        style={[styles.productCard, { width: (width - 48) / 2.5, marginHorizontal: 4, marginBottom: 16 }]}
        onPress={() => router.push({
          pathname: "/(products)/product_baogia",
          params: { id: item.id.toString() }
        })}
      >
        <View style={{ padding: 0, width: '100%', aspectRatio: 1, overflow: 'hidden' }}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                top: 0,
                left: 0 
              }} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="cube-outline" size={40} color="#888" />
            </View>
          )}
          {getProductTag(item) && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{getProductTag(item)}</Text>
            </View>
          )}
        </View>
        <View style={{ padding: 12, flex: 1 }}>
          <Text style={styles.productTitle} numberOfLines={3}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(Math.round(item.total_price / 1000) * 1000)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Thêm component ProductSection
  const ProductSection = ({ sector }: { sector: Sector }) => {
    const { width } = Dimensions.get('window');
    const flatListRef = useRef<FlatList>(null);

    if (!sector.list_combos || sector.list_combos.length === 0) {
      return null;
    }

    return (
      <>
        <WhiteSpace size="lg" />
        <Flex justify="between" align="center">
          <Text style={styles.sectionSubtitle}>{sector.name.toUpperCase()}</Text>
          <Button
            type="primary"
            size="small"
            style={{ borderWidth: 0, backgroundColor: 'transparent', paddingRight: 8 }}
            onPress={() => router.push({
              pathname: "/(products)/product_brand",
              params: { id: sector.id }
            })}
          >
            <Flex align="center">
              <Text style={styles.viewAllText}>Tất cả</Text>
              <Image 
                source={require('../../assets/images/arrow-icon.png')} 
                style={{ width: 20, height: 20, marginLeft: 8 }} 
                resizeMode="contain"
              />
            </Flex>
          </Button>
        </Flex>
        
        <WhiteSpace size="lg" />
        <View style={[styles.carouselContainer, { paddingBottom: 16 }]}>
          <FlatList
            ref={flatListRef}
            horizontal
            data={sector.list_combos}
            renderItem={({item}) => (
              <ProductItem item={item} width={width} />
            )}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      </>
    );
  };

  // Cập nhật renderPromoData để chỉ sử dụng dữ liệu từ API
  const renderPromoData = (banners: Banner[]) => {
    if (!banners || banners.length === 0) {
      return [];
    }
    
    // Sử dụng banner_images từ API để tạo dữ liệu promo
    const firstBanner = banners[0];
    if (!firstBanner || !firstBanner.banner_images || firstBanner.banner_images.length === 0) {
      return [];
    }
    
    return firstBanner.banner_images.map((image) => ({
      id: image.id.toString(),
      action: firstBanner.title || 'Sản phẩm',
      mainText: firstBanner.slug || '',
      buttonText: 'Xem ngay',
      backgroundColor: '#D9261C',
      imageUrl: image.link,
    }));
  };
  
  const promoData = renderPromoData(banners);

  // Thêm useEffect để fetch thiết bị khi userId có và userRoleId === 3
  useEffect(() => {
    if (userId && userRoleId === 3) {
      fetchUserDevices(userId);
    }
  }, [userId, userRoleId]);
  
  // Hàm fetch thiết bị từ API
  const fetchUserDevices = async (id: number) => {
    try {
      setIsLoadingDevices(true);
      const response = await fetch(`https://api.slmglobal.vn/api/users/${id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.status}`);
      }
      
      const data = await response.json();
      if (data) {
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
                merchandise: item.merchandise
              }));
            setMerchandises(merchandisesData);
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
      console.error('Error fetching user devices:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // Hàm fetch contract
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
    }
  };

  // Hàm fetch merchandises
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
    }
  };

  // Convert merchandises to devices
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

        // Lấy URL hình ảnh từ merchandise nếu có
        const imageUrl = item.merchandise?.images && item.merchandise.images.length > 0 
          ? item.merchandise.images[0].link 
          : undefined;

        return {
          id: item.id,
          name: item.name,
          activationDate: formatDate(activationDate),
          warrantyPeriod: `${item.warranty_years} năm`,
          expireDate: formatDate(expireDate),
          progressPercent: progressPercent,
          imageUrl: imageUrl
        };
      });

      setDevices(mappedDevices);
    }
  }, [merchandises, contractActivationDate]);
  
  // Thêm component hiển thị thiết bị
  const renderDeviceSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thiết bị của bạn</Text>
      </View>
      
      <View style={styles.deviceIdContainer}>
        <Text style={styles.deviceId}>{contractCode}</Text>
        <TouchableOpacity 
          style={styles.sectionButton}
          onPress={() => router.push({
            pathname: "/profile_contract_detail",
            params: { contractCode }
          })}
        >
          <Text style={styles.sectionButtonText}>Chi tiết</Text>
          <Ionicons name="arrow-forward-circle" size={20} color="#ED1C24" />
        </TouchableOpacity>
      </View>
      
      {isLoadingDevices ? (
        <View style={styles.loadingDeviceContainer}>
          <ActivityIndicator size="small" color="#ED1C24" />
          <Text style={styles.loadingDeviceText}>Đang tải thiết bị...</Text>
        </View>
      ) : devices.length > 0 ? (
        <View style={styles.deviceList}>
          {devices.map(device => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceCardContent}>
                <View style={styles.deviceImageContainer}>
                  <ImageWithFallback
                    uri={device.imageUrl}
                    style={styles.deviceImage}
                    resizeMode="contain"
                  />
                </View>
                
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
      ) : (
        <View style={styles.emptyDeviceContainer}>
          <Text style={styles.emptyDeviceText}>Không có thiết bị</Text>
        </View>
      )}
    </View>
  );

  // Thêm hàm kiểm tra khách hàng cũ
  const checkUserCustomers = async (id: number) => {
    try {
      setCheckingCustomers(true);
      const response = await fetch(`https://api.slmglobal.vn/api/agents/${id}/old-customer`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi kiểm tra khách hàng: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Nếu có mảng dữ liệu và có ít nhất 1 phần tử thì đánh dấu đã có khách hàng
      if (Array.isArray(data) && data.length > 0) {
        setHasCustomers(true);
      } else {
        setHasCustomers(false);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra khách hàng cũ:', error);
      setHasCustomers(false);
    } finally {
      setCheckingCustomers(false);
    }
  };

  if (isSectorsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D9261C" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (sectorsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra khi tải dữ liệu</Text>
        <Text style={styles.errorSubText}>{sectorsError.message}</Text>
      </View>
    );
  }

  if (!sectors || sectors.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  }

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#ED1C24" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.headerOverlay} />
            <WhiteSpace size="lg" />
            <Flex direction="row" align="center" justify="between" style={{ zIndex: 3 }}>
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                {userAvatar ? (
                  <Image 
                    source={{ uri: userAvatar }} 
                    style={styles.avatarPlaceholder}
                    onError={() => {
                      console.log('Lỗi khi tải ảnh avatar từ URI:', userAvatar);
                      // Nếu lỗi khi tải avatar, thử lấy lại avatar từ API
                      fetchUserAvatar();
                      // Đồng thời reset state userAvatar để hiển thị placeholder
                      setUserAvatar(null);
                    }}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.greeting}>Chào {userName || 'Người dùng'}</Text>
                  <Text style={styles.userId}>{formatPhoneNumber(userPhone) || '(Chưa đăng nhập)'}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.notificationContainer}>
                <Flex direction="row" align="center">
                  {(userRoleId === 1 || userRoleId === 2) && (
                    <TouchableOpacity 
                      style={styles.notificationIconContainer}
                      onPress={() => router.push('/(quotation)/quotation_create_new')}
                    >
                      <Image 
                        source={require('../../assets/images/trail-icon.png')} 
                        style={{ width: 24, height: 24 }} 
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[
                      styles.notificationIconContainer, 
                      (userRoleId === 1 || userRoleId === 2) ? { marginLeft: 8 } : {}
                    ]}
                    onPress={() => router.push('/(notification)/notification')}
                  >
                    <Image 
                      source={require('../../assets/images/bell.png')} 
                      style={{ width: 24, height: 24 }} 
                      resizeMode="contain"
                    />
                    <View style={styles.notificationBadge} />
                  </TouchableOpacity>
                </Flex>
              </View>
            </Flex>
            
            {/* Income Card - Ẩn với Khách hàng */}
            {userRoleId !== 3 && (
              <>
                <WhiteSpace size="lg" />
                <View style={{...styles.incomeCard, marginHorizontal: 0, borderRadius: 10}}>
                  <LinearGradient
                    colors={['rgba(255, 208, 121, 0.6)', 'rgba(255, 208, 121, 0)']}
                    locations={[0, 1]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={[styles.incomeCardContent, { borderRadius: 10 }]}
                  >
                    <Flex direction="row" align="center" justify="between">
                      <View style={[styles.incomeTextContainer, { justifyContent: 'center' }]}>
                        <Text style={styles.incomeTitle}>Thu nhập dự kiến {`T${new Date().getMonth() + 1}`}</Text>
                        <Flex align="center">
                          {isLoadingCommission ? (
                            <ActivityIndicator size="small" color="#fff" style={{marginRight: 10}} />
                          ) : (
                            <Text style={styles.incomeAmount}>
                              {isAmountVisible 
                                ? formatCurrency(totalCommissionAmount) 
                                : getMaskedAmount(totalCommissionAmount)}
                            </Text>
                          )}
                          <TouchableOpacity onPress={toggleAmountVisibility}>
                            <Image 
                              source={require('../../assets/images/eye-icon.png')} 
                              style={{ width: 36, height: 36, marginLeft: 2 }} 
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        </Flex>
                      </View>
                      <View style={[styles.iconContainer, { paddingBottom: 8, paddingTop: 8, alignSelf: 'center' }]}>
                        {userRoleId !== 5 && (
                          <TouchableOpacity 
                            style={styles.statItem}
                            onPress={navigateToGroupAgent}
                          >
                            <Image 
                              source={require('../../assets/images/cong-dong.png')} 
                              style={{ width: 24, height: 24, marginBottom: 4 }} 
                              resizeMode="contain"
                            />
                            <Text style={styles.statLabel}>Cộng đồng</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          style={[styles.statItem, { marginLeft: userRoleId !== 5 ? 16 : 0 }]}
                          onPress={navigateToCommissionHistory}
                        >
                          <Image 
                            source={require('../../assets/images/chart-pie.png')} 
                            style={{ width: 24, height: 24, marginBottom: 4 }} 
                            resizeMode="contain"
                          />
                          <Text style={styles.statLabel}>Thống kê</Text>
                        </TouchableOpacity>
                      </View>
                    </Flex>
                  </LinearGradient>
                </View>
              </>
            )}
          </View>
          
          <WingBlank style={styles.contentContainer}>
            {/* Hiển thị thiết bị nếu là khách hàng */}
            {userRoleId === 3 && (
              renderDeviceSection()
            )}
            
            {/* Brand Selector Section - Ẩn với Khách hàng */}
            {userRoleId !== 3 && (
              <>
                <WhiteSpace size="lg" />
                <Flex justify="between" style={[styles.brandContainer, { paddingVertical: 16 }]}>
                  {sectors?.map((sector) => (
                    <TouchableOpacity
                      key={sector.id}
                      style={[
                        styles.brandCard,
                        // Thêm màu background tùy theo brand
                        { backgroundColor: sector.id === 2 ? '#FFD700' : sector.id === 1 ? '#4CAF50' : '#fff' }
                      ]}
                      activeOpacity={0.8}
                      onPress={() => router.push({
                        pathname: "/(products)/product_brand",
                        params: { id: sector.id }
                      })}
                    >
                      <View style={styles.brandContent}>
                        <Image 
                          source={{ uri: sector.image }} 
                          style={styles.brandLogo} 
                          resizeMode="contain" 
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </Flex>
              </>
            )}
            
            {/* Promo Cards - Ẩn với Khách hàng */}
            {userRoleId !== 3 && (
              <>
                <WhiteSpace size="lg" />
                <View style={styles.carouselContainer}>
                  {isLoadingBanners ? (
                    <View style={styles.loadingBannerContainer}>
                      <ActivityIndicator size="small" color="#D9261C" />
                      <Text style={styles.loadingBannerText}>Đang tải banner...</Text>
                    </View>
                  ) : (
                    <FlatList
                      ref={promoFlatListRef}
                      horizontal
                      data={promoData}
                      renderItem={({item}) => (
                        <View style={[styles.promoCard, { width: width - 32, marginHorizontal: 4 }]}>
                          {item.imageUrl ? (
                            <Image
                              source={{ uri: item.imageUrl }} 
                              style={styles.promoFullImage} 
                              resizeMode="cover"
                              onError={(e) => console.error('Error loading banner image:', e.nativeEvent.error)}
                            />
                          ) : item.image ? (
                            <Image
                              source={item.image} 
                              style={styles.promoFullImage} 
                              resizeMode="cover" 
                            />
                          ) : (
                            <View style={[styles.promoFullImage, { backgroundColor: item.backgroundColor || '#D9261C' }]} />
                          )}
                        </View>
                      )}
                      keyExtractor={item => item.id}
                      showsHorizontalScrollIndicator={false}
                      pagingEnabled
                      snapToInterval={width - 32}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handlePromoScroll}
                      contentContainerStyle={{ paddingHorizontal: 16 }}
                    />
                  )}
                  
                  <View style={styles.promoPaginationContainer}>
                    {promoData.map((_, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={[
                          styles.promoPaginationBar, 
                          index === activePromoIndex && styles.promoPaginationBarActive
                        ]}
                        onPress={() => scrollToPromo(index)}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
            
            {/* Bán chạy Section - Ẩn với Khách hàng */}
            {userRoleId !== 3 && (
              <>
                <WhiteSpace size="lg" />
                <Text style={styles.sectionTitle}>Bán chạy</Text>
                <WhiteSpace size="xs" />
                {sectors.map((sector) => (
                  <ProductSection key={sector.id} sector={sector} />
                ))}
              </>
            )}
          </WingBlank>
          
          {/* HomeAgentCTA Section - Chỉ hiển thị với role_id là 4 hoặc 5 và chưa có khách hàng mua hàng */}
          {(userRoleId === 4 || userRoleId === 5) && !hasCustomers && !checkingCustomers && (
            <HomeAgentCTA />
          )}

          {/* Bài viết mới nhất */}
          <ContentGallery 
            userId={userId ?? undefined}
            showTitle={true}
            sectionTitle="Bài viết liên quan"
            maxItems={5}
            horizontal={true}
            cardStyle="simple"
            detailInModal={true}
            showViewAll={true}
            viewAllPath="/(tabs)/gallery"
          />

          <WhiteSpace size="lg" />
        </ScrollView>
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f8',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  carouselContainer: {
    marginHorizontal: -20,
  },
  headerContainer: {
    backgroundColor: '#ED1C24',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
    zIndex: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ABACC2',
    zIndex: 3,
  },
  userInfo: {
    marginLeft: 12,
    zIndex: 3,
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userId: {
    color: '#F79009',
    fontSize: 14,
  },
  incomeCard: {
    backgroundColor: 'rgba(180, 120, 70, 0.9)',
    borderRadius: 10,
    borderWidth: 0,
    marginHorizontal: 16,
    zIndex: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
  incomeCardContent: {
    padding: 12,
    zIndex: 2,
  },
  incomeTextContainer: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  incomeTitle: {
    color: 'white',
    fontSize: 15,
    marginBottom: 4,
  },
  incomeAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  incomeCurrency: {
    fontSize: 12,
  },
  incomeStats: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: {
    color: 'white',
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: -8,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#ED1C24',
    fontSize: 14,
    marginRight: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    width: '100%',
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '48%',
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  brandContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: '100%',
    height: 32,
  },
  promoCard: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
    width: 330,
    aspectRatio: 343/150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
      }
    }),
    marginVertical: 4,
    marginRight: 12,
  },
  promoFullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  promoContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    zIndex: 1,
  },
  promoTextContent: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  promoAction: {
    color: 'white',
    fontSize: 14,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      web: {
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
      }
    }),
    textAlign: 'right',
  },
  promoMainText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      web: {
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
      }
    }),
    textAlign: 'right',
  },
  promoButton: {
    backgroundColor: '#FFC107',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'flex-end',
    minWidth: 110,
    height: 30,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: 'white',
    fontSize: 11,
    marginRight: 2,
    fontWeight: '500',
  },
  productCard: {
    aspectRatio: 10/17,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
  productImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  updateBrandLogoPlaceholder: {
    width: 60,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBrandLogo: {
    width: 60,
    height: 20,
  },
  updateBrandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  updateModelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
  },
  articleCard: {
    width: 220,
    aspectRatio: 4/5,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 0,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 0,
  },
  articleImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleImage: {
    width: '100%',
    height: 150,
    flex: 1,
    aspectRatio: 1.5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  articleDescription: {
    fontSize: 14,
    color: '#666',
  },
  headerLogo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationContainer: {
    position: 'relative',
    zIndex: 3,
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'orange',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  notificationIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 20,
    padding: 8,
    position: 'relative',
  },
  recentUpdateCard: {
    width: 220,
    height: 140,
    marginRight: 0,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 0,
  },
  recentUpdateHeader: {
    height: 40,
    padding: 10,
    justifyContent: 'center',
  },
  recentUpdateLogo: {
    width: 120,
    height: 24,
  },
  recentUpdateLogoPlaceholder: {
    justifyContent: 'center',
  },
  recentUpdateLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentUpdateContent: {
    padding: 12,
  },
  recentUpdateModelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recentUpdateDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recentUpdateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    height: 24,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUpdateButtonText: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
  },
  productPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#ED1C24',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paginationBar: {
    width: 12,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  paginationBarActive: {
    backgroundColor: '#ED1C24',
    width: 18,
  },
  chatSupportSection: {
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 20,
    marginTop: 16,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  chatImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  chatImage: {
    width: 200,
    height: 120,
  },
  chatContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chatDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
    marginBottom: 0,
  },
  chatButtonPrimary: {
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonOutlined: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ED1C24',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  chatButtonTextOutlined: {
    color: '#ED1C24',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
  recentUpdateTypeContainer: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  articleImageNew: {
    width: '100%',
    height: '100%', 
    position: 'absolute',
    top: 0,
    left: 0,
  },
  promoPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  promoPaginationBar: {
    width: 12,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  promoPaginationBarActive: {
    backgroundColor: '#ED1C24',
    width: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED1C24',
    marginTop: 0,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D9261C',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contentSection: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    width: '100%',
  },
  contentSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#333',
  },
  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  loadingBannerContainer: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f8',
    borderRadius: 10,
    marginHorizontal: 16,
  },
  loadingBannerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  section: {
    width: '100%',
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionButtonText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    color: '#ED1C24',
  },
  deviceIdContainer: {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceId: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 16,
    color: '#7B7D9D',
  },
  deviceList: {
    paddingHorizontal: 16,
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
  deviceImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F8',
    overflow: 'hidden',
  },
  deviceImage: {
    width: '100%',
    height: '100%',
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
  loadingDeviceContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDeviceText: {
    marginTop: 8,
    color: '#7B7D9D',
    fontSize: 14,
  },
  emptyDeviceContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDeviceText: {
    color: '#7B7D9D',
    fontSize: 14,
  },
});
