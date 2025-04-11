import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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

export default function AccountScreen() {
  const router = useRouter();
  const [potentialCustomers, setPotentialCustomers] = useState<PotentialCustomer[]>([]);
  const [oldCustomers, setOldCustomers] = useState<OldCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Lấy dữ liệu khách hàng từ API khi lần đầu load
  useEffect(() => {
    fetchData();
  }, []);
  
  // Lấy dữ liệu khách hàng mỗi khi màn hình được focus (quay lại từ màn hình khác)
  useFocusEffect(
    React.useCallback(() => {
      console.log('Màn hình Account được focus - Cập nhật danh sách khách hàng');
      fetchData();
      
      return () => {
        // Cleanup khi unfocus nếu cần
      };
    }, [])
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

  const fetchPotentialCustomers = async () => {
    try {
      const response = await fetch('https://id.slmsolar.com/api/agents/4/potential-customers');
      const data = await response.json();
      setPotentialCustomers(data);
    } catch (err) {
      console.error('Error fetching potential customers:', err);
      throw err;
    }
  };

  const fetchOldCustomers = async () => {
    try {
      const response = await fetch('https://id.slmsolar.com/api/agents/4/old-customer');
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
              <View style={[
                styles.statsCard, 
                activeTab === 'potential' ? { backgroundColor: '#EDF8FF' } : 
                activeTab === 'purchased' ? { backgroundColor: '#E6FFF4' } : 
                { backgroundColor: '#FFECED' }
              ]}>
                <View style={styles.statsContent}>
                  <View style={styles.titleRow}>
                    <View style={styles.textGroup}>
                      <Text style={[
                        styles.statsTitle,
                        activeTab === 'potential' ? { color: '#365292' } : 
                        activeTab === 'purchased' ? { color: '#006650' } : 
                        { color: '#81002F' }
                      ]}>
                        {activeTab === 'potential' 
                          ? "Giúp khách hàng sở hữu giải pháp tuyệt vời này: Chốt đơn ngay!"
                          : activeTab === 'purchased'
                            ? "Tiếp tục mang đến những giải pháp giá trị cho nhiều người hơn nữa!"
                            : "Chủ động thêm thông tin khách hàng để không bỏ lỡ cơ hội."
                        }
                      </Text>
                      {activeTab !== 'potential' && (
                        <>
                          {activeTab === 'purchased' ? (
                            <Text style={[
                              styles.statsSubtitle,
                              { color: '#006650' }
                            ]}>Thật tuyệt vời, bạn đã có {totalOldCustomers} khách hàng chốt đơn trong tháng này. Hãy tiếp tục cố gắng nhé!</Text>
                          ) : (
                            <Text style={[
                              styles.statsSubtitle,
                              { color: '#ED1C24' }
                            ]}>Bạn đang có {totalPotentialCustomers < 10 ? `0${totalPotentialCustomers}` : totalPotentialCustomers}/20 khách hàng tiềm năng</Text>
                          )}
                          {activeTab === 'all' && (
                            <View style={styles.progressBarContainer}>
                              <View style={[
                                styles.progressBar, 
                                { width: `${Math.min((totalPotentialCustomers / 20) * 100, 100)}%` },
                                { backgroundColor: '#ED1C24' }
                              ]} />
                            </View>
                          )}
                        </>
                      )}
                    </View>
                    <Image 
                      source={activeTab === 'potential' 
                        ? require('../../assets/images/tiem-nang-notification-user-icon.png')
                        : activeTab === 'purchased'
                          ? require('../../assets/images/da-mua-notification-user-icon.png')
                          : require('../../assets/images/all-notification-user-icon.png')
                      } 
                      style={styles.titleIcon}
                    />
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.statsButton, 
                    activeTab === 'potential' ? { borderTopColor: '#D1E9FF' } : 
                    activeTab === 'purchased' ? { borderTopColor: '#CCFFE6' } : 
                    { borderTopColor: '#fff' }
                  ]} 
                  onPress={() => router.push('/new-contact')}
                >
                  <Text 
                    style={[
                      styles.statsButtonText,
                      activeTab === 'potential' ? { color: '#365292' } : 
                      activeTab === 'purchased' ? { color: '#006650' } : 
                      { color: '#81002F' }
                    ]}
                  >
                    {activeTab === 'potential' || activeTab === 'purchased'
                      ? "Tạo yêu cầu tư vấn"
                      : "Thêm khách hàng mới"
                    }
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={20} 
                    color={
                      activeTab === 'potential' ? '#365292' : 
                      activeTab === 'purchased' ? '#006650' : 
                      '#81002F'
                    } 
                  />
                </TouchableOpacity>
              </View>
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
}); 