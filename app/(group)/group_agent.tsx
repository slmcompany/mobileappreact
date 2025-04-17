import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/app/context/AuthContext';

// Định nghĩa các interface cho API
interface Commission {
  id: number;
  created_at: string;
  paid: boolean;
  seller: number;
  money: number;
  sector_id: number;
  contract_id: number | null;
}

interface Agent {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  address: string | null;
  commission_rate: number;
  total_commission: number;
  child_turnover: number;
  created_at: string;
  commissions: Commission[];
  role_id: number;
  code: string | null;
}

// Format currency function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + 'đ';
};

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

export default function GroupAgentScreen() {
  const insets = useSafeAreaInsets();
  const { authState } = useAuth();
  const userId = authState.user?.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalCommission, setTotalCommission] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [newMembersCount, setNewMembersCount] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [currentUser, setCurrentUser] = useState<{name: string}>({name: ''});
  const [recentActivities, setRecentActivities] = useState<{id: number, name: string, amount: number, contractId: string, date: string}[]>([]);
  
  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchAgents = async () => {
      if (!userId) {
        setError('Người dùng chưa đăng nhập');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Lấy thông tin người dùng hiện tại
        const userResponse = await fetch(`https://api.slmglobal.vn/api/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }
        const userData = await userResponse.json();
        setCurrentUser(userData);

        // Lấy danh sách đại lý
        const response = await fetch(`https://api.slmglobal.vn/api/agents/${userId}/downlines`);
        if (!response.ok) {
          throw new Error('Không thể kết nối với server');
        }
        
        const data: Agent[] = await response.json();
        setAgents(data);
        
        // Tính tổng doanh số
        const totalAmount = data.reduce((sum, agent) => sum + agent.child_turnover, 0);
        setTotalCommission(totalAmount);
        
        // Số lượng thành viên
        setMemberCount(data.length);
        
        // Tính số thành viên mới trong tháng
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newMembersCount = data.filter(agent => {
          const createdDate = new Date(agent.created_at);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;
        setNewMembersCount(newMembersCount);
        
        // Tính tổng thưởng từ commissions
        const totalBonus = data.reduce((sum, agent) => 
          sum + agent.commissions.reduce((commissionSum, commission) => 
            commissionSum + commission.money, 0), 0);
        setTotalBonus(totalBonus);
        
        // Lấy các hoạt động gần đây (từ danh sách commissions)
        const activities = data
          .flatMap(agent => 
            agent.commissions.map(commission => ({
              id: commission.id,
              name: agent.name,
              amount: commission.money,
              contractId: commission.contract_id ? `Hợp đồng ${commission.contract_id}` : `SL-${commission.id}`,
              date: formatDate(commission.created_at)
            }))
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setRecentActivities(activities);
      } catch (err) {
        console.error('Error:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [userId]);

  // Lấy top 3 agent có tổng doanh số cao nhất
  const topAgents = agents
    .slice()
    .sort((a, b) => b.child_turnover - a.child_turnover)
    .slice(0, 3)
    .map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      amount: agent.child_turnover,
      rank: index + 1
    }));

  // Activity Item component
  const ActivityItem = ({ activity }: { activity: {id: number, name: string, amount: number, contractId: string, date: string} }) => {
    const agent = agents.find(a => a.name === activity.name);
    return (
      <View style={styles.activityItem}>
        <Image 
          source={agent?.avatar ? { uri: agent.avatar } : require('@/assets/images/agent_avatar.png')} 
          style={styles.activityAvatar} 
        />
        <View style={styles.activityContent}>
          <View style={styles.activityNameTime}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityTime}>{activity.date}</Text>
          </View>
          <View style={styles.activityAmountContainer}>
            <Text style={styles.activityAmount}>{formatCurrency(activity.amount).replace('đ', '')}</Text>
            <Text style={styles.activityContract}>{activity.contractId}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Top Agent Item component
  const TopAgentItem = ({ agent }: { agent: {id: number, name: string, amount: number, rank: number} }) => {
    const agentData = agents.find(a => a.id === agent.id);
    // Determine colors based on rank
    const getRankColor = () => {
      switch(agent.rank) {
        case 1: return { bgColor: '#FDB022', textColor: '#FFFFFF' };
        case 2: return { bgColor: '#FEF0C7', textColor: '#F79009' };
        case 3: return { bgColor: '#F5F5F8', textColor: '#ED1C24' };
        default: return { bgColor: '#F5F5F8', textColor: '#27273E' };
      }
    };
    
    const { bgColor, textColor } = getRankColor();
    
    return (
      <View style={[styles.topAgentItem, { backgroundColor: bgColor }]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: textColor }]}>#{agent.rank}</Text>
        </View>
        <View style={styles.agentCardContent}>
          <View style={styles.agentInfoRow}>
            <Image 
              source={agentData?.avatar ? { uri: agentData.avatar } : require('@/assets/images/agent_avatar.png')} 
              style={styles.topAgentAvatar} 
            />
            <View>
              <Text style={styles.topAgentName}>{agent.name}</Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.topAgentAmount}>{formatCurrency(agent.amount)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <ScrollView style={styles.scrollContainer}>
        {/* Group Info Section */}
        <View style={styles.groupInfoSection}>
          {/* Group Header */}
          <View style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>NHÓM ĐẠI LÝ CỦA {currentUser.name.toUpperCase()}</Text>
            <View style={styles.leadershipBadge}>
              <Text style={styles.leadershipText}>BẠN ĐANG LÀ TRƯỞNG NHÓM</Text>
              <Ionicons name="flame" size={12} color="#FEC84B" />
            </View>
          </View>

          {/* Members Panel */}
          <View style={styles.membersPanel}>
            <View style={styles.memberCount}>
              <View style={styles.memberCountRow}>
                <Text style={styles.memberCountText}>{memberCount} thành viên</Text>
                <TouchableOpacity onPress={() => router.push('/group_users')}>
                  <Image 
                    source={require('@/assets/images/group-arrows-Icon.png')}
                    style={{ width: 16, height: 16 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.newMemberText}>{newMembersCount} thành viên mới</Text>
            </View>
            
            <View style={styles.avatarGroup}>
              {agents.slice(0, 4).map((agent, index) => (
                <TouchableOpacity 
                  key={agent.id}
                  onPress={() => router.push('/group_users')}
                >
                  <Image 
                    source={agent.avatar ? { uri: agent.avatar } : require('@/assets/images/agent_avatar.png')} 
                    style={[styles.avatarGroupItem, index > 0 && styles.avatarOverlap]} 
                  />
                </TouchableOpacity>
              ))}
              {agents.length > 4 && (
                <TouchableOpacity 
                  onPress={() => router.push('/group_users')}
                  style={[styles.avatarCountContainer, styles.avatarOverlap]}
                >
                  <Text style={styles.avatarCountText}>+{agents.length - 4}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Sales Stats */}
          <View style={styles.salesStats}>
            <View>
              <Text style={styles.salesLabel}>Doanh số tháng này</Text>
              <Text style={styles.salesAmount}>{formatCurrency(totalCommission)}</Text>
              <Text style={styles.orderCount}>{recentActivities.length} đơn hàng</Text>
            </View>
            <View>
              <View style={styles.bonusLabel}>
                <Ionicons name="information-circle-outline" size={12} color="#7B7D9D" />
                <Text style={styles.bonusLabelText}>Thưởng doanh số dự kiến</Text>
              </View>
              <Text style={styles.bonusAmount}>{formatCurrency(totalBonus)}</Text>
            </View>
          </View>
        </View>

        {/* Top Sales Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top doanh số</Text>
          </View>
          
          <View style={styles.topAgentsContainer}>
            {topAgents.map(agent => (
              <TopAgentItem key={agent.id} agent={agent} />
            ))}
          </View>
        </View>

        {/* Recent Activities Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            <TouchableOpacity style={styles.historyButton}>
              <Ionicons name="time-outline" size={16} color="#ED1C24" />
              <Text style={styles.historyButtonText}>Lịch sử</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activitiesContainer}>
            {recentActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  scrollContainer: {
    flex: 1,
  },
  groupInfoSection: {
    backgroundColor: '#F5F5F8',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#C71A21',
    padding: 8,
    paddingHorizontal: 16,
  },
  groupHeaderText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  leadershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leadershipText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  membersPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ED1C24',
  },
  memberCount: {
    justifyContent: 'center',
  },
  memberCountRow: {
    flexDirection: 'row',
    gap: 4,
  },
  memberCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newMemberText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFBFC1',
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatarGroupItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarCountContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarCountText: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  salesStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
  },
  salesLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  salesAmount: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ED1C24',
  },
  orderCount: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9394B0',
  },
  bonusLabel: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  bonusLabelText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  bonusAmount: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ED1C24',
    textAlign: 'right',
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#27273E',
    flex: 1,
  },
  sectionPeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ED1C24',
  },
  topAgentsContainer: {
    paddingHorizontal: 16,
    gap: 4,
    marginTop: 8,
  },
  topAgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
    padding: 4,
    paddingLeft: 12,
  },
  rankContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '500',
  },
  agentCardContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(39, 39, 62, 0.16)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  agentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  topAgentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCE6',
  },
  topAgentName: {
    fontSize: 14,
    color: '#27273E',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  topAgentAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9394B0',
  },
  activitiesContainer: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  activityAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCE6',
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityNameTime: {
    flexDirection: 'column',
  },
  activityName: {
    fontSize: 14,
    color: '#27273E',
  },
  activityTime: {
    fontSize: 10,
    color: '#7B7D9D',
  },
  activityAmountContainer: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  activityContract: {
    fontSize: 10,
    color: '#7B7D9D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: '#ED1C24',
    fontSize: 14,
    textAlign: 'center',
  },
});