import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number;
  name: string;
  phone: string;
  address: string;
  avatar: string;
}

// Định nghĩa kiểu dữ liệu cho thiết bị
interface Device {
  id: number;
  name: string;
  activationDate: string;
  warrantyPeriod: string;
  expireDate: string;
  progressPercent: number;
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
}

// Định nghĩa kiểu dữ liệu cho bài viết
interface Article {
  id: number;
  author: string;
  title: string;
  time: string;
  isLight: boolean;
  hasIndicator: boolean;
}

export default function ProfileContractScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [merchandises, setMerchandises] = useState<PreQuoteMerchandise[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contractCode, setContractCode] = useState<string>('');
  const [contractActivationDate, setContractActivationDate] = useState<string>('');

  // Lấy 2 ký tự đầu của tên
  const getInitials = (name: string) => {
    return name?.trim().substring(0, 2).toUpperCase() || '';
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://id.slmsolar.com/api/users/14', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.status}`);
        }
        
        const data = await response.json();
        if (data) {
          setUser({
            id: data.id || 0,
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            avatar: data.avatar || ''
          });

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
                  updated_at: item.updated_at || ''
                }));
              setMerchandises(merchandisesData);
              setLoading(false);
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
        console.error('Error fetching user:', error);
        setUser(null);
        // Vẫn phải fetch contract nếu user API không trả về contract
        fetchContract();
      }
    };

    const fetchContract = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

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
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://slmsolar.com/api/articles', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching articles: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.data) {
          const mappedArticles = data.data.map((article: any, index: number) => ({
            id: article.id,
            author: article.author || '',
            title: article.title || '',
            time: article.created_at ? formatTimeAgo(new Date(article.created_at)) : '',
            isLight: index % 2 === 0,
            hasIndicator: index % 2 === 0
          }));
          setArticles(mappedArticles.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      }
    };

    fetchArticles();
  }, []);

  // Convert API data to device format
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

        return {
          id: item.id,
          name: item.name,
          activationDate: formatDate(activationDate),
          warrantyPeriod: `${item.warranty_years} năm`,
          expireDate: formatDate(expireDate),
          progressPercent: progressPercent
        };
      });

      setDevices(mappedDevices);
    }
  }, [merchandises, contractActivationDate]);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} days ago`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.textAvatar}>
              <Text style={styles.textAvatarContent}>{getInitials(user?.name || '')}</Text>
            </View>
          )}
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>Chào, {user?.name || ''}</Text>
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={20} color="#27273E" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDeviceSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thiết bị của bạn</Text>
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
      
      <View style={styles.deviceIdContainer}>
        <Text style={styles.deviceId}>{contractCode}</Text>
      </View>
      
      <View style={styles.deviceList}>
        {devices.map(device => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceCardContent}>
              <View style={styles.deviceImagePlaceholder} />
              
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
    </View>
  );

  const renderArticleItem = (article: Article) => (
    <View key={article.id} style={article.isLight ? styles.articleCard : styles.articleCardDark}>
      {article.isLight ? (
        <>
          <View style={styles.articleHeader}>
            <Image 
              source={{ uri: '' }} 
              style={styles.articleAvatar} 
            />
            <Text style={styles.articleAuthor}>{article.author}</Text>
          </View>
          {article.hasIndicator && (
            <View style={styles.articleIndicator}>
              <Text style={styles.indicatorText}>1/3</Text>
            </View>
          )}
          <View style={styles.articleContent}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <View style={styles.articleTimeContainer}>
              <Text style={styles.articleTime}>{article.time}</Text>
            </View>
          </View>
        </>
      ) : (
        <LinearGradient
          colors={['rgba(39, 39, 62, 0)', 'rgba(39, 39, 62, 0.75)']}
          style={styles.darkGradient}
        >
          <View style={styles.articleHeaderDark}>
            <Image 
              source={{ uri: '' }} 
              style={styles.articleAvatar} 
            />
            <Text style={styles.articleAuthorDark}>{article.author}</Text>
          </View>
          <View style={styles.articleContentDark}>
            <Text style={styles.articleTitleDark}>{article.title}</Text>
            <View style={styles.articleTimeContainer}>
              <Text style={styles.articleTimeDark}>{article.time}</Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );

  const renderArticleSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.sectionButtonText}>Khám phá</Text>
          <Ionicons name="arrow-forward-circle-outline" size={20} color="#ED1C24" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.articleList}
      >
        {articles.map(article => renderArticleItem(article))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        <View style={styles.content}>
          {renderDeviceSection()}
          {renderArticleSection()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ED1C24',
    paddingTop: 44,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ABACC2',
  },
  textAvatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ABACC2',
    backgroundColor: '#FFECED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAvatarContent: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    color: '#ED1C24',
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    color: '#FFFFFF',
  },
  userPhone: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#F79009',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: 'rgba(39, 39, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 12,
    backgroundColor: '#F79009',
    top: 8,
    right: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F8',
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 28,
    color: '#27273E',
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
    marginBottom: 12,
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
  deviceImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5E5',
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
  articleList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    flexDirection: 'row',
  },
  articleCard: {
    width: 150,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  articleCardDark: {
    width: 142,
    height: 252,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  articleHeaderDark: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  articleAvatar: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ABACC2',
  },
  articleAuthor: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    color: '#27273E',
  },
  articleAuthorDark: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  articleIndicator: {
    backgroundColor: '#27273E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    margin: 8,
  },
  indicatorText: {
    fontFamily: 'Roboto',
    fontSize: 8,
    color: '#FFFFFF',
  },
  articleContent: {
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  articleContentDark: {
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
    justifyContent: 'flex-end',
    flex: 1,
  },
  articleTitle: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#27273E',
  },
  articleTitleDark: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#FFFFFF',
  },
  articleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleTime: {
    fontFamily: 'Roboto',
    fontSize: 8,
    color: '#9394B0',
  },
  articleTimeDark: {
    fontFamily: 'Roboto',
    fontSize: 8,
    color: '#DCDCE6',
  },
  darkGradient: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

