import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Định nghĩa interface cho user
interface User {
  id: number;
  name: string;
  phone: string;
  address?: string;
  avatar?: string;
  code?: string;
  role?: {
    name: string;
    description: string | null;
    id: number;
  };
}

// Định nghĩa interface cho commission
interface Commission {
  id: number;
  created_at: string;
  paid: boolean;
  seller: number;
  money: number;
  sector_id: number;
  sector: any;
}

interface MonthlyCommission {
  month: number;
  commissions: Commission[];
}

// Định nghĩa interface cho agent downline
interface Downline {
  id: number;
  name: string;
  phone: string;
  email: string;
  parent_id: number;
}

export default function StatsScreen() {
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissionData, setCommissionData] = useState<MonthlyCommission[]>([]);
  const [totalCommissions, setTotalCommissions] = useState<number>(0);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState<number>(0);
  const [totalContractAmount, setTotalContractAmount] = useState<number>(0);
  const [currentMonthCommissions, setCurrentMonthCommissions] = useState<number>(0);
  const [monthlyAmounts, setMonthlyAmounts] = useState<number[]>(Array(12).fill(0));
  const [downlinesCount, setDownlinesCount] = useState<number>(0);
  const [potentialCustomersCount, setPotentialCustomersCount] = useState<number>(0);

  // Đầu tiên, lấy user ID từ AsyncStorage
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

  // Sau khi có userId, gọi API để lấy thông tin user
  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
      fetchCommissionData(userId);
      fetchDownlines(userId);
      fetchPotentialCustomersCount(userId);
    }
  }, [userId]);

  // Xử lý dữ liệu commission sau khi nhận được
  useEffect(() => {
    if (commissionData.length > 0) {
      // Tính tổng số hợp đồng
      const total = commissionData.reduce((sum, month) => sum + month.commissions.length, 0);
      setTotalCommissions(total);

      // Tính tổng tiền hoa hồng và tổng doanh số
      const totalAmount = commissionData.reduce((sum, month) => {
        return sum + month.commissions.reduce((monthSum, comm) => monthSum + comm.money, 0);
      }, 0);
      setTotalCommissionAmount(totalAmount);

      // Tính tổng doanh số theo hợp đồng
      const totalContract = commissionData.reduce((sum, month) => {
        return sum + month.commissions.reduce((monthSum, comm) => monthSum + (comm.sector?.total_amount || 0), 0);
      }, 0);
      setTotalContractAmount(totalContract);

      // Lấy số hợp đồng tháng hiện tại
      const currentMonth = new Date().getMonth() + 1; // getMonth() trả về 0-11
      const currentMonthData = commissionData.find(m => m.month === currentMonth);
      if (currentMonthData) {
        setCurrentMonthCommissions(currentMonthData.commissions.length);
      }

      // Cập nhật dữ liệu cho biểu đồ
      const monthlyData = Array(12).fill(0);
      commissionData.forEach(monthData => {
        if (monthData.month >= 1 && monthData.month <= 12) {
          const monthAmount = monthData.commissions.reduce((sum, comm) => sum + comm.money, 0);
          monthlyData[monthData.month - 1] = monthAmount;
        }
      });
      setMonthlyAmounts(monthlyData);
    }
  }, [commissionData]);

  const fetchUserData = async (id: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://api.slmglobal.vn/api/users/${id}`, {
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
      
      if (data) {
        setUser({
          id: data.id || 0,
          name: data.name || 'Chưa có tên',
          phone: data.phone || '',
          address: data.address || '',
          avatar: data.avatar || '',
          code: data.code || `AG${data.id || '0000'}`,
          role: data.role
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
      
      // Đặt người dùng mặc định nếu có lỗi
      setUser({
        id: 0,
        name: 'Tùy Phong',
        phone: '',
        code: 'AG1203'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionData = async (id: number) => {
    try {
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
    }
  };

  const fetchDownlines = async (id: number) => {
    try {
      const response = await fetch(`https://api.slmglobal.vn/api/agents/${id}/downlines`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi lấy dữ liệu thành viên: ${response.status}`);
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
        setDownlinesCount(data.length);
      } else {
        setDownlinesCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thành viên cộng đồng:', error);
      setDownlinesCount(0);
    }
  };

  const fetchPotentialCustomersCount = async (id: number) => {
    try {
      const response = await fetch(`https://api.slmglobal.vn/api/agents/${id}/potential-customers`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi lấy dữ liệu khách hàng tiềm năng: ${response.status}`);
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
      
      // Parse JSON và lấy số lượng
      const data = JSON.parse(text);
      
      if (data && Array.isArray(data)) {
        setPotentialCustomersCount(data.length);
      } else {
        setPotentialCustomersCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu khách hàng tiềm năng:', error);
      setPotentialCustomersCount(0);
    }
  };

  // Lấy 2 ký tự đầu của tên để hiển thị khi không có avatar
  const getInitials = (name: string) => {
    return name?.trim().substring(0, 2).toUpperCase() || 'TP';
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

  const navigateToCommissionStats = () => {
    router.push('/(stats)/comission_history');
  };

  const navigateToCommunity = () => {
    router.push('/(group)/group_agent');
  };

  const navigateToPotentialCustomers = () => {
    router.push('/(tabs)/account');
  };

  // Tìm tháng có giá trị lớn nhất để hiển thị tooltip
  const maxMonthIndex = monthlyAmounts.indexOf(Math.max(...monthlyAmounts));
  const maxAmount = monthlyAmounts[maxMonthIndex];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={[
        styles.profileSection,
        { paddingTop: insets.top > 0 ? insets.top + 20 : 30 }
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066ff" />
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <View style={styles.userProfile}>
                {user?.avatar ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <View style={styles.textAvatar}>
                    <Text style={styles.textAvatarContent}>{getInitials(user?.name || '')}</Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.profileName}>{user?.name || 'Đang tải...'}</Text>
                  <Text style={styles.profileId}>{user?.phone || ''}</Text>
                </View>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>CÔNG TY CP ĐẦU TƯ SLM</Text>
                <View style={styles.agentBadge}>
                  <Text style={styles.agentBadgeText}>{user?.role?.name?.toUpperCase() || 'CUSTOMER'}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
      
      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, styles.halfCard]}>
          <Text style={styles.cardLabel}>Tổng số hợp đồng</Text>
          <Text style={styles.cardValue}>{totalCommissions}</Text>
        </View>
        
        <View style={[styles.statsCard, styles.halfCard]}>
          <Text style={styles.cardLabel}>Tổng doanh số</Text>
          <Text style={[styles.cardValue, styles.valueGreen]}>{formatCurrency(totalContractAmount)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statsCard, styles.fullCard]}
          onPress={navigateToCommissionStats}
        >
          <Text style={styles.cardLabel}>Hoa hồng đã nhận</Text>
          <Text style={[styles.cardValue, styles.valueGreen]}>{formatCurrency(totalCommissionAmount)}</Text>
        </TouchableOpacity>
      </View>
      
      {/* List Items */}
      <TouchableOpacity 
        style={styles.listItem}
        onPress={navigateToPotentialCustomers}
      >
        <Text style={styles.listItemText}>Khách hàng tiềm năng</Text>
        <View style={styles.listItemRight}>
          <Text style={styles.listItemValue}>{potentialCustomersCount} người</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.listItem}
        onPress={navigateToCommunity}
      >
        <Text style={styles.listItemText}>Cộng đồng</Text>
        <View style={styles.listItemRight}>
          <Text style={styles.listItemValue}>{downlinesCount} thành viên</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
      
      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <View style={[styles.chartTooltip, {left: `${(maxMonthIndex / 11) * 100}%`}]}>
          <Text style={styles.tooltipText}>{formatCurrency(maxAmount)} đ</Text>
        </View>
        
        <View style={styles.chartBars}>
          {months.map((month, index) => {
            // Tính chiều cao tương đối dựa trên giá trị lớn nhất
            const barHeight = maxAmount > 0 
              ? Math.max(30, (monthlyAmounts[index] / maxAmount) * 170) 
              : 30;
              
            return (
              <View key={index} style={styles.barColumn}>
                <View 
                  style={[
                    styles.bar, 
                    { height: barHeight },
                    index === maxMonthIndex ? styles.activeBar : styles.inactiveBar
                  ]} 
                />
                <Text style={styles.monthLabel}>{month}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Bottom Stats */}
      <View style={styles.bottomStats}>
        <View style={styles.statsGridRow}>
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.orangeIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Hợp đồng tháng này</Text>
              <Text style={styles.statCardValue}>{currentMonthCommissions}</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.blueIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Thu nhập dự kiến</Text>
              <Text style={styles.statCardValue}>{formatCurrency(totalCommissionAmount)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsGridRow}>
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.grayIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Tổng số hợp đồng</Text>
              <Text style={styles.statCardValue}>{totalCommissions}</Text>
              <TouchableOpacity style={styles.circleArrow}>
                <Text style={styles.circleArrowText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.gridCard]}
            onPress={navigateToCommissionStats}
          >
            <View style={[styles.statCardIndicator, styles.greenIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Hoa hồng đã nhận</Text>
              <Text style={styles.statCardValue}>{formatCurrency(totalCommissionAmount)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc5c5',
  },
  textAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc5c5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAvatarContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27273E',
  },
  profileId: {
    fontSize: 14,
    color: '#7B7D9D',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
  halfCard: {
    flex: 0.48,
  },
  fullCard: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#444',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066ff',
    marginTop: 5,
  },
  valueGreen: {
    color: '#00aa00',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    paddingBottom: 30,
    paddingTop: 30,
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
  chartTooltip: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  activeBar: {
    backgroundColor: '#ff0000',
  },
  inactiveBar: {
    backgroundColor: '#ffcccc',
  },
  monthLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  bottomStats: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  gridCard: {
    flex: 0.48,
  },
  statCardIndicator: {
    width: 8,
  },
  orangeIndicator: {
    backgroundColor: '#ff9900',
  },
  blueIndicator: {
    backgroundColor: '#0066cc',
  },
  grayIndicator: {
    backgroundColor: '#999999',
  },
  greenIndicator: {
    backgroundColor: '#00aa00',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    flex: 1,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  circleArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  circleArrowText: {
    fontSize: 14,
    color: '#666',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfo: {
    justifyContent: 'center',
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
    marginBottom: 4,
  },
  agentBadge: {
    backgroundColor: '#ED1C24',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  agentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
}); 