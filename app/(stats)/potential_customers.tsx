import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import { useRouter, Stack, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface cho khách hàng tiềm năng
interface PotentialCustomer {
  id: number;
  name: string;
  phone: string | null;
  email: boolean | string;
  address: string;
  created_at: string | null;
  notes?: string;
  agent_id: number;
  province: string;
  ward: string;
  description: string | null;
  gender: boolean;
  district: string;
  interested_in_combo_id: number;
  assumed_code: string;
}

export default function PotentialCustomersScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<PotentialCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Mô phỏng việc tải dữ liệu từ API
  useEffect(() => {
    const fetchPotentialCustomers = async () => {
      try {
        setLoading(true);
        
        // Lấy user_id từ AsyncStorage hoặc mặc định là 4
        let userId = 4;
        try {
          const userData = await AsyncStorage.getItem('@slm_user_data');
          if (userData) {
            const user = JSON.parse(userData);
            userId = user.id || 4;
          }
        } catch (error) {
          console.error('Lỗi khi lấy user ID:', error);
        }
        
        // Gọi API lấy danh sách khách hàng tiềm năng
        const response = await fetch(`https://api.slmglobal.vn/api/agents/${userId}/potential-customers`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Chuyển đổi dữ liệu từ API sang định dạng dùng trong ứng dụng
        const formattedData = data.map((item: PotentialCustomer) => ({
          ...item,
          notes: item.description || '',
          phone: item.phone || 'Chưa cập nhật',
          email: typeof item.email === 'boolean' ? 'Chưa cập nhật' : item.email,
          created_at: item.created_at || new Date().toISOString().split('T')[0]
        }));
        
        setCustomers(formattedData);
      } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng tiềm năng:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentialCustomers();
  }, []);

  // Lọc khách hàng theo tìm kiếm
  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (customer.phone && customer.phone.includes(searchQuery)) ||
      (typeof customer.email === 'string' && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Render từng mục khách hàng
  const renderCustomerItem = ({ item }: { item: PotentialCustomer }) => (
    <TouchableOpacity 
      style={styles.customerItem}
      onPress={() => {
        // Sẽ điều hướng đến trang chi tiết khách hàng
        // router.push(`/(stats)/customer_detail?id=${item.id}`);
        console.log('Xem chi tiết khách hàng:', item.id);
      }}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInitials}>
          <Text style={styles.initialsText}>{item.name.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.customerDate}>
          <Text style={styles.dateText}>{item.created_at ? formatDate(item.created_at) : 'Chưa cập nhật'}</Text>
        </View>
      </View>
      
      <View style={styles.customerNotes}>
        <Text style={styles.notesLabel}>Ghi chú:</Text>
        <Text style={styles.notesText} numberOfLines={2}>{item.notes || 'Không có ghi chú'}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render header phần danh sách
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Danh sách khách hàng tiềm năng</Text>
      <Text style={styles.listHeaderCount}>{filteredCustomers.length} khách hàng</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Khách hàng tiềm năng',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // Mở trang thêm khách hàng mới
                console.log('Thêm khách hàng mới');
              }}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#ED1C24" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7B7D9D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7B7D9D" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
          <Text style={styles.loadingText}>Đang tải danh sách khách hàng...</Text>
        </View>
      ) : filteredCustomers.length > 0 ? (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Không tìm thấy khách hàng nào</Text>
          <Text style={styles.emptySubtext}>Thử thay đổi từ khóa tìm kiếm hoặc thêm khách hàng mới</Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Mở trang thêm khách hàng mới
          console.log('Thêm khách hàng mới từ FAB');
        }}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#27273E',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27273E',
  },
  listHeaderCount: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  listContent: {
    paddingBottom: 20,
  },
  customerItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27273E',
  },
  customerPhone: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  customerDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  customerNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F3',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  notesText: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7B7D9D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27273E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
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
    }),
  },
}); 