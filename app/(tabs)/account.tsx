import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

export default function AccountScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<PotentialCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu khách hàng từ API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://id.slmsolar.com/api/agents/4/potential-customers');
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải dữ liệu khách hàng');
      setLoading(false);
      console.error('Error fetching customers:', err);
    }
  };

  // Render customer item
  const renderCustomerItem = ({ item }: { item: PotentialCustomer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerPhone}>{item.phone || 'Chưa có số điện thoại'}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="cube-outline" size={20} color="#12B669" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="book-outline" size={20} color="#2E90FA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={20} color="#ED1C24" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Khách hàng tiềm năng</Text>
        <TouchableOpacity onPress={() => router.push('/new-contact')}>
          <Ionicons name="add" size={24} color="#00A650" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity style={styles.activeFilterTab}>
          <Text style={styles.activeTabText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.tabText}>Tiềm năng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.tabText}>Đã mua hàng</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.createButton} onPress={fetchCustomers}>
            <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : customers.length === 0 ? (
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
            data={customers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.statsCard}>
                <View style={styles.statsContent}>
                  <Text style={styles.statsTitle}>Chủ động thêm thông tin khách hàng để không bỏ lỡ cơ hội.</Text>
                  <Text style={styles.statsSubtitle}>Bạn đang có {customers.length}/20 khách hàng tiềm năng</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(customers.length / 20) * 100}%` }]} />
                  </View>
                </View>
                <TouchableOpacity style={styles.statsButton} onPress={() => router.push('/new-contact')}>
                  <Text style={styles.statsButtonText}>Thêm khách hàng mới</Text>
                  <Ionicons name="arrow-forward" size={16} color="#ED1C24" />
                </TouchableOpacity>
              </View>
            }
          />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/gallery")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="newspaper-outline" size={24} color="#ED1C24" />
            </View>
            <Text style={styles.menuText}>Thư viện bài viết</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
  statsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ED1C24',
  },
  statsSubtitle: {
    fontSize: 8,
    color: 'rgba(39, 39, 62, 0.7)',
  },
  progressBarContainer: {
    height: 4,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ED1C24',
    borderRadius: 4,
  },
  statsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#fff',
  },
  statsButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ED1C24',
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