import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Linking,
  TextInput,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from 'lodash/debounce';

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

// Helper function to remove Vietnamese accents
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export default function GroupAgentScreen() {
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Agent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchWidth = useRef(new Animated.Value(40)).current;
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        const searchLower = removeAccents(query.toLowerCase());
        const results = agents.filter(agent => {
          const agentName = removeAccents(agent.name.toLowerCase());
          const agentPhone = removeAccents(agent.phone.toLowerCase());
          return (
            agentName.includes(searchLower) ||
            agentPhone.includes(searchLower)
          );
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300),
    [agents]
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const activateSearch = () => {
    setIsSearchActive(true);
    Animated.timing(searchWidth, {
      toValue: Dimensions.get('window').width - 32,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const deactivateSearch = (shouldReset: boolean = false) => {
    Animated.timing(searchWidth, {
      toValue: 40,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setIsSearchActive(false);
      if (shouldReset) {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
      }
    });
  };

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

  const renderSearchResults = () => {
    if (!isSearchActive) return null;

    if (isSearching) {
      return (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="small" color="#ED1C24" />
          <Text style={styles.searchLoadingText}>Đang tìm kiếm...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim()) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={24} color="#7B7D9D" />
          <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
        </View>
      );
    }

    return null;
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
          <View style={styles.filterRow}>
            {!isSearchActive && (
              <Text style={styles.memberCount}>Tất cả {agents.length} thành viên</Text>
            )}
            <Animated.View style={[
              styles.searchContainer, 
              { 
                width: searchWidth,
                flex: isSearchActive ? 1 : 0
              }
            ]}>
              {isSearchActive ? (
                <View style={styles.searchInputContainer}>
                  <Image 
                    source={require('@/assets/images/search-icon.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm thành viên"
                    placeholderTextColor="#7B7D9D"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => deactivateSearch(true)}>
                    <Image 
                      source={require('@/assets/images/cross.png')}
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.searchButton} onPress={activateSearch}>
                  <Image 
                    source={require('@/assets/images/search-icon.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {renderSearchResults()}
         
          <View style={styles.membersContainer}>
            {(searchResults.length > 0 ? searchResults : agents).map(agent => (
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F8',
  },
  memberCount: {
    fontSize: 14,
    color: '#7B7D9D',
    fontWeight: '500',
  },
  searchContainer: {
    height: 40,
    backgroundColor: '#F5F5F8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#27273E',
    height: 40,
    padding: 0,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  searchLoadingText: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#7B7D9D',
  },
});