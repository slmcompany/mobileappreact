import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform, FlatList } from 'react-native';
import { Text, WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { Stack, useLocalSearchParams, router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSector } from '../../hooks/useSector';
import { Combo, Sector } from '../../models/sector';

// Component riêng biệt cho carousel sản phẩm
const ProductSection = ({ 
  data, 
  title, 
  showDetails = false, 
  isGrid = false,
  filterType,
  sectorName,
  sectorId
}: { 
  data: Combo[], 
  title?: string, 
  showDetails?: boolean,
  isGrid?: boolean,
  filterType?: string,
  sectorName?: string,
  sectorId?: number
}) => {
  const { width } = Dimensions.get('window');
  const carouselRef = useRef<FlatList>(null);

  // Lấy title động theo filter type
  const getDynamicTitle = () => {
    if (title) return title;
    
    if (filterType === 'Ongrid') return 'Hệ Bám tải';
    if (filterType === 'Hybrid') return 'Hệ Độc lập';
    if (filterType === 'DOC_LAP_MOT_PHA' || filterType === 'DOC_LAP_BA_PHA') return 'Hệ Độc lập';
    if (filterType === 'BAM_TAI_MOT_PHA' || filterType === 'BAM_TAI_BA_PHA') return 'Hệ Bám tải';
    
    return title || 'Sản phẩm';
  };

  const ProductItem = ({ item }: { item: Combo }) => {
    const getProductTag = (combo: Combo) => {
      if (combo.installation_type) {
        return combo.installation_type.toUpperCase();
      } else if (combo.type) {
        return combo.type;
      }
      return 'ĐỘC LẬP';
    };

    const getFormattedProductName = (combo: Combo) => {
      let name = combo.name;
      if (combo.type === 'DOC_LAP_MOT_PHA') {
        return `Hệ Độc lập Một pha ${combo.capacity || ''}`;
      } else if (combo.type === 'DOC_LAP_BA_PHA') {
        return `Hệ Độc lập Ba pha ${combo.capacity || ''}`;
      } else if (combo.type === 'BAM_TAI_MOT_PHA') {
        return `Hệ Bám tải Một pha ${combo.capacity || ''}`;
      } else if (combo.type === 'BAM_TAI_BA_PHA') {
        return `Hệ Bám tải Ba pha ${combo.capacity || ''}`;
      }
      return name;
    };

    // Card với layout ngang (ảnh bên trái, thông tin bên phải)
    if (isGrid) {
      return (
        <Link
          href={{
            pathname: "/(products)/product_detail",
            params: { id: item.id.toString() }
          }}
          asChild
        >
          <TouchableOpacity style={styles.horizontalCard}>
            <View style={styles.horizontalImageContainer}>
              {item.image ? (
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.productImage} 
                  resizeMode="cover" 
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cube-outline" size={30} color="#888" />
                </View>
              )}
              {item.installation_type && (
                <View style={styles.tagContainerHorizontal}>
                  <Text style={styles.tagText}>{item.installation_type.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={styles.horizontalContentContainer}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              
              <View style={styles.productDetails}>
                <Text style={styles.productDetail}>Sản lượng điện: {item.power_output || '400-600 kWh/tháng'}</Text>
                <Text style={styles.productDetail}>Thời gian hoàn vốn</Text>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(item.total_price)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      );
    }

    // Card kiểu dọc cũ (carousel)
    return (
      <Link
        href={{
          pathname: "/(products)/product_detail",
          params: { id: item.id.toString() }
        }}
        asChild
      >
        <TouchableOpacity 
          style={[
            styles.productCard,
            { width: (width - 80) / 2.5, marginHorizontal: 8, marginBottom: 16 }
          ]}
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
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cube-outline" size={40} color="#888" />
              </View>
            )}
            {getProductTag(item) && (
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{getProductTag(item)}</Text>
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{getFormattedProductName(item)}</Text>
            
            {showDetails && (
              <View style={styles.productDetails}>
                <Text style={styles.productDetail}>Sản lượng điện: {item.power_output || '400-600 kWh/tháng'}</Text>
                <Text style={styles.productDetail}>Thời gian hoàn vốn</Text>
              </View>
            )}
            
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(item.total_price)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  if (isGrid) {
    return (
      <View style={styles.productSection}>
        <Text style={styles.sectionTitle}>{getDynamicTitle()}</Text>
        <View style={styles.horizontalList}>
          {data.length > 0 ? (
            data.map((item) => (
              <ProductItem key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>Không có sản phẩm</Text>
          )}
        </View>
      </View>
    );
  }

  // Dành cho carousel (style như ở products.tsx)
  return (
    <>
      <WhiteSpace size="lg" />
      <Flex justify="between" align="center" style={{paddingHorizontal: 16}}>
        <Text style={styles.sectionSubtitle}>{sectorName ? sectorName.toUpperCase() : title}</Text>
        <TouchableOpacity>
          <Flex align="center">
            <Text style={styles.viewAllText}>Tất cả</Text>
            <Image 
              source={require('../../assets/images/arrow-icon.png')} 
              style={{ width: 20, height: 20, marginLeft: 8 }} 
              resizeMode="contain"
            />
          </Flex>
        </TouchableOpacity>
      </Flex>
      
      <WhiteSpace size="lg" />
      <View style={[styles.carouselContainer, { paddingBottom: 16 }]}>
        <FlatList
          ref={carouselRef}
          horizontal
          data={data}
          renderItem={({item}) => (
            <ProductItem key={item.id} item={item} />
          )}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyCarousel}>
              <Text style={styles.emptyText}>Không có sản phẩm</Text>
            </View>
          }
        />
      </View>
    </>
  );
};

export default function ProductBrandScreen() {
  const { id } = useLocalSearchParams();
  const { data: sector, isLoading, error } = useSector(Number(id));
  const { width } = Dimensions.get('window');
  const CARD_MARGIN = 8;
  const HORIZONTAL_PADDING = 16;
  const VISIBLE_CARDS = 2.5;
  const cardWidth = (width - (HORIZONTAL_PADDING * 2) - (CARD_MARGIN * (VISIBLE_CARDS - 1))) / VISIBLE_CARDS;
  const flatListRef = useRef<FlatList>(null);

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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D9261C" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Có lỗi xảy ra khi tải dữ liệu</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
      </View>
    );
  }

  if (!sector) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thương hiệu</Text>
      </View>
    );
  }

  // Get Ongrid products
  const ongridProducts = sector.list_combos ? 
    sector.list_combos.filter(combo => combo.installation_type === "Ongrid") : 
    [];
    
  // Get Hybrid products
  const hybridProducts = sector.list_combos ? 
    sector.list_combos.filter(combo => combo.installation_type === "Hybrid") : 
    [];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: sector.id === 1 ? '#4CAF50' : 
                             sector.id === 2 ? '#FFD700' : '#0F974A',
          },
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Brand Header */}
        <View style={[
          styles.brandHeader,
          { backgroundColor: sector.id === 1 ? '#4CAF50' : 
                            sector.id === 2 ? '#FFD700' : '#0F974A' }
        ]}>
          <View style={styles.brandInfo}>
            <Image 
              source={{ uri: sector.image_rectangular || sector.logo }} 
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <View style={styles.brandDetails}>
              <Text style={styles.brandName}>{sector.name}</Text>
              <Text style={styles.brandProducts}>{sector.list_combos?.length || 0} sản phẩm</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#27273E" />
              <Text style={styles.actionText}>Hotline</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brandActions}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonFull]}>
              <Ionicons name="play-circle-outline" size={20} color="#27273E" />
              <Text style={styles.actionText}>Nội dung của {sector.name}</Text>
              <Text style={styles.actionCount}>{sector.list_contents?.length || 0} bài viết</Text>
              <Ionicons name="chevron-forward" size={20} color="#27273E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Best Selling Section */}
        <Text style={styles.sectionTitle}>Bán chạy</Text>
        <WhiteSpace size="lg" />
        <Flex justify="between" align="center" style={{paddingHorizontal: 16}}>
          <Text style={styles.sectionSubtitle}>{sector.name.toUpperCase()}</Text>
          <TouchableOpacity>
            <Flex align="center">
              <Text style={styles.viewAllText}>Tất cả</Text>
              <Image 
                source={require('../../assets/images/arrow-icon.png')} 
                style={{ width: 20, height: 20, marginLeft: 8 }} 
                resizeMode="contain"
              />
            </Flex>
          </TouchableOpacity>
        </Flex>
        
        <WhiteSpace size="lg" />
        <View style={[styles.carouselContainer, { paddingBottom: 16 }]}>
          <FlatList
            ref={flatListRef}
            horizontal
            data={sector.list_combos?.filter(combo => combo.best_selling === true) || sector.list_combos?.slice(0, 5) || []}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        {/* Carousel sản phẩm Ongrid có thông tin chi tiết */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Hệ Bám tải</Text>
          <View style={styles.horizontalList}>
            {ongridProducts.length > 0 ? (
              ongridProducts.map((item) => (
                <Link
                  key={item.id}
                  href={{
                    pathname: "/(products)/product_detail",
                    params: { id: item.id.toString() }
                  }}
                  asChild
                >
                  <TouchableOpacity style={styles.horizontalCard}>
                    <View style={styles.horizontalImageContainer}>
                      {item.image ? (
                        <Image 
                          source={{ uri: item.image }} 
                          style={styles.productImage} 
                          resizeMode="cover" 
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="cube-outline" size={30} color="#888" />
                        </View>
                      )}
                      {item.installation_type && (
                        <View style={styles.tagContainerHorizontal}>
                          <Text style={styles.tagText}>{item.installation_type.toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.horizontalContentContainer}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                      
                      <View style={styles.productDetails}>
                        <Text style={styles.productDetail}>Sản lượng điện: {item.power_output || '400-600 kWh/tháng'}</Text>
                        <Text style={styles.productDetail}>Thời gian hoàn vốn</Text>
                      </View>
                      
                      <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(item.total_price)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có sản phẩm</Text>
            )}
          </View>
        </View>

        {/* Carousel sản phẩm Hybrid (Độc lập) có thông tin chi tiết */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Hệ Độc lập</Text>
          <View style={styles.horizontalList}>
            {hybridProducts.length > 0 ? (
              hybridProducts.map((item) => (
                <Link
                  key={item.id}
                  href={{
                    pathname: "/(products)/product_detail",
                    params: { id: item.id.toString() }
                  }}
                  asChild
                >
                  <TouchableOpacity style={styles.horizontalCard}>
                    <View style={styles.horizontalImageContainer}>
                      {item.image ? (
                        <Image 
                          source={{ uri: item.image }} 
                          style={styles.productImage} 
                          resizeMode="cover" 
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="cube-outline" size={30} color="#888" />
                        </View>
                      )}
                      {item.installation_type && (
                        <View style={styles.tagContainerHorizontal}>
                          <Text style={styles.tagText}>{item.installation_type.toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.horizontalContentContainer}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                      
                      <View style={styles.productDetails}>
                        <Text style={styles.productDetail}>Sản lượng điện: {item.power_output || '400-600 kWh/tháng'}</Text>
                        <Text style={styles.productDetail}>Thời gian hoàn vốn</Text>
                      </View>
                      
                      <View style={styles.priceContainer}>
                        <Text style={styles.productPrice}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(item.total_price)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có sản phẩm</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27273E',
  },
  backButton: {
    padding: 8,
  },
  headerButton: {
    padding: 8,
  },
  brandHeader: {
    padding: 16,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  brandLogo: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  brandDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  brandProducts: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  brandActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 62, 0.16)',
    borderRadius: 4,
    padding: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  actionButtonFull: {
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
  },
  actionCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  productSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#27273E',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  emptyText: {
    fontSize: 14,
    color: '#7B7D9D',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  horizontalList: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    width: '100%',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    width: '48%',
    marginHorizontal: 4,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
    gap: 6,
  },
  productType: {
    backgroundColor: '#ECFDF3',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  productTypeText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#12B669',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
    marginBottom: 4,
  },
  productDetails: {
    gap: 4,
  },
  productDetail: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ED1C24',
  },
  errorText: {
    fontSize: 16,
    color: '#D9261C',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
  },
  carouselContainer: {
    paddingBottom: 16,
  },
  emptyCarousel: {
    width: Dimensions.get('window').width - 32,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f8',
    borderRadius: 8,
    marginHorizontal: 16,
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
  horizontalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  horizontalContentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tagContainerHorizontal: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 