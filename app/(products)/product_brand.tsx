import React, { useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform, FlatList, Linking, Modal, Animated, TextInput, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Text, WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { Stack, useLocalSearchParams, router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import { useSector } from '../../hooks/useSector';
import { Combo } from '@/models/sector';

// Extend the imported Sector type
declare module '../../models/sector' {
  interface Sector {
    sale_phone: string | null;
  }
}

// Helper function to format payback period from years
const formatPaybackPeriod = (years: number | undefined): string => {
  if (!years) return '... năm ... tháng';
  const wholeYears = Math.floor(years);
  const remainingMonths = Math.round((years % 1) * 12);
  return `${wholeYears} năm ${remainingMonths} tháng`;
};

const getPowerFromName = (name: string) => {
  const match = name.match(/(\d+(\.\d+)?)\s*kw/i);
  return match ? match[1] : '5.5';
};

// Helper function to format power output
const formatPowerOutput = (name: string): string => {
  const power = getPowerFromName(name);
  return `${Math.round(Number(power) * 80)}-${Math.round(Number(power) * 120)} kWh/tháng`;
};

// Helper function to check phase type
const getPhaseType = (combo: Combo) => {
  const type = combo.type?.toLowerCase() || '';
  const phaseType = combo.phase_type?.toLowerCase() || '';
  
  if (phaseType.includes('3-phase')) {
    if (phaseType.includes('low voltage')) {
      return '3-phase-low';
    }
    if (phaseType.includes('high voltage')) {
      return '3-phase-high';
    }
    return '3-phase'; // general 3-phase if voltage not specified
  }
  if (phaseType.includes('1-phase') || type.includes('mot_pha')) {
    return '1-phase';
  }
  return '';
};

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

  const getProductTag = (combo: Combo) => {
    const tags = {
      installation: combo.installation_type ? combo.installation_type.toUpperCase() : null,
      phase: null as string | null,
      system: null as string | null
    };
    
    const phaseType = getPhaseType(combo);
    if (phaseType === '3-phase-low') {
      tags.phase = '3 PHA ÁP THẤP';
    } else if (phaseType === '3-phase-high') {
      tags.phase = '3 PHA ÁP CAO';
    } else if (phaseType === '1-phase') {
      tags.phase = '1 PHA';
    }

    // Xác định loại hệ
    if (combo.installation_type?.toLowerCase() === 'ongrid') {
      tags.system = 'BÁM TẢI';
    } else if (combo.installation_type?.toLowerCase() === 'hybrid') {
      tags.system = 'ĐỘC LẬP';
    }
    
    return tags;
  };

  const ProductItem = ({ item }: { item: Combo }) => {
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
            pathname: "/(products)/product_baogia",
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
            </View>
            <View style={styles.horizontalContentContainer}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              
              <View style={styles.productDetails}>
                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
          pathname: "/(products)/product_baogia",
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
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{getFormattedProductName(item)}</Text>
            
            {showDetails && (
              <View style={styles.productDetails}>
                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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

const FilterDrawer = ({ 
  visible, 
  onClose, 
  options, 
  onSelect,
  selectedValue
}: {
  visible: boolean;
  onClose: () => void;
  options: Array<{key: string, value: string}>;
  onSelect: (key: string) => void;
  selectedValue: string;
}) => {
  const translateY = useRef(new Animated.Value(1000)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: opacity
            }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={onClose}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.drawer,
            {
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <ScrollView style={styles.drawerContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  selectedValue === option.key && styles.optionItemSelected
                ]}
                onPress={() => {
                  onSelect(option.key);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === option.key && styles.optionTextSelected
                ]}>
                  {option.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState<SectionKey | ''>('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Combo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchWidth = useRef(new Animated.Value(40)).current;
  const filterOpacity = useRef(new Animated.Value(1)).current;
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  type SectionKey = 'ongrid-1phase' | 'ongrid-3phase' | 'ongrid-3phase-low' | 'ongrid-3phase-high' | 
                    'hybrid-1phase' | 'hybrid-3phase' | 'hybrid-3phase-low' | 'hybrid-3phase-high';

  const sectionRefs = {
    'ongrid-1phase': useRef<View>(null),
    'ongrid-3phase': useRef<View>(null),
    'ongrid-3phase-low': useRef<View>(null),
    'ongrid-3phase-high': useRef<View>(null),
    'hybrid-1phase': useRef<View>(null),
    'hybrid-3phase': useRef<View>(null),
    'hybrid-3phase-low': useRef<View>(null),
    'hybrid-3phase-high': useRef<View>(null),
  };

  // Get Ongrid products
  const ongridProducts = sector?.list_combos?.filter(combo => 
    combo.installation_type === "Ongrid"
  ) || [];
    
  // Get Hybrid products
  const hybridProducts = sector?.list_combos?.filter(combo => 
    combo.installation_type === "Hybrid"
  ) || [];

  // Tạo filterOptions dựa trên sản phẩm thực tế có sẵn
  const filterOptions = [
    // Ongrid options
    ongridProducts.some(item => getPhaseType(item) === '1-phase') && 
      { key: 'ongrid-1phase' as SectionKey, value: 'Hệ Bám tải - 1 Pha' },
    ongridProducts.some(item => getPhaseType(item) === '3-phase') && 
      { key: 'ongrid-3phase' as SectionKey, value: 'Hệ Bám tải - 3 Pha' },
    ongridProducts.some(item => getPhaseType(item) === '3-phase-low') && 
      { key: 'ongrid-3phase-low' as SectionKey, value: 'Hệ Bám tải - 3 Pha Áp thấp' },
    ongridProducts.some(item => getPhaseType(item) === '3-phase-high') && 
      { key: 'ongrid-3phase-high' as SectionKey, value: 'Hệ Bám tải - 3 Pha Áp cao' },
    
    // Hybrid options
    hybridProducts.some(item => getPhaseType(item) === '1-phase') && 
      { key: 'hybrid-1phase' as SectionKey, value: 'Hệ Độc lập - 1 Pha' },
    hybridProducts.some(item => getPhaseType(item) === '3-phase') && 
      { key: 'hybrid-3phase' as SectionKey, value: 'Hệ Độc lập - 3 Pha' },
    hybridProducts.some(item => getPhaseType(item) === '3-phase-low') && 
      { key: 'hybrid-3phase-low' as SectionKey, value: 'Hệ Độc lập - 3 Pha Áp thấp' },
    hybridProducts.some(item => getPhaseType(item) === '3-phase-high') && 
      { key: 'hybrid-3phase-high' as SectionKey, value: 'Hệ Độc lập - 3 Pha Áp cao' },
  ].filter(Boolean) as Array<{key: SectionKey, value: string}>;

  const scrollToSection = (key: SectionKey) => {
    setSelectedFilter(key);
    setTimeout(() => {
      if (sectionRefs[key]?.current && scrollViewRef.current) {
        sectionRefs[key].current.measureLayout(
          // @ts-ignore - Known issue with ScrollView ref type
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 120,
              animated: true
            });
          },
          () => console.log('measurement failed')
        );
      }
    }, 25);
  };

  const getProductTag = (combo: Combo) => {
    const tags = {
      installation: combo.installation_type ? combo.installation_type.toUpperCase() : null,
      phase: null as string | null,
      system: null as string | null
    };
    
    const phaseType = getPhaseType(combo);
    if (phaseType === '3-phase-low') {
      tags.phase = '3 PHA ÁP THẤP';
    } else if (phaseType === '3-phase-high') {
      tags.phase = '3 PHA ÁP CAO';
    } else if (phaseType === '1-phase') {
      tags.phase = '1 PHA';
    }

    // Xác định loại hệ
    if (combo.installation_type?.toLowerCase() === 'ongrid') {
      tags.system = 'BÁM TẢI';
    } else if (combo.installation_type?.toLowerCase() === 'hybrid') {
      tags.system = 'ĐỘC LẬP';
    }
    
    return tags;
  };

  const renderProductItem = ({ item }: { item: Combo }) => (
    <TouchableOpacity 
      style={[styles.productCard, { width: (width - 80) / 2.5, marginHorizontal: 8, marginBottom: 16 }]}
      onPress={() => router.push({
        pathname: "/(products)/product_baogia",
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
      </View>
      <View style={styles.productInfo}>
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

  const activateSearch = () => {
    setIsSearchActive(true);
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: Dimensions.get('window').width - 32,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(filterOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
  };

  const deactivateSearch = (shouldReset: boolean = false) => {
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: 40,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(filterOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      })
    ]).start(() => {
      setIsSearchActive(false);
      if (shouldReset) {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
      }
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      setIsSearching(true);
      const results = sector?.list_combos?.filter(combo => 
        combo.name.toLowerCase().includes(text.toLowerCase())
      ) || [];
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const renderSearchResults = () => {
    if (!isSearching) return null;

    return (
      <View style={styles.searchResults}>
        <Text style={styles.searchResultsTitle}>
          {searchResults.length > 0 ? `${searchResults.length} kết quả` : 'Không tìm thấy kết quả'}
        </Text>
        <View style={styles.horizontalList}>
          {searchResults.map((item) => (
            <Link
              key={item.id}
              href={{
                pathname: "/(products)/product_baogia",
                params: { id: item.id.toString() }
              }}
              asChild
              onPress={() => {
                deactivateSearch(true);
                setSearchQuery('');
                setSearchResults([]);
                setIsSearching(false);
              }}
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
                </View>
                <View style={styles.horizontalContentContainer}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  
                  <View style={styles.productDetails}>
                    <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                    <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
          ))}
        </View>
      </View>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.filterRowWrapper}>
      <View style={styles.filterRow}>
        <Animated.View style={[styles.filterContainer, { opacity: filterOpacity }]}>
          <TouchableOpacity 
            style={styles.selectBox}
            onPress={() => setIsDrawerVisible(true)}
          >
            <Text style={styles.selectInput}>
              {selectedFilter ? filterOptions.find(opt => opt.key === selectedFilter)?.value : 'Chọn loại hệ'}
            </Text>
            <Image 
              source={require('../../assets/images/chevron-down.png')}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <FilterDrawer 
            visible={isDrawerVisible}
            onClose={() => setIsDrawerVisible(false)}
            options={filterOptions}
            onSelect={(key) => scrollToSection(key as SectionKey)}
            selectedValue={selectedFilter}
          />
        </Animated.View>

        <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
          {isSearchActive ? (
            <View style={styles.searchInputContainer}>
              <Image 
                source={require('../../assets/images/search-icon.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Bạn đang tìm gì nào?"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              <TouchableOpacity onPress={() => deactivateSearch(true)}>
                <Image 
                  source={require('../../assets/images/cross.png')}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.searchButton} onPress={activateSearch}>
              <Image 
                source={require('../../assets/images/search-icon.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </View>
  );

  // Add scroll handler
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > lastScrollY.current && headerVisible && currentScrollY > 50) {
      setHeaderVisible(false);
    } else if (currentScrollY < lastScrollY.current && !headerVisible) {
      setHeaderVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

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

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerTransparent: false,
          headerBlurEffect: 'regular',
          headerStyle: {
            backgroundColor: sector.id === 1 ? '#4CAF50' : 
                           sector.id === 2 ? '#FFD700' : '#0F974A',
          },
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Image 
                source={require('../../assets/images/chevron-left.png')}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Image 
                source={require('../../assets/images/comment-2-question.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
          paddingBottom: 20
        }}
        style={{ 
          flex: 1,
          backgroundColor: '#f5f5f8'
        }}
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
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                if (sector.sale_phone) {
                  Linking.openURL(`tel:${sector.sale_phone}`);
                }
              }}
            >
              <Image 
                source={require('../../assets/images/phone.png')} 
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text style={styles.actionText}>Hotline</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brandActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonFull]}
              onPress={() => router.push({
                pathname: "/(tabs)/gallery",
                params: { sector_id: sector.id }
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image 
                  source={require('../../assets/images/video-library.png')} 
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
                <Text style={styles.actionText}>Nội dung của {sector.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.actionCount, { color: '#fff' }]}>{sector.list_contents?.length || 0} bài viết</Text>
                <Image 
                  source={require('../../assets/images/chevron-right.png')} 
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky Filter Row */}
        <View style={styles.filterRowWrapper}>
          {renderFilterSection()}
        </View>

        {/* Search Results */}
        {isSearching ? (
          renderSearchResults()
        ) : (
          <>
            {/* Best Selling Section */}
            <WhiteSpace size="lg" />
            <Text style={styles.sectionTitle}>Bán chạy</Text>
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

            {/* Ongrid Section */}
            <View style={styles.productSection}>
              <Text style={styles.sectionTitle}>Hệ Bám tải</Text>
              
              {/* Nhóm 1 pha */}
              {ongridProducts.some(item => getPhaseType(item) === '1-phase') && (
                <View ref={sectionRefs['ongrid-1phase']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Bám tải - 1 Pha</Text>
                  <View style={styles.horizontalList}>
                    {ongridProducts
                      .filter(item => getPhaseType(item) === '1-phase')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha */}
              {ongridProducts.some(item => getPhaseType(item) === '3-phase') && (
                <View ref={sectionRefs['ongrid-3phase']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Bám tải - 3 Pha</Text>
                  <View style={styles.horizontalList}>
                    {ongridProducts
                      .filter(item => getPhaseType(item) === '3-phase')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha áp thấp */}
              {ongridProducts.some(item => getPhaseType(item) === '3-phase-low') && (
                <View ref={sectionRefs['ongrid-3phase-low']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Bám tải - 3 Pha Áp thấp</Text>
                  <View style={styles.horizontalList}>
                    {ongridProducts
                      .filter(item => getPhaseType(item) === '3-phase-low')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha áp cao */}
              {ongridProducts.some(item => getPhaseType(item) === '3-phase-high') && (
                <View ref={sectionRefs['ongrid-3phase-high']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Bám tải - 3 Pha Áp cao</Text>
                  <View style={styles.horizontalList}>
                    {ongridProducts
                      .filter(item => getPhaseType(item) === '3-phase-high')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {ongridProducts.length === 0 && (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </View>

            {/* Hybrid Section */}
            <View style={styles.productSection}>
              <Text style={styles.sectionTitle}>Hệ Độc lập</Text>
              
              {/* Nhóm 1 pha */}
              {hybridProducts.some(item => getPhaseType(item) === '1-phase') && (
                <View ref={sectionRefs['hybrid-1phase']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Độc lập - 1 Pha</Text>
                  <View style={styles.horizontalList}>
                    {hybridProducts
                      .filter(item => getPhaseType(item) === '1-phase')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha */}
              {hybridProducts.some(item => getPhaseType(item) === '3-phase') && (
                <View ref={sectionRefs['hybrid-3phase']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Độc lập - 3 Pha</Text>
                  <View style={styles.horizontalList}>
                    {hybridProducts
                      .filter(item => getPhaseType(item) === '3-phase')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha áp thấp */}
              {hybridProducts.some(item => getPhaseType(item) === '3-phase-low') && (
                <View ref={sectionRefs['hybrid-3phase-low']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Độc lập - 3 Pha Áp thấp</Text>
                  <View style={styles.horizontalList}>
                    {hybridProducts
                      .filter(item => getPhaseType(item) === '3-phase-low')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {/* Nhóm 3 pha áp cao */}
              {hybridProducts.some(item => getPhaseType(item) === '3-phase-high') && (
                <View ref={sectionRefs['hybrid-3phase-high']} collapsable={false}>
                  <Text style={styles.phaseTitle}>Hệ Độc lập - 3 Pha Áp cao</Text>
                  <View style={styles.horizontalList}>
                    {hybridProducts
                      .filter(item => getPhaseType(item) === '3-phase-high')
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={{
                            pathname: "/(products)/product_baogia",
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
                            </View>
                            <View style={styles.horizontalContentContainer}>
                              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                              
                              <View style={styles.productDetails}>
                                <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(item.name)}</Text>
                                <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(item.payback_period)}</Text>
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
                      ))}
                  </View>
                </View>
              )}

              {hybridProducts.length === 0 && (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </View>
          </>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButtonFull: {
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
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
    padding: 8,
    gap: 4,
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
    marginBottom: 2,
    flexShrink: 1,
    minHeight: 38,
    lineHeight: 18
  },
  productDetails: {
    gap: 2,
  },
  productDetail: {
    fontSize: 12,
    color: '#7B7D9D',
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ED1C24',
    lineHeight: 20
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
  tagsContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    flexDirection: 'column',
    gap: 4,
  },
  tagContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  tagContainerHorizontal: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginBottom: 4,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
  },
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    overflow: 'hidden',
  },
  horizontalContentContainer: {
    flex: 1,
    padding: 12,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7B7D9D',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  phaseTag: {
    backgroundColor: '#F5F5F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  phaseTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7B7D9D',
    textAlign: 'center',
  },
  systemTag: {
    backgroundColor: '#ECF8F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  systemTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F974A',
    textAlign: 'center',
  },
  filterRowWrapper: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterContainer: {
    flex: 1,
    position: 'relative',
  },
  selectBox: {
    borderRadius: 8,
    borderColor: '#E5E5E5',
    backgroundColor: '#F5F5F8',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  selectInput: {
    color: '#27273E',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    paddingRight: 12,
  },
  dropdownText: {
    color: '#27273E',
    fontSize: 14,
    textAlign: 'left',
    paddingLeft: 8,
  },
  searchContainer: {
    height: 40,
    backgroundColor: '#F5F5F8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    height: 40,
    zIndex: 2,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27273E',
  },
  drawerContent: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: '#F5F5F8',
  },
  optionText: {
    fontSize: 16,
    color: '#27273E',
  },
  optionTextSelected: {
    color: '#ED1C24',
    fontWeight: '500',
  },
  searchResults: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  searchResultsTitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
}); 