import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu dữ liệu cho khách hàng tiềm năng
interface PotentialCustomer {
  id: number;
  name: string;
  phone: string | null;
  email: boolean;
  province: string;
  district: string;
  ward: string;
  address: string;
  gender: boolean;
  assumed_code: string;
}

// Định nghĩa kiểu dữ liệu cho khách hàng đã mua
interface OldCustomer {
  id: number;
  name: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  gender: boolean;
  tax_code: string;
  citizen_id: string;
  code: string;
  role_id: number;
  total_commission: number;
  commission_rate: number;
  created_at: string;
}

// Định nghĩa loại tab hiển thị
type TabType = 'all' | 'potential' | 'purchased';

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

export default function AccountScreen() {
  const router = useRouter();
  const [potentialCustomers, setPotentialCustomers] = useState<PotentialCustomer[]>([]);
  const [oldCustomers, setOldCustomers] = useState<OldCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { width } = Dimensions.get('window');
  const [userId, setUserId] = useState<number | null>(null);
  
  // Banner states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState<boolean>(false);
  const [bannersError, setBannersError] = useState<Error | null>(null);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const promoFlatListRef = useRef<FlatList>(null);
  
  // Lấy dữ liệu khách hàng từ API khi lần đầu load
  useEffect(() => {
    const getUserId = async () => {
      try {
        // Thử nhiều cách khác nhau để lấy user ID
        // 1. Thử lấy từ AsyncStorage - @slm_user_data
        const userData = await AsyncStorage.getItem('@slm_user_data');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.id) {
            setUserId(user.id);
            console.log('Đã lấy user ID từ @slm_user_data:', user.id);
            return user.id;
          }
        }
        
        // 2. Thử lấy từ AsyncStorage - @slm_user_id
        const userIdStr = await AsyncStorage.getItem('@slm_user_id');
        if (userIdStr) {
          const parsedId = parseInt(userIdStr);
          setUserId(parsedId);
          console.log('Đã lấy user ID từ @slm_user_id:', parsedId);
          return parsedId;
        }
        
        // 3. Thử lấy từ @slm_user_role_id (một số trường hợp role_id có thể là agent_id)
        const roleIdStr = await AsyncStorage.getItem('@slm_user_role_id');
        if (roleIdStr) {
          const parsedRoleId = parseInt(roleIdStr);
          console.log('Đã lấy role ID:', parsedRoleId);
          // Trong trường hợp khẩn cấp, có thể sử dụng role_id làm agent_id
          setUserId(parsedRoleId);
          return parsedRoleId;
        }
        
        // Nếu không có ID nào được tìm thấy, sử dụng ID mặc định = 4
        console.warn('Không tìm thấy ID người dùng trong AsyncStorage, sử dụng ID mặc định = 4');
        setUserId(4);
        return 4;
      } catch (error) {
        console.error('Lỗi khi lấy user ID:', error);
        // Fallback to default ID in case of error
        setUserId(4);
        return 4;
      }
    };
    
    getUserId().then((id) => {
      console.log('Sử dụng ID để fetch dữ liệu:', id);
      fetchData();
    });
    
    fetchBanners();
  }, []);
  
  // Lấy dữ liệu khách hàng mỗi khi màn hình được focus (quay lại từ màn hình khác)
  useFocusEffect(
    React.useCallback(() => {
      console.log('Màn hình Account được focus - Cập nhật danh sách khách hàng');
      // Kiểm tra lại userId khi focus để đảm bảo sử dụng ID mới nhất
      const checkUserId = async () => {
        try {
          if (!userId) {
            const userData = await AsyncStorage.getItem('@slm_user_data');
            if (userData) {
              const user = JSON.parse(userData);
              if (user.id) {
                setUserId(user.id);
                console.log('Focus: Đã cập nhật user ID:', user.id);
              }
            }
          }
          fetchData();
        } catch (error) {
          console.error('Focus: Lỗi khi kiểm tra user ID:', error);
          fetchData();
        }
      };
      
      checkUserId();
      
      return () => {
        // Cleanup khi unfocus nếu cần
      };
    }, [userId])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPotentialCustomers(), fetchOldCustomers()]);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải dữ liệu khách hàng');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  // Fetch dữ liệu banners từ API
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

  // Hàm xử lý cuộn banner
  const handlePromoScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32; // accounting for padding
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activePromoIndex) {
      setActivePromoIndex(index);
    }
  };
  
  // Hàm cuộn đến banner theo index
  const scrollToPromo = (index: number) => {
    if (promoFlatListRef.current) {
      promoFlatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActivePromoIndex(index);
    }
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

  const fetchPotentialCustomers = async () => {
    try {
      if (!userId) {
        console.warn('fetchPotentialCustomers: Không có user ID, sử dụng ID mặc định = 4');
        const response = await fetch(`https://api.slmglobal.vn/api/agents/4/potential-customers`);
        const data = await response.json();
        setPotentialCustomers(data);
        return;
      }

      console.log(`Lấy khách hàng tiềm năng cho agent ID = ${userId}`);
      const response = await fetch(`https://api.slmglobal.vn/api/agents/${userId}/potential-customers`);
      const data = await response.json();
      setPotentialCustomers(data);
    } catch (err) {
      console.error('Error fetching potential customers:', err);
      throw err;
    }
  };

  const fetchOldCustomers = async () => {
    try {
      if (!userId) {
        console.warn('fetchOldCustomers: Không có user ID, sử dụng ID mặc định = 4');
        const response = await fetch(`https://api.slmglobal.vn/api/agents/4/old-customer`);
        const data = await response.json();
        setOldCustomers(data);
        return;
      }

      console.log(`Lấy khách hàng đã mua hàng cho agent ID = ${userId}`);
      const response = await fetch(`https://api.slmglobal.vn/api/agents/${userId}/old-customer`);
      const data = await response.json();
      setOldCustomers(data);
    } catch (err) {
      console.error('Error fetching old customers:', err);
      throw err;
    }
  };

  // Xác định dữ liệu hiển thị dựa vào tab đang active
  const getDisplayData = () => {
    switch (activeTab) {
      case 'potential':
        return potentialCustomers;
      case 'purchased':
        return oldCustomers;
      case 'all':
      default:
        return [...potentialCustomers, ...oldCustomers];
    }
  };

  // Render customer item
  const renderCustomerItem = ({ item }: { item: PotentialCustomer | OldCustomer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {'phone' in item && item.phone && (
          <Text style={styles.customerPhone}>{item.phone}</Text>
        )}
        {'tax_code' in item && item.tax_code && (
          <Text style={styles.customerDetail}>MST: {item.tax_code}</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="cube-outline" size={20} color="#12B669" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="book-outline" size={20} color="#2E90FA" />
        </TouchableOpacity>
        {!('tax_code' in item) && item.phone && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="#ED1C24" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Lấy tiêu đề trang dựa vào tab đang active
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'potential':
        return 'Khách hàng tiềm năng';
      case 'purchased':
        return 'Khách hàng đã mua';
      case 'all':
      default:
        return 'Tất cả khách hàng';
    }
  };

  // Đếm số lượng khách hàng tiềm năng
  const totalPotentialCustomers = potentialCustomers.length;
  
  // Đếm số lượng khách hàng đã mua
  const totalOldCustomers = oldCustomers.length;

  // Lấy tổng số lượng khách hàng hiển thị
  const displayData = getDisplayData();

  // Render banner promo carousel component
  const renderBannerPromo = () => (
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
  );

  // Render default stats card nếu là tab Tất cả
  const renderDefaultStatsCard = () => (
    <View style={[
      styles.statsCard, 
      { backgroundColor: '#FFECED' }
    ]}>
      <View style={styles.statsContent}>
        <View style={styles.titleRow}>
          <View style={styles.textGroup}>
            <Text style={[
              styles.statsTitle,
              { color: '#81002F' }
            ]}>
              Chủ động thêm thông tin khách hàng để không bỏ lỡ cơ hội.
            </Text>
            <Text style={[
              styles.statsSubtitle,
              { color: '#ED1C24' }
            ]}>Bạn đang có {totalPotentialCustomers < 10 ? `0${totalPotentialCustomers}` : totalPotentialCustomers}/20 khách hàng tiềm năng</Text>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { width: `${Math.min((totalPotentialCustomers / 20) * 100, 100)}%` },
                { backgroundColor: '#ED1C24' }
              ]} />
            </View>
          </View>
          <Image 
            source={require('../../assets/images/all-notification-user-icon.png')} 
            style={styles.titleIcon}
          />
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.statsButton, 
          { borderTopColor: '#fff' }
        ]} 
        onPress={() => router.push('/new-contact')}
      >
        <Text 
          style={[
            styles.statsButtonText,
            { color: '#81002F' }
          ]}
        >
          Thêm khách hàng mới
        </Text>
        <Ionicons 
          name="arrow-forward" 
          size={20} 
          color="#81002F" 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Khách hàng</Text>
        <TouchableOpacity onPress={() => router.push('/new-contact')}>
          <Ionicons name="add" size={24} color="#00A650" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={activeTab === 'all' ? styles.activeFilterTab : styles.filterTab}
          onPress={() => setActiveTab('all')}
        >
          <Text style={activeTab === 'all' ? styles.activeTabText : styles.tabText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={activeTab === 'potential' ? styles.activeFilterTab : styles.filterTab}
          onPress={() => setActiveTab('potential')}
        >
          <Text style={activeTab === 'potential' ? styles.activeTabText : styles.tabText}>Tiềm năng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={activeTab === 'purchased' ? styles.activeFilterTab : styles.filterTab}
          onPress={() => setActiveTab('purchased')}
        >
          <Text style={activeTab === 'purchased' ? styles.activeTabText : styles.tabText}>Đã mua hàng</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.createButton} onPress={fetchData}>
            <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ô, hình như danh sách của bạn chưa có ai cả!</Text>
          <Text style={styles.emptySubText}>Hãy thêm liên hệ mới nhé.</Text>
          
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/new-contact')}>
            <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>Tạo liên hệ mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={displayData}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* Hiển thị banner promo nếu là tab tiềm năng hoặc đã mua */}
                {(activeTab === 'potential' || activeTab === 'purchased') ? (
                  renderBannerPromo()
                ) : (
                  renderDefaultStatsCard()
                )}
                {(activeTab === 'potential' || activeTab === 'purchased') && (
                  <View style={styles.sectionButton}>
                    <TouchableOpacity 
                      style={styles.actionButtonContainer}
                      onPress={() => router.push('/new-contact')}
                    >
                      <Text style={styles.actionButtonText}>
                        {activeTab === 'potential' 
                          ? "Tạo yêu cầu tư vấn" 
                          : "Tạo yêu cầu tư vấn"}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="#ED1C24" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: '#F5F5F8',
  },
  activeFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: '#ED1C24',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  activeTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EE0033',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  statsCard: {
    backgroundColor: '#FFECED',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsContent: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textGroup: {
    flex: 7,
    paddingRight: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#81002F',
    marginBottom: 4,
  },
  titleIcon: {
    width: '30%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  statsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    paddingTop: 4,
    paddingBottom: 6,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ED1C24',
    borderRadius: 4,
  },
  statsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0,
    paddingRight: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#fff',
  },
  statsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#81002F',
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: 'rgba(39, 39, 62, 0.16)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    color: '#27273E',
  },
  customerPhone: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  customerDetail: {
    fontSize: 11,
    color: '#7B7D9D',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  // Thêm styles cho banner promo carousel
  carouselContainer: {
    marginHorizontal: -20,
    marginBottom: 16,
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
  sectionButton: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ED1C24',
  },
});