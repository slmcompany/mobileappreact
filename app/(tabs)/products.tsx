import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, StatusBar, Dimensions, FlatList, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Flex, Button, WhiteSpace } from '@ant-design/react-native';

// Định nghĩa interface cho sector từ API
interface Sector {
  id: number;
  name: string;
  code: string;
  image: string;
  image_rectangular: string;
  list_combos: Combo[];
}

interface ProductLine {
  id: string;
  name: string;
  image: any;
  productCount: number;
}

// Cập nhật interface Product để khớp với Combo từ API
interface Combo {
  id: number;
  name: string;
  total_price: number;
  image: string | null;
  installation_type?: string;
  best_selling?: boolean;
  code?: string;
}

// Tạm thời giữ lại productLines cho đến khi có dữ liệu từ API
const productLines: ProductLine[] = [
  {
    id: '1',
    name: 'Điện mặt trời SolarMax',
    image: require('@/assets/images/solarmax-logo.png'),
    productCount: 16,
  },
  {
    id: '2',
    name: 'Thang máy Eliton',
    image: require('@/assets/images/eliton-logo.png'),
    productCount: 12,
  },
];

// Interface cho sản phẩm mới (như promoCards)
interface NewProduct {
  id: string;
  action: string;
  mainText: string;
  buttonText: string;
  backgroundColor: string;
  image: any;
}

// Dữ liệu mẫu cho sản phẩm mới
const newProducts: NewProduct[] = [
  {
    id: '1',
    action: 'Điện mặt trời',
    mainText: 'GIẢI PHÁP MỚI',
    buttonText: 'Xem ngay',
    backgroundColor: '#D9261C',
    image: null, 
  },
  {
    id: '2',
    action: 'Thang máy',
    mainText: 'CÔNG NGHỆ VƯỢT TRỘI',
    buttonText: 'Tìm hiểu',
    backgroundColor: '#D9261C',
    image: null,
  },
  {
    id: '3',
    action: 'Thiết bị mới',
    mainText: 'TIẾT KIỆM NĂNG LƯỢNG',
    buttonText: 'Chi tiết',
    backgroundColor: '#D9261C',
    image: null,
  },
];

// Hook để lấy dữ liệu từ API
const useSectors = () => {
  const [data, setData] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://id.slmsolar.com/api/sector', {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.status}`);
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Lỗi không xác định'));
        console.error('Lỗi khi fetch sectors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return { data, isLoading, error };
};

export default function ProductScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const [activeNewProductIndex, setActiveNewProductIndex] = useState(0);
  const newProductFlatListRef = useRef<FlatList>(null);
  const solarMaxFlatListRef = useRef<FlatList>(null);
  const elitonFlatListRef = useRef<FlatList>(null);
  
  // Sử dụng hook để lấy dữ liệu
  const { data: sectors, isLoading, error } = useSectors();

  const handleNewProductScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideWidth = width - 32;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index !== activeNewProductIndex) {
      setActiveNewProductIndex(index);
    }
  };
  
  const scrollToNewProduct = (index: number) => {
    if (newProductFlatListRef.current) {
      newProductFlatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveNewProductIndex(index);
    }
  };

  // Tạo tag cho sản phẩm dựa vào installation_type nếu có
  const getProductTag = (combo: Combo) => {
    if (combo.installation_type) {
      return combo.installation_type.toUpperCase();
    }
    return null;
  };

  const renderProductItem = ({ item }: { item: Combo }) => (
    <TouchableOpacity 
      style={[styles.productCard, { width: (width - 80) / 2.5, marginHorizontal: 8, marginBottom: 16 }]}
      onPress={() => router.push({
        pathname: "/(products)/product_detail",
        params: { id: item.id.toString() }
      })}
    >
      <View style={{ padding: 0, width: '100%', aspectRatio: 1, overflow: 'hidden' }}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
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
        {getProductTag(item) && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{getProductTag(item)}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 12, flex: 1 }}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(Math.round(item.total_price / 1000) * 1000)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, sectionName: string, sectorId: number) => (
    <>
      <WhiteSpace size="lg" />
      <Flex justify="between" align="center" style={{paddingHorizontal: 16}}>
        <Text style={styles.sectionSubtitle}>{sectionName.toUpperCase()}</Text>
        <Button
          type="primary"
          size="small"
          style={{ borderWidth: 0, backgroundColor: 'transparent', paddingRight: 8 }}
          onPress={() => router.push({
            pathname: "/(products)/product_brand",
            params: { id: sectorId.toString() }
          })}
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
    </>
  );

  // Hàm lọc combo bán chạy
  const getBestSellingCombos = (sector: Sector) => {
    if (!sector.list_combos) return [];
    return sector.list_combos.filter(combo => combo.best_selling === true);
  };

  // Render phần loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm</Text>
          <TouchableOpacity style={styles.supportButton}>
            <View style={styles.supportIcon}>
              <Text style={styles.supportIconText}>?</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED1C24" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render phần lỗi
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm</Text>
          <TouchableOpacity style={styles.supportButton}>
            <View style={styles.supportIcon}>
              <Text style={styles.supportIconText}>?</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Có lỗi xảy ra khi tải dữ liệu</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
        <TouchableOpacity style={styles.supportButton}>
          <View style={styles.supportIcon}>
            <Text style={styles.supportIconText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Bạn muốn tìm sản phẩm nào?" 
            placeholderTextColor="#888"
          />
        </View>

        {/* Sale Banner */}
        <View style={styles.saleBanner}>
          <Text style={styles.saleText}>S A L E</Text>
        </View>

        {/* Product Lines - Cập nhật để sử dụng sectors từ API */}
        <View style={styles.productLinesContainer}>
          <Flex justify="between" style={styles.brandContainer}>
            {sectors.map((sector) => (
              <TouchableOpacity
                key={sector.id}
                style={styles.brandCard}
                activeOpacity={0.8}
                onPress={() => router.push({
                  pathname: "/(products)/product_brand",
                  params: { id: sector.id.toString() }
                })}
              >
                <View style={styles.brandContent}>
                  <Image 
                    source={{ uri: sector.image }} 
                    style={styles.brandLogo} 
                    resizeMode="contain" 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Flex>
        </View>

        {/* New Products Section - Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={newProductFlatListRef}
              horizontal
              data={newProducts}
              renderItem={({item}) => (
                <View style={[styles.promoCard, { width: width - 48, marginHorizontal: 8 }]}>
                  {item.image ? (
                    <Image
                      source={item.image} 
                      style={styles.promoFullImage} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <View style={[styles.promoFullImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="cube-outline" size={60} color="#888" />
                    </View>
                  )}
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
              onMomentumScrollEnd={handleNewProductScroll}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            
            <View style={styles.promoPaginationContainer}>
              {newProducts.map((_, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.promoPaginationBar, 
                    index === activeNewProductIndex && styles.promoPaginationBarActive
                  ]}
                  onPress={() => scrollToNewProduct(index)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.productSectionsContainer}>
          {/* Bán chạy Section - Sử dụng dữ liệu từ API */}
          <Text style={styles.sectionTitle}>Bán chạy</Text>
          <WhiteSpace size="xs" />
          
          {/* Lặp qua từng sector để hiển thị các combo bán chạy */}
          {sectors.map((sector) => {
            const bestSellingCombos = getBestSellingCombos(sector);
            
            // Kiểm tra nếu sector không có combo bán chạy nào thì bỏ qua
            if (bestSellingCombos.length === 0) return null;
            
            return (
              <React.Fragment key={sector.id}>
                {renderSectionHeader('Bán chạy', sector.name, sector.id)}
                <View style={[styles.productsCarouselContainer, { paddingBottom: 16 }]}>
                  <FlatList
                    ref={sector.id === 1 ? solarMaxFlatListRef : elitonFlatListRef}
                    horizontal
                    data={bestSellingCombos}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  supportButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  supportIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  saleBanner: {
    height: 120,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  saleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 8,
  },
  productLinesContainer: {
    padding: 15,
    marginBottom: 10,
  },
  brandContainer: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '48%',
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 4,
  },
  brandContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: '100%',
    height: 32,
  },
  section: {
    paddingHorizontal: 15,
    paddingVertical: 0,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
    paddingHorizontal: 15,
  },
  carouselContainer: {
    marginHorizontal: -20,
    paddingVertical: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#ED1C24',
    fontSize: 14,
    marginRight: 4,
  },
  brandTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  productsListContainer: {
    paddingVertical: 10,
    paddingRight: 15,
  },
  productSectionsContainer: {
    paddingHorizontal: 0,
  },
  productsCarouselContainer: {
    marginHorizontal: -20,
    paddingVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginTop: -8,
    fontWeight: 'bold',
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
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ED1C24',
    marginTop: 16,
    marginBottom: 4,
  },
  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ED1C24',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 