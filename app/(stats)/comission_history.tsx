import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Image, Modal, Pressable, Animated } from 'react-native';
import { useRouter, Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CommissionItem {
  id: number;
  created_at: string;
  paid: boolean;
  seller: number;
  money: number;
  sector_id: number;
  sector: any;
}

interface GroupedCommission {
  month: string;
  items: CommissionItem[];
}

export default function CommissionStatsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('recent3Months');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('recent3Months');
  const [commissionData, setCommissionData] = useState<GroupedCommission[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [isTimeDrawerVisible, setIsTimeDrawerVisible] = useState(false);
  
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const drawerTranslateY = useRef(new Animated.Value(300)).current;
  
  const timeOverlayOpacity = useRef(new Animated.Value(0)).current;
  const timeDrawerTranslateY = useRef(new Animated.Value(300)).current;

  // Hàm lấy dữ liệu từ API
  const fetchCommissionData = async (userId: number) => {
    try {
      setLoading(true);
      // Lấy năm hiện tại
      const currentYear = new Date().getFullYear();
      
      const response = await fetch(`https://id.slmsolar.com/api/user/commission/${userId}/${currentYear}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Nhóm dữ liệu theo tháng
      const groupedData: GroupedCommission[] = data.map((monthData: any) => {
        return {
          month: `${monthData.month}/${currentYear}`,
          items: monthData.commissions.map((commission: CommissionItem) => ({
            ...commission,
            // Chuyển đổi created_at thành định dạng ngày hiển thị
            created_at: new Date(commission.created_at).toLocaleDateString('vi-VN')
          }))
        };
      });
      
      setCommissionData(groupedData);
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được tạo
  useEffect(() => {
    fetchCommissionData(4); // ID của người dùng
  }, []);

  // Hàm định dạng số tiền thành VND
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const showFilterDrawer = () => {
    setIsFilterDrawerVisible(true);
  };
  
  const showTimeDrawer = () => {
    setIsTimeDrawerVisible(true);
  };

  useEffect(() => {
    if (isFilterDrawerVisible) {
      // Reset position before animation starts
      drawerTranslateY.setValue(300);
      overlayOpacity.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(drawerTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(drawerTranslateY, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isFilterDrawerVisible]);
  
  useEffect(() => {
    if (isTimeDrawerVisible) {
      // Reset position before animation starts
      timeDrawerTranslateY.setValue(300);
      timeOverlayOpacity.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(timeOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(timeDrawerTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(timeOverlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(timeDrawerTranslateY, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isTimeDrawerVisible]);

  const hideFilterDrawer = () => {
    setIsFilterDrawerVisible(false);
  };
  
  const hideTimeDrawer = () => {
    setIsTimeDrawerVisible(false);
  };
  
  const getTimeFilterText = () => {
    switch(timeFilter) {
      case 'recent3Months': return '03 tháng gần nhất';
      case 'recent6Months': return '06 tháng gần nhất';
      case 'recent9Months': return '09 tháng gần nhất';
      case 'recent1Year': return '01 năm gần nhất';
      default: return '03 tháng gần nhất';
    }
  };

  const renderCommissionItem = ({ item }: { item: CommissionItem }) => (
    <View style={styles.commissionItem}>
      <View style={styles.commissionItemLeft}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SolarMax</Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemCode}>HĐ-{item.id}</Text>
          <Text style={styles.itemCustomer}>Mã KH: {item.seller}</Text>
          <Text style={styles.itemDate}>{item.created_at}</Text>
        </View>
      </View>
      <View style={styles.commissionItemRight}>
        <Text style={styles.itemAmount}>{formatMoney(item.money)}</Text>
        <Text style={[
          styles.itemStatus, 
          item.paid ? styles.statusPaid : styles.statusUnpaid
        ]}>
          {item.paid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
        </Text>
      </View>
    </View>
  );

  const renderMonthSection = ({ item }: { item: GroupedCommission }) => (
    <View style={styles.monthSection}>
      <Text style={styles.monthTitle}>{item.month}</Text>
      {item.items.map(commissionItem => (
        <View key={commissionItem.id}>
          {renderCommissionItem({ item: commissionItem })}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Stack.Screen 
        options={{
          headerTitle: "Thống kê hoa hồng",
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerButton}
              testID="back-button"
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm thông tin hợp đồng"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            currentFilter === 'recent3Months' && styles.activeFilterButton
          ]}
          onPress={showTimeDrawer}
        >
          <Ionicons name="calendar-outline" size={18} color={currentFilter === 'recent3Months' ? "#fff" : "#D9261C"} style={styles.filterIcon} />
          <Text style={[
            styles.filterText,
            currentFilter === 'recent3Months' && styles.activeFilterText
          ]}>
            {getTimeFilterText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton, 
            currentFilter === 'category' && styles.activeFilterButton,
            styles.categoryButton
          ]}
          onPress={showFilterDrawer}
        >
          <Ionicons name="pricetag-outline" size={18} color="#666" style={styles.filterIcon} />
          <Text style={styles.filterText}>Danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách hoa hồng */}
      <FlatList
        data={commissionData}
        renderItem={renderMonthSection}
        keyExtractor={(item) => item.month}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Category Filter Drawer */}
      <Modal
        visible={isFilterDrawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideFilterDrawer}
      >
        <View style={styles.drawerOverlay}>
          <Animated.View 
            style={[
              styles.drawerOverlayBackground, 
              { opacity: overlayOpacity }
            ]} 
          >
            <Pressable style={styles.fullSize} onPress={hideFilterDrawer} />
          </Animated.View>
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateY: drawerTranslateY }] }
            ]}
          >
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Danh mục</Text>

            <View style={styles.drawerContent}>
              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setCategoryFilter('all');
                  hideFilterDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>Tất cả</Text>
                <View style={styles.radioButton}>
                  {categoryFilter === 'all' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setCategoryFilter('solarmax');
                  hideFilterDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>SolarMax</Text>
                <View style={styles.radioButton}>
                  {categoryFilter === 'solarmax' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setCategoryFilter('eliton');
                  hideFilterDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>Eliton</Text>
                <View style={styles.radioButton}>
                  {categoryFilter === 'eliton' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Time Filter Drawer */}
      <Modal
        visible={isTimeDrawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideTimeDrawer}
      >
        <View style={styles.drawerOverlay}>
          <Animated.View 
            style={[
              styles.drawerOverlayBackground, 
              { opacity: timeOverlayOpacity }
            ]} 
          >
            <Pressable style={styles.fullSize} onPress={hideTimeDrawer} />
          </Animated.View>
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateY: timeDrawerTranslateY }] }
            ]}
          >
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Thời gian tra cứu</Text>

            <View style={styles.drawerContent}>
              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setTimeFilter('recent3Months');
                  setCurrentFilter('recent3Months');
                  hideTimeDrawer();
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  timeFilter === 'recent3Months' && styles.activeFilterOptionText
                ]}>03 tháng gần nhất</Text>
                <View style={styles.radioButton}>
                  {timeFilter === 'recent3Months' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setTimeFilter('recent6Months');
                  setCurrentFilter('recent6Months');
                  hideTimeDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>06 tháng gần nhất</Text>
                <View style={styles.radioButton}>
                  {timeFilter === 'recent6Months' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setTimeFilter('recent9Months');
                  setCurrentFilter('recent9Months');
                  hideTimeDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>09 tháng gần nhất</Text>
                <View style={styles.radioButton}>
                  {timeFilter === 'recent9Months' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.filterOption} 
                onPress={() => {
                  setTimeFilter('recent1Year');
                  setCurrentFilter('recent1Year');
                  hideTimeDrawer();
                }}
              >
                <Text style={styles.filterOptionText}>01 năm gần nhất</Text>
                <View style={styles.radioButton}>
                  {timeFilter === 'recent1Year' && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeFilterButton: {
    backgroundColor: '#D9261C',
    borderColor: '#D9261C',
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  monthSection: {
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  commissionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  commissionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#09a85c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  itemDetails: {
    justifyContent: 'center',
  },
  itemCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 13,
    color: '#999',
  },
  commissionItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09a85c',
    marginBottom: 5,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusPaid: {
    color: '#09a85c',
  },
  statusUnpaid: {
    color: '#999',
  },
  
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 30,
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  drawerContent: {
    paddingHorizontal: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D9261C',
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
  
  // Additional styles
  activeFilterOptionText: {
    color: '#D9261C',
    fontWeight: '600',
  },
}); 