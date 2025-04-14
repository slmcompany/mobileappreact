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
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Định nghĩa các interface cho API
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
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export default function GroupAgentScreen() {
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        // Lấy danh sách đại lý
        const response = await fetch('https://id.slmsolar.com/api/agents/4/downlines');
        if (!response.ok) {
          throw new Error('Không thể kết nối với server');
        }
        
        const data: Agent[] = await response.json();
        setAgents(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Member Item component
  const MemberItem = ({ agent }: { agent: Agent }) => {
    const handlePhoneCall = () => {
      const phoneNumber = agent.phone.replace(/\D/g, ''); // Remove non-numeric characters
      Linking.openURL(`tel:${phoneNumber}`);
    };

    return (
      <View style={styles.memberItem}>
        <Image 
          source={agent.avatar ? { uri: agent.avatar } : require('@/assets/images/agent_avatar.png')} 
          style={styles.memberAvatar} 
        />
        <View style={styles.memberContent}>
          <Text style={styles.memberName}>{agent.name}</Text>
          <Text style={styles.memberPhone}>{agent.phone}</Text>
        </View>
        <TouchableOpacity style={styles.phoneButton} onPress={handlePhoneCall}>
          <Ionicons name="call-outline" size={24} color="#ED1C24" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.sectionContainer}>
         
          <View style={styles.membersContainer}>
            {agents.map(agent => (
              <MemberItem key={agent.id} agent={agent} />
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  membersContainer: {
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F8',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCDCE6',
  },
  memberContent: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#27273E',
  },
  memberPhone: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: 2,
  },
  phoneButton: {
    padding: 8,
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