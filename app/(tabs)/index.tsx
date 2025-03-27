import React, { useState, useRef, Fragment } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text as RNText, Image, SafeAreaView, Platform, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { 
  Card, 
  Text, 
  Button,
  Flex, 
  WhiteSpace, 
  WingBlank,
  Icon,
  TabBar
} from '@ant-design/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data cho sản phẩm
const brandData = [
  {
    id: '1',
    name: 'SOLAR MAX',
    logo: require('../../assets/images/solarmax-logo.png'),
  },
  {
    id: '2',
    name: 'ELITON',
    logo: require('../../assets/images/eliton-logo.png'),
    
  },
];

// Mock data cho promo cards
const promoCards = [
  {
    id: '1',
    action: 'Bán hàng',
    mainText: 'THẬT DỄ DÀNG',
    buttonText: 'Bắt đầu ngay',
    backgroundColor: '#D9261C',
    image: require('../../assets/images/sales-promo.png'),
  },
  {
    id: '2',
    action: 'Tạo lập Đội nhóm',
    mainText: 'Gia tăng thu nhập',
    buttonText: 'Bắt đầu ngay',
    backgroundColor: '#D9261C',
    image: require('../../assets/images/team-promo.png'),
  },
];

// Mock data cho sản phẩm bán chạy
const bestSellerProducts = [
  {
    id: '1',
    title: 'Hệ Độc lập Một pha 8kW',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/replace-holder.png'),
  },
  {
    id: '2',
    title: 'Hệ Độc lập Một pha 8kW',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/replace-holder.png'),
  },
  {
    id: '3',
    title: 'Hệ Độc lập Một pha 8kW',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/replace-holder.png'),
  },
];

// Mock data cho cập nhật gần đây
const recentUpdates = [
  {
    id: '1',
    brand: 'SOLAR MAX',
    brandLogo: require('../../assets/images/solarmax-logo.png'),
    modelNumber: 'SLM-DA884',
    date: '15/03/2025',
    type: 'Đặt hàng lại',
  },
  {
    id: '2',
    brand: 'ELITON',
    brandLogo: null,
    modelNumber: 'ELT-DA021',
    date: '15/03/2025',
    type: 'Hàng tháng',
  },
  {
    id: '3',
    brand: 'SOLAR MAX',
    brandLogo: require('../../assets/images/solarmax-logo.png'),
    modelNumber: 'SLM-DA884',
    date: '15/03/2025',
    type: 'Hàng tháng đơn lẻ',
  },
];

// Mock data cho bài viết
const articles = [
  {
    id: '1',
    title: 'Thang máy gia đình',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/bai-viet-moi-nhat-sample.png'),
  },
  {
    id: '2',
    title: 'Thang máy gia đình',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/bai-viet-moi-nhat-sample.png'),
  },
  {
    id: '3',
    title: 'Thang máy gia đình',
    description: 'Thang máy cao cấp dành cho gia đình',
    image: require('../../assets/images/bai-viet-moi-nhat-sample.png'),
  },
];

const ArticleItem = ({ item }: { item: any }) => {
  return (
    <View style={styles.articleCard}>
      <View style={{ overflow: 'hidden', height: 150 }}>
        {item.image ? (
          <Image 
            source={item.image} 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute',
              top: 0,
              left: 0 
            }} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.articleImagePlaceholder}>
            <Ionicons name="newspaper-outline" size={40} color="#888" />
          </View>
        )}
      </View>
      <View style={{ padding: 12, paddingBottom: 0 }}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.articleDescription}>{item.description}</Text>
      </View>
    </View>
  );
};

// Thêm component ProductItem
const ProductItem = ({ item, width }: { item: any, width: number }) => {
  return (
    <View style={[styles.productCard, { width: (width - 48) / 2.5, marginHorizontal: 4, marginBottom: 16 }]}>
      <View style={{ padding: 0, width: '100%', aspectRatio: 1, overflow: 'hidden' }}>
        {item.image ? (
          <Image 
            source={item.image} 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute',
              top: 0,
              left: 0 
            }} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="cube-outline" size={40} color="#888" />
          </View>
        )}
      </View>
      <View style={{ padding: 12, flex: 1 }}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>12.650.000đ</Text>
      </View>
    </View>
  );
};

// Thêm component ProductSection
const ProductSection = ({ title, products, width, flatListRef }: { title: string, products: any[], width: number, flatListRef: any }) => {
  return (
    <>
      <WhiteSpace size="lg" />
      <Flex justify="between" align="center">
        <Text style={styles.sectionSubtitle}>{title}</Text>
        <Button
          type="primary"
          size="small"
          style={{ borderWidth: 0, backgroundColor: 'transparent', paddingRight: 8 }}
        >
          <Flex align="center">
            <Text style={styles.viewAllText}>Tất cả</Text>
            <Image 
              source={require('../../assets/images/arrow-icon.png')} 
              style={{ width: 20, height: 20, marginLeft: 8 }} 
              resizeMode="contain"
            />
          </Flex>
        </Button>
      </Flex>
      
      <WhiteSpace size="lg" />
      <View style={[styles.carouselContainer, { paddingBottom: 16 }]}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={products}
          renderItem={({item}) => (
            <ProductItem item={item} width={width} />
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    </>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const promoFlatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');
  
  const renderTypeTag = (type: string) => {
    let color = '';
    let displayText = type;
    
    switch(type) {
      case 'Đặt hàng lại':
        color = '#E07C24';  // Màu cam đậm hơn
        displayText = 'Xử lý hợp đồng';
        break;
      case 'Hàng tháng':
        color = '#4CAF50';  // Màu xanh lá vừa phải
        displayText = 'Hoàn thành';
        break;
      case 'Hàng tháng đơn lẻ':
        color = '#2196F3';
        break;
      default:
        color = '#999';
    }
    
    return (
      <View style={{
        backgroundColor: color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
        alignSelf: 'flex-start'
      }}>
        <RNText style={{ color: 'white', fontSize: 12 }}>{displayText}</RNText>
      </View>
    );
  };

  const handleProductScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32; // accounting for padding
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activeProductIndex) {
      setActiveProductIndex(index);
    }
  };
  
  const scrollToProduct = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveProductIndex(index);
    }
  };

  const handlePromoScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32; // accounting for padding
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activePromoIndex) {
      setActivePromoIndex(index);
    }
  };
  
  const scrollToPromo = (index: number) => {
    if (promoFlatListRef.current) {
      promoFlatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActivePromoIndex(index);
    }
  };

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#ED1C24" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.headerOverlay} />
            <WhiteSpace size="lg" />
            <Flex direction="row" align="center" justify="between" style={{ zIndex: 3 }}>
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.greeting}>Chào, Tuỳ Phong</Text>
                  <Text style={styles.userId}>0912.345.678</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.notificationContainer}>
                <Flex direction="row" align="center">
                  <View style={styles.notificationIconContainer}>
                    <Image 
                      source={require('../../assets/images/trail-icon.png')} 
                      style={{ width: 24, height: 24 }} 
                      resizeMode="contain"
                    />
                  </View>
                  <View style={[styles.notificationIconContainer, { marginLeft: 8 }]}>
                    <Image 
                      source={require('../../assets/images/bell.png')} 
                      style={{ width: 24, height: 24 }} 
                      resizeMode="contain"
                    />
                    <View style={styles.notificationBadge} />
                  </View>
                </Flex>
              </View>
            </Flex>
            
            {/* Income Card */}
            <WhiteSpace size="lg" />
            <View style={{...styles.incomeCard, marginHorizontal: 0, borderRadius: 10}}>
              <LinearGradient
                colors={['rgba(255, 208, 121, 0.6)', 'rgba(255, 208, 121, 0)']}
                locations={[0, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.incomeCardContent, { borderRadius: 10 }]}
              >
                <Flex direction="row" align="center" justify="between">
                  <View style={[styles.incomeTextContainer, { justifyContent: 'center' }]}>
                    <Text style={styles.incomeTitle}> Thu nhập dự kiến T3</Text>
                    <Flex align="center">
                      <Text style={styles.incomeAmount}>12.650.000</Text>
                      <Image 
                        source={require('../../assets/images/eye-icon.png')} 
                        style={{ width: 36, height: 36, marginLeft: 2 }} 
                        resizeMode="contain"
                      />
                    </Flex>
                  </View>
                  <View style={[styles.iconContainer, { paddingBottom: 8, paddingTop: 8, alignSelf: 'center' }]}>
                    <View style={styles.statItem}>
                      <Image 
                        source={require('../../assets/images/cong-dong.png')} 
                        style={{ width: 24, height: 24, marginBottom: 4 }} 
                        resizeMode="contain"
                      />
                      <Text style={styles.statLabel}>Cộng đồng</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.statItem, { marginLeft: 16 }]}
                      onPress={() => router.push('/(tabs)/stats')}
                    >
                      <Image 
                        source={require('../../assets/images/chart-pie.png')} 
                        style={{ width: 24, height: 24, marginBottom: 4 }} 
                        resizeMode="contain"
                      />
                      <Text style={styles.statLabel}>Thống kê</Text>
                    </TouchableOpacity>
                  </View>
                </Flex>
              </LinearGradient>
            </View>
          </View>
          
          <WingBlank style={styles.contentContainer}>
            {/* Sản phẩm Section */}
            <WhiteSpace size="lg" />
            <Flex justify="between" style={[styles.brandContainer, { paddingVertical: 16 }]}>
              {brandData.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.brandCard}
                  activeOpacity={0.8}
                  onPress={() => brand.name === 'SOLAR MAX' ? router.push('/product_line') : null}
                >
                  <View style={styles.brandContent}>
                    {brand.logo ? (
                      <Image source={brand.logo} style={styles.brandLogo} resizeMode="contain" />
                    ) : (
                      <Text style={styles.brandText}>{brand.name}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Flex>
            
            {/* Promo Cards */}
            <WhiteSpace size="lg" />
            <View style={styles.carouselContainer}>
              <FlatList
                ref={promoFlatListRef}
                horizontal
                data={promoCards}
                renderItem={({item}) => (
                  <View style={[styles.promoCard, { width: width - 32, marginHorizontal: 4 }]}>
                    <Image
                      source={item.image} 
                      style={styles.promoFullImage} 
                      resizeMode="cover" 
                    />
                    <Flex style={styles.promoContent}>
                      <Flex.Item style={styles.promoTextContent}>
                        <Text style={styles.promoAction}>{item.action}</Text>
                        <Text style={styles.promoMainText}>{item.mainText}</Text>
                        <Button 
                          type="primary" 
                          size="small" 
                          style={styles.promoButton}
                        >
                          <View style={styles.buttonInner}>
                            <Text style={styles.promoButtonText}>{item.buttonText}</Text>
                            <Ionicons name="arrow-forward" size={12} color="white" />
                          </View>
                        </Button>
                      </Flex.Item>
                    </Flex>
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
              
              <View style={styles.promoPaginationContainer}>
                {promoCards.map((_, index) => (
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
            
            {/* Bán chạy Section */}
            <WhiteSpace size="lg" />
            <Text style={styles.sectionTitle}>Bán chạy</Text>
            <WhiteSpace size="xs" />
            <ProductSection 
              title="ĐIỆN MẶT TRỜI SOLARMAX" 
              products={bestSellerProducts} 
              width={width}
              flatListRef={flatListRef}
            />

            {/* Thang máy Eliton Section */}
            <ProductSection 
              title="THANG MÁY ELITON" 
              products={bestSellerProducts.map(item => ({
                ...item,
                title: 'Dragonfly Gold'
              }))} 
              width={width}
              flatListRef={flatListRef}
            />
          </WingBlank>
          
          {/* Chat Support Section */}
          <View style={styles.chatSupportSection}>
            <View style={styles.chatImageContainer}>
              <Image 
                source={require('../../assets/images/chat-icon.png')} 
                style={styles.chatImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.chatContent}>
              <Text style={styles.chatTitle}>Bắt đầu Bán hàng ngay~!</Text>
              <Text style={styles.chatDescription}>
                Mở khóa Thư viện Nội dung của SLM ngay khi có hợp đồng đầu tiên thành công để "bỏ túi" thêm thật nhiều bí kíp, giúp bạn tự tin hơn trên con đường chinh phục đỉnh cao bán hàng nhé!
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.chatButtonOutlined, styles.buttonFlex]}>
                  <Text style={styles.chatButtonTextOutlined}>Chính sách Đại lý</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chatButtonPrimary, styles.buttonFlex]}>
                  <View style={styles.buttonContentWithIcon}>
                    <Image 
                      source={require('../../assets/images/white-plus-icon.png')} 
                      style={styles.buttonIcon} 
                      resizeMode="contain"
                    />
                    <Text style={styles.chatButtonText}>Tạo Báo giá</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <WhiteSpace size="lg" />
        </ScrollView>
      </View>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f8',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  carouselContainer: {
    marginHorizontal: -20,
  },
  headerContainer: {
    backgroundColor: '#ED1C24',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
    zIndex: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ABACC2',
    zIndex: 3,
  },
  userInfo: {
    marginLeft: 12,
    zIndex: 3,
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userId: {
    color: '#F79009',
    fontSize: 14,
  },
  incomeCard: {
    backgroundColor: 'rgba(180, 120, 70, 0.9)',
    borderRadius: 10,
    borderWidth: 0,
    marginHorizontal: 16,
    zIndex: 2,
    overflow: 'hidden',
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
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
  incomeCardContent: {
    padding: 12,
    zIndex: 2,
  },
  incomeTextContainer: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  incomeTitle: {
    color: 'white',
    fontSize: 15,
    marginBottom: 4,
  },
  incomeAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  incomeCurrency: {
    fontSize: 12,
  },
  incomeStats: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: {
    color: 'white',
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: -8,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#ED1C24',
    fontSize: 14,
    marginRight: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    width: '100%',
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '48%',
    height: 64,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  brandContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: 100,
    height: 32,
  },
  brandText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  promoCard: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
    width: 330,
    aspectRatio: 2/1,
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
  promoContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    zIndex: 1,
  },
  promoTextContent: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  promoAction: {
    color: 'white',
    fontSize: 14,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      web: {
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
      }
    }),
    textAlign: 'right',
  },
  promoMainText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      web: {
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
      }
    }),
    textAlign: 'right',
  },
  promoButton: {
    backgroundColor: '#FFC107',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'flex-end',
    minWidth: 110,
    height: 30,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: 'white',
    fontSize: 11,
    marginRight: 2,
    fontWeight: '500',
  },
  productCard: {
    aspectRatio: 10/17,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
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
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      }
    }),
  },
  productImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  updateBrandLogoPlaceholder: {
    width: 60,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBrandLogo: {
    width: 60,
    height: 20,
  },
  updateBrandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  updateModelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
  },
  articleCard: {
    width: 220,
    aspectRatio: 4/5,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 0,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 0,
  },
  articleImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleImage: {
    width: '100%',
    height: 150,
    flex: 1,
    aspectRatio: 1.5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  articleDescription: {
    fontSize: 14,
    color: '#666',
  },
  headerLogo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationContainer: {
    position: 'relative',
    zIndex: 3,
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'orange',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  notificationIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 20,
    padding: 8,
    position: 'relative',
  },
  recentUpdateCard: {
    width: 220,
    height: 140,
    marginRight: 0,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 0,
  },
  recentUpdateHeader: {
    height: 40,
    padding: 10,
    justifyContent: 'center',
  },
  recentUpdateLogo: {
    width: 120,
    height: 24,
  },
  recentUpdateLogoPlaceholder: {
    justifyContent: 'center',
  },
  recentUpdateLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentUpdateContent: {
    padding: 12,
  },
  recentUpdateModelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recentUpdateDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recentUpdateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    height: 24,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUpdateButtonText: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
  },
  productPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#ED1C24',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paginationBar: {
    width: 12,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  paginationBarActive: {
    backgroundColor: '#ED1C24',
    width: 18,
  },
  chatSupportSection: {
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 20,
    marginTop: 16,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  chatImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  chatImage: {
    width: 200,
    height: 120,
  },
  chatContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chatDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
    marginBottom: 0,
  },
  chatButtonPrimary: {
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonOutlined: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ED1C24',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  chatButtonTextOutlined: {
    color: '#ED1C24',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
  recentUpdateTypeContainer: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  articleImageNew: {
    width: '100%',
    height: '100%', 
    position: 'absolute',
    top: 0,
    left: 0,
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
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED1C24',
    marginTop: 16,
    marginBottom: 4,
  },
});
