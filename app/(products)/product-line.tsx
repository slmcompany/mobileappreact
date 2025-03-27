import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, StatusBar, FlatList, Dimensions, Platform, Linking, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  type?: string;
  tags?: string[];
  image?: string | null;
  description?: string;
}

interface PreQuoteCombo {
  id: number;
  code: string;
  description: string;
  total_price: number;
  kind: string;
  status: string;
  name: string;
  created_at: string;
  installation_type: string;
  customer_id: number;
  customer: {
    id: number;
    address: string;
    created_at: null;
    user_id: null;
    name: string;
    phone: string;
    email: string;
    description: null;
  };
  pre_quote_merchandises: Array<{
    id: number;
    merchandise_id: number;
    quantity: number;
    pre_quote_id: number;
    note: null;
    price: number;
    merchandise: {
      id: number;
      supplier_id: null;
      name: string;
      unit: string;
      data_json: any;
      active: boolean;
      template_id: number;
      brand_id: number;
      code: string;
      data_sheet_link: string;
      description_in_contract: string;
      created_at: string;
    };
  }>;
}

export default function ProductScreen() {
  const router = useRouter();
  const [activeNewProductIndex, setActiveNewProductIndex] = useState(0);
  const [bestSellersData, setBestSellersData] = useState<Product[]>([]);
  const [newProductsData, setNewProductsData] = useState<Product[]>([]);
  const [independentSystemsData, setIndependentSystemsData] = useState<Product[]>([]);
  const [threePhaseProductsData, setThreePhaseProductsData] = useState<Product[]>([]);
  const [onGridSinglePhaseData, setOnGridSinglePhaseData] = useState<Product[]>([]);
  const [onGridThreePhaseData, setOnGridThreePhaseData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const newProductsScrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://id.slmsolar.com/api/pre_quote/combo');
      const data: PreQuoteCombo[] = await response.json();
      
      // Set total products
      setTotalProducts(data.length);
      
      // Transform API data to match our Product interface
      const transformedData: Product[] = data.map(item => {
        const totalPower = item.pre_quote_merchandises.reduce((sum, merch) => {
          const power = merch.merchandise.data_json.power_watt || 0;
          return sum + (power * merch.quantity);
        }, 0);

        const phaseType = item.pre_quote_merchandises.some(merch => 
          merch.merchandise.data_json.phase_type === '3-phase'
        ) ? 'BA PHA' : 'MỘT PHA';

        const voltageType = item.pre_quote_merchandises.some(merch => 
          merch.merchandise.data_json.voltage_type === 'high'
        ) ? 'ÁP CAO' : 'ÁP THẤP';

        return {
          id: item.id.toString(),
          type: `HỆ ${item.installation_type.toUpperCase()}`,
          name: `${(totalPower / 1000).toFixed(1)}kW`,
          price: `${item.total_price.toLocaleString('vi-VN')} đ`,
          tags: [phaseType, voltageType],
          description: item.description
        };
      });

      // Categorize data based on installation type and phase
      const bestSellers = transformedData.slice(0, 3);
      const newProducts = transformedData.slice(3, 6);
      const independentSystems = transformedData.filter(item => 
        item.type?.includes('ĐỘC LẬP') && item.tags?.includes('MỘT PHA')
      );
      const threePhaseProducts = transformedData.filter(item => 
        item.type?.includes('ĐỘC LẬP') && item.tags?.includes('BA PHA')
      );
      const onGridSinglePhase = transformedData.filter(item => 
        item.type?.includes('BÁM TẢI') && item.tags?.includes('MỘT PHA')
      );
      const onGridThreePhase = transformedData.filter(item => 
        item.type?.includes('BÁM TẢI') && item.tags?.includes('BA PHA')
      );

      setBestSellersData(bestSellers);
      setNewProductsData(newProducts);
      setIndependentSystemsData(independentSystems);
      setThreePhaseProductsData(threePhaseProducts);
      setOnGridSinglePhaseData(onGridSinglePhase);
      setOnGridThreePhaseData(onGridThreePhase);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProductScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveNewProductIndex(index);
  };

  const handleCallHotline = () => {
    Linking.openURL('tel:19001771');
  };

  const navigateToSubProducts = () => {
    router.push('/subproduct');
  };

  const handleProductClick = (item: Product) => {
    router.push({
      pathname: "/product_page/[id]",
      params: {
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        description: item.description,
        tags: item.tags?.join(','),
      }
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductClick(item)}
    >
      <View style={styles.productImageContainer}>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag: string, index: number) => {
              const tagStyles = [
                styles.primaryTag,
                styles.secondaryTag,
                styles.tertiaryTag
              ];
              const textStyles = [
                styles.primaryTagText,
                styles.secondaryTagText,
                styles.tertiaryTagText
              ];
              
              return (
                <View key={index} style={[styles.tag, tagStyles[index % 3]]}>
                  <Text style={[styles.tagText, textStyles[index % 3]]}>
                    {tag}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        {item.type && <Text style={styles.productType}>{item.type}</Text>}
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, subtitle: string = 'Mới nhất') => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.viewAllText}>{subtitle}</Text>
    </View>
  );

  const renderPhaseItem = ({ item }: { item: Product }) => {
    // Tạo tên đầy đủ dựa trên tags và name
    const getFullName = () => {
      if (!item.tags) return item.name.toUpperCase();
      
      const typeTag = item.tags.find(tag => ['ĐỘC LẬP', 'BÁM TẢI'].includes(tag));
      const phaseTag = item.tags.find(tag => ['MỘT PHA', 'BA PHA'].includes(tag));
      const voltageTag = item.tags.find(tag => ['ÁP THẤP', 'ÁP CAO'].includes(tag));
      
      const type = typeTag === 'ĐỘC LẬP' ? 'Off-Grid' : 'On-Grid';
      
      let fullName = `${type} | ${item.name}`;
      if (phaseTag) {
        fullName += ` | ${phaseTag}`;
      }
      if (voltageTag) {
        fullName += ` | ${voltageTag}`;
      }
      
      return fullName.toUpperCase();
    };
    
    return (
      <TouchableOpacity 
        style={styles.phaseItemCard}
        onPress={() => handleProductClick(item)}
      >
        <View style={styles.phaseItemImageContainer}>
          <View style={styles.phaseItemImage}>
            <Text style={styles.phaseItemImageText}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.phaseItemContent}>
          <View style={styles.phaseItemHeader}>
            <Text style={styles.phaseItemTitle} numberOfLines={1} ellipsizeMode="tail">{getFullName()}</Text>
          </View>
          {item.description && (
            <Text style={styles.phaseItemDescription} numberOfLines={3} ellipsizeMode="tail">
              {item.description.includes('##') ? 
                item.description.split('##').map((part, index) => {
                  if (index === 0) return part;
                  const remainingText = part.split(' ');
                  const number = remainingText.shift();
                  return (
                    <React.Fragment key={index}>
                      <Text style={{color: '#000', fontWeight: '600'}}>{number} </Text>
                      <Text>{remainingText.join(' ')}</Text>
                    </React.Fragment>
                  );
                })
                : item.description
              }
            </Text>
          )}
          <View style={styles.phaseItemFooter}>
            <Text style={styles.phaseItemPrice}>{item.price}</Text>
            <TouchableOpacity 
              style={styles.quoteButton}
              onPress={() => router.push("/quote-detail")}
            >
              <Ionicons name="document-text-outline" size={14} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.quoteButtonText}>Xem báo giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewProductsSection = () => {
    const cardWidth = screenWidth - 30;
    
    return (
      <View style={styles.newProductSection}>
        <Text style={[styles.sectionTitle, { marginHorizontal: 15 }]}>Sản phẩm mới</Text>
        <View style={{ marginHorizontal: 15 }}>
          <ScrollView
            ref={newProductsScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleNewProductScroll}
            scrollEventThrottle={16}
            style={{ marginHorizontal: -15 }}
            contentContainerStyle={{ paddingHorizontal: 15, gap: 15 }}
          >
            {newProductsData.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.newProductCard, { width: cardWidth }]}
                onPress={() => handleProductClick(item)}
              >
                <View style={styles.newProductImage}>
                  <Text style={styles.newProductImageText}>{item.name}</Text>
                  <Text style={styles.newProductTypeText}>{item.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.newProductIndicators}>
          {newProductsData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.newProductIndicator,
                index === activeNewProductIndex && styles.newProductIndicatorActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
       

        {/* Brand Banner */}
        <View style={styles.brandBanner}>
          <View style={styles.bannerImageContainer}>
            <Image 
              source={{ uri: 'https://placehold.co/120x120/00A650/ffffff?text=SLM' }}
              style={styles.bannerImage}
            />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerHeading}>Solarmax</Text>
            <Text style={styles.bannerSubheading}>{totalProducts} sản phẩm</Text>
          </View>
        </View>

        {/* Content Button */}
        <TouchableOpacity 
          style={styles.contentButtonWrap}
          onPress={() => router.push("/brand/solarmax")}
        >
          <View style={styles.contentIconWrap}>
            <Ionicons name="play-circle-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.contentLabelText}>Nội dung của SolarMax</Text>
          <View style={styles.contentCountWrap}>
            <Text style={styles.contentCountText}>98 bài viết</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        {/* Search Bar */}
        <View style={styles.contentSearchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput 
            style={styles.contentSearchInput} 
            placeholder="Tìm sản phẩm" 
            placeholderTextColor="#888"
          />
        </View>

        {/* Best Sellers Section */}
        <View style={styles.bestSellerSection}>
          <Text style={styles.bestSellersTitle}>Bán chạy</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00A650" />
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.bestSellerScrollView} 
              contentContainerStyle={styles.bestSellerContentContainer}
            >
              {bestSellersData.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.bestSellerCard}
                  onPress={() => handleProductClick(item)}
                >
                  <View style={styles.bestSellerImage}>
                    <Text style={styles.bestSellerImageText}>{item.type ? item.type.slice(0, 1) : "H"}</Text>
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.bestSellerTagsContainer}>
                        {item.tags.map((tag: string, index: number) => {
                          const tagStyles = [
                            styles.bestSellerPrimaryTag,
                            styles.bestSellerSecondaryTag
                          ];
                          const textStyles = [
                            styles.bestSellerPrimaryTagText,
                            styles.bestSellerSecondaryTagText
                          ];
                          
                          return (
                            <View key={index} style={[styles.bestSellerTag, tagStyles[index % 2]]}>
                              <Text style={[styles.bestSellerTagText, textStyles[index % 2]]}>
                                {tag}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  <View style={styles.bestSellerInfo}>
                    <Text style={styles.bestSellerType}>{item.type}</Text>
                    <Text style={styles.bestSellerName}>{item.name}</Text>
                    <Text style={styles.bestSellerPrice}>{item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {renderNewProductsSection()}

        {/* Independent Systems Section */}
        <View style={styles.section}>
          <Text style={styles.independentSystemTitle}>Hệ độc lập</Text>
          
          {/* Một pha subsection */}
          <Text style={styles.phaseSectionTitle}>Một pha</Text>
          <FlatList
            data={independentSystemsData}
            renderItem={renderPhaseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.phaseListContainer}
          />

          {/* Ba pha subsection */}
          <Text style={styles.phaseSectionTitle}>Ba pha</Text>
          <FlatList
            data={threePhaseProductsData}
            renderItem={renderPhaseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.phaseListContainer}
          />
        </View>

        {/* On-Grid Systems Section */}
        <View style={styles.section}>
          <Text style={styles.independentSystemTitle}>Hệ bám tải</Text>
          
          {/* Một pha subsection */}
          <Text style={styles.phaseSectionTitle}>Một pha</Text>
          <FlatList
            data={onGridSinglePhaseData}
            renderItem={renderPhaseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.phaseListContainer}
          />

          {/* Ba pha subsection */}
          <Text style={styles.phaseSectionTitle}>Ba pha</Text>
          <FlatList
            data={onGridThreePhaseData}
            renderItem={renderPhaseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.phaseListContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  subProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A80F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  subProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  brandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 12,
    paddingBottom: 12,
    backgroundColor: '#00A650',
    position: 'relative',
    zIndex: 2,
  },
  bannerImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#008543',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 15,
  },
  bannerHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 0,
  },
  bannerSubheading: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  contentButtonWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006837',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 2,
  },
  contentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentLabelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  contentCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCountText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  contentSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    zIndex: 2,
  },
  contentSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#888',
  },
  bestSellerSection: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  bestSellersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bestSellerScrollView: {
    marginHorizontal: -15,
  },
  bestSellerContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  bestSellerCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  bestSellerImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#006837',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestSellerImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bestSellerTagsContainer: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
  },
  bestSellerInfo: {
    padding: 8,
  },
  bestSellerTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  bestSellerPrimaryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  bestSellerSecondaryTag: {
    backgroundColor: 'rgba(0, 174, 255, 0.2)',
  },
  bestSellerTagText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  bestSellerPrimaryTagText: {
    color: '#666',
  },
  bestSellerSecondaryTagText: {
    color: '#00AEFF',
  },
  bestSellerType: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  bestSellerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  bestSellerPrice: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  newProductCard: {
    height: 180,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  newProductImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
  },
  newProductImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  newProductTypeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  newProductIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  newProductIndicator: {
    width: 16,
    height: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
  newProductIndicatorActive: {
    backgroundColor: '#00A650',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.05)',
      }
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 0,
    paddingBottom: '100%',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
  },
  tagsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  tag: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 5,
  },
  primaryTag: {
    backgroundColor: '#FFF3D8',
  },
  secondaryTag: {
    backgroundColor: '#E0F4FF',
  },
  tertiaryTag: {
    backgroundColor: '#F0FFE6',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryTagText: {
    color: '#FF9800',
  },
  secondaryTagText: {
    color: '#0099FF',
  },
  tertiaryTagText: {
    color: '#4CAF50',
  },
  productInfo: {
    padding: 15,
  },
  productType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    color: '#D9261C',
    fontWeight: '600',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#00A650',
  },
  buyButtonText: {
    color: '#00A650',
    fontSize: 13,
    fontWeight: '600',
  },
  subSectionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  independentSystemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  phaseSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  phaseListContainer: {
    paddingBottom: 0,
  },
  phaseItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      }
    }),
    overflow: 'hidden',
  },
  phaseItemImageContainer: {
    width: 120,
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    overflow: 'hidden',
  },
  phaseItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseItemImageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  phaseItemContent: {
    flex: 1,
    padding: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  phaseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  phaseItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  phaseItemDescription: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
    marginBottom: 6,
  },
  phaseItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  phaseItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  quoteButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteButtonText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
  },
  newProductSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  carouselContainer: {
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  greenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 45,
    backgroundColor: '#00A650',
    zIndex: 0,
  },
  productLine: {
    flex: 1,
    aspectRatio: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productLogoContainer: {
    width: '80%',
    height: '80%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  productLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productLinesContainer: {
    padding: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  productLinesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 