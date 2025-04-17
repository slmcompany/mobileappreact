import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Định nghĩa các loại tùy chọn
type SystemType = 'HYBRID' | 'BAM_TAI';
type PhaseType = 'ONE_PHASE' | 'THREE_PHASE_LOW' | 'THREE_PHASE_HIGH' | 'THREE_PHASE';

// Định nghĩa kiểu dữ liệu cho combo
type Combo = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  phase_type?: string;
  capacity?: string;
  type?: string;
  installation_type?: string;
  power_output?: string;
  total_price?: number;
  payback_period?: number;
  output_min?: string;
  output_max?: string;
  data_json?: {
    output_min?: string;
    output_max?: string;
  };
};

// Định nghĩa kiểu dữ liệu cho sector
type Sector = {
  id: number;
  name: string;
  code: string;
  image: string;
  image_rectangular: string;
  list_combos: Combo[];
};

// Helper function to get power from name
const getPowerFromName = (name: string) => {
  const match = name.match(/(\d+(\.\d+)?)\s*kw/i);
  return match ? match[1] : '5.5';
};

// Helper function to format power output
const formatPowerOutput = (combo: Combo): string => {
  if (combo.output_min && combo.output_max) {
    return `${combo.output_min}-${combo.output_max} kWh/tháng`;
  }
  return 'N/A';
};

// Helper function to format payback period from years
const formatPaybackPeriod = (years: number | undefined): string => {
  if (!years) return '... năm ... tháng';
  const wholeYears = Math.floor(years);
  const remainingMonths = Math.round((years % 1) * 12);
  return `${wholeYears} năm ${remainingMonths} tháng`;
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

// Thêm hàm getProductTag
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
  if (combo.installation_type?.toLowerCase() === 'ongrid' || combo.type?.includes('BAM_TAI')) {
    tags.system = 'BÁM TẢI';
  } else if (combo.installation_type?.toLowerCase() === 'hybrid' || combo.type?.includes('DOC_LAP')) {
    tags.system = 'ĐỘC LẬP';
  }
  
  return tags;
};

export default function QuotationBasicInfo() {
  // Get params from previous screen
  const params = useLocalSearchParams();
  const sectorId = params.sectorId as string;
  const customerId = params.customerId as string;
  const phoneNumber = params.phoneNumber as string;
  const isNewCustomer = params.isNewCustomer === 'true';

  // State cho các tùy chọn lọc
  const [systemType, setSystemType] = useState<SystemType>('HYBRID');
  const [phaseType, setPhaseType] = useState<PhaseType>('ONE_PHASE');
  
  // State cho việc kiểm soát hiển thị tuần tự
  const [showPhaseSelection, setShowPhaseSelection] = useState(false);
  const [showSuggestedProducts, setShowSuggestedProducts] = useState(false);
  
  // State cho dữ liệu sector và combos
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  // Lấy thông tin sector từ API
  useEffect(() => {
    const fetchSectorData = async () => {
      if (!sectorId) return;
      
      try {
        setLoading(true);
        const response = await fetch('https://api.slmglobal.vn/api/sector');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sectors');
        }
        
        const sectors: Sector[] = await response.json();
        const foundSector = sectors.find(item => item.id.toString() === sectorId);
        
        if (foundSector) {
          setSector(foundSector);
          
          // Kiểm tra nếu có danh sách combos từ API
          if (foundSector.list_combos && foundSector.list_combos.length > 0) {
            setFilteredCombos(foundSector.list_combos);
          } else {
            // Nếu API không trả về combos, sử dụng dữ liệu mẫu
            const sampleCombos: Combo[] = [
              {
                id: 1,
                name: "Hệ Độc lập Một pha 8kW",
                description: "Sản lượng điện: 400-600 kWh/tháng",
                price: 124570689,
                image: "https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/06.%20Logo/01.%20SolarMax/SolarMax_ngang.jpg"
              },
              {
                id: 2,
                name: "Hệ Độc lập Một pha 10kW",
                description: "Sản lượng điện: 1200-1400 kWh/tháng",
                price: 158720000,
                image: "https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/06.%20Logo/01.%20SolarMax/SolarMax_ngang.jpg"
              }
            ];
            setFilteredCombos(sampleCombos);
          }
        } else {
          setError('Không tìm thấy sector');
        }
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, [sectorId]);

  // Xử lý khi chọn loại hệ
  const handleSystemTypeSelect = (type: SystemType) => {
    setSystemType(type);
    // Reset phase type when system type changes
    if (type === 'BAM_TAI') {
      // For BAM_TAI, we only have ONE_PHASE or THREE_PHASE
      setPhaseType('ONE_PHASE');
    } else {
      // For HYBRID, we keep the default ONE_PHASE
      setPhaseType('ONE_PHASE');
    }
    
    setShowPhaseSelection(true);
    setShowSuggestedProducts(false);
    setSelectedCombo(null);
  };

  // Xử lý khi chọn loại pha
  const handlePhaseTypeSelect = (type: PhaseType) => {
    setPhaseType(type);
    setShowSuggestedProducts(true);
  };

  // Lọc combos dựa trên các tùy chọn
  useEffect(() => {
    if (!sector) return;
    
    let filtered = sector.list_combos || [];
    
    // Lọc theo loại hệ thống (HYBRID/BAM_TAI)
    if (systemType === 'HYBRID') {
      filtered = filtered.filter(combo => 
        combo.installation_type?.toLowerCase() === 'hybrid' ||
        combo.type?.includes('DOC_LAP')
      );
    } else if (systemType === 'BAM_TAI') {
      filtered = filtered.filter(combo => 
        combo.installation_type?.toLowerCase() === 'ongrid' ||
        combo.type?.includes('BAM_TAI')
      );
    }

    // Lọc theo số pha và điện áp
    if (phaseType === 'ONE_PHASE') {
      filtered = filtered.filter(combo => 
        getPhaseType(combo) === '1-phase' ||
        combo.type?.includes('MOT_PHA')
      );
    } else if (phaseType === 'THREE_PHASE_LOW') {
      filtered = filtered.filter(combo => 
        getPhaseType(combo) === '3-phase-low' ||
        (combo.type?.includes('BA_PHA') && combo.type?.toLowerCase().includes('ap thap'))
      );
    } else if (phaseType === 'THREE_PHASE_HIGH') {
      filtered = filtered.filter(combo => 
        getPhaseType(combo) === '3-phase-high' ||
        (combo.type?.includes('BA_PHA') && combo.type?.toLowerCase().includes('ap cao'))
      );
    } else if (phaseType === 'THREE_PHASE') {
      // For the generic 3-phase option (for BAM_TAI)
      filtered = filtered.filter(combo => 
        getPhaseType(combo).includes('3-phase') || 
        combo.type?.includes('BA_PHA')
      );
    }

    // Sắp xếp theo giá tăng dần
    filtered.sort((a, b) => {
      const priceA = a.total_price || a.price || 0;
      const priceB = b.total_price || b.price || 0;
      return priceA - priceB;
    });

    setFilteredCombos(filtered);
  }, [systemType, phaseType, sector]);

  // Thêm hàm để chọn combo
  const handleComboSelect = (combo: Combo) => {
    setSelectedCombo(combo);
  };

  const handleContinue = () => {
    // Logic để xử lý khi người dùng nhấn nút tiếp tục
    
    // Nếu đã chọn combo, truyền thông tin combo sang bước 4
    if (selectedCombo) {
      router.push({
        pathname: '/quotation_details',
        params: { 
          systemType,
          phaseType,
          comboId: selectedCombo.id?.toString() || '',
          comboName: selectedCombo.name || '',
          comboPrice: selectedCombo.price ? selectedCombo.price.toString() : '0',
          customerId,
          phoneNumber,
          isNewCustomer: isNewCustomer ? 'true' : 'false'
        }
      });
    } else {
      // Nếu không chọn combo, vẫn chuyển sang bước 4 nhưng không có thông tin combo
      router.push({
        pathname: '/quotation_details',
        params: { 
          systemType, 
          phaseType,
          customerId,
          phoneNumber,
          isNewCustomer: isNewCustomer ? 'true' : 'false'
        }
      });
    }
  };

  // Hiển thị màn hình loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  // Hiển thị màn hình lỗi
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#7B7D9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
            <View style={styles.progressIncomplete} />
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Main content */}
          <View style={styles.content}>
            <Text style={styles.title}>Chọn phân loại sản phẩm</Text>
            <Text style={styles.subtitle}>
              Danh mục thiết bị và vật tư sẽ được tự động lọc theo những lựa chọn của bạn.
            </Text>

            {/* Tùy chọn lọc */}
            <View style={styles.filterOptionsContainer}>
              {/* Loại hệ */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Loại hệ</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      systemType === 'HYBRID' ? styles.optionButtonSelected : styles.optionButtonNormal,
                    ]}
                    onPress={() => handleSystemTypeSelect('HYBRID')}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        systemType === 'HYBRID' ? styles.optionTextSelected : styles.optionTextNormal,
                      ]}
                    >
                      HYBRID
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      systemType === 'BAM_TAI' ? styles.optionButtonSelected : styles.optionButtonNormal,
                    ]}
                    onPress={() => handleSystemTypeSelect('BAM_TAI')}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        systemType === 'BAM_TAI' ? styles.optionTextSelected : styles.optionTextNormal,
                      ]}
                    >
                      BÁM TẢI
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Số pha - chỉ hiển thị khi đã chọn loại hệ */}
              {showPhaseSelection && (
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Số pha</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        phaseType === 'ONE_PHASE' ? styles.optionButtonSelected : styles.optionButtonNormal,
                      ]}
                      onPress={() => handlePhaseTypeSelect('ONE_PHASE')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          phaseType === 'ONE_PHASE' ? styles.optionTextSelected : styles.optionTextNormal,
                        ]}
                      >
                        MỘT PHA
                      </Text>
                    </TouchableOpacity>
                    
                    {systemType === 'HYBRID' ? (
                      // Hiển thị ba pha áp thấp và áp cao cho hệ HYBRID
                      <>
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            phaseType === 'THREE_PHASE_LOW' ? styles.optionButtonSelected : styles.optionButtonNormal,
                          ]}
                          onPress={() => handlePhaseTypeSelect('THREE_PHASE_LOW')}
                        >
                          <Text 
                            style={[
                              styles.optionText,
                              phaseType === 'THREE_PHASE_LOW' ? styles.optionTextSelected : styles.optionTextNormal,
                            ]}
                          >
                            BA PHA ÁP THẤP
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            phaseType === 'THREE_PHASE_HIGH' ? styles.optionButtonSelected : styles.optionButtonNormal,
                          ]}
                          onPress={() => handlePhaseTypeSelect('THREE_PHASE_HIGH')}
                        >
                          <Text 
                            style={[
                              styles.optionText,
                              phaseType === 'THREE_PHASE_HIGH' ? styles.optionTextSelected : styles.optionTextNormal,
                            ]}
                          >
                            BA PHA ÁP CAO
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Hiển thị chỉ một tùy chọn ba pha cho hệ BÁM TẢI
                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          phaseType === 'THREE_PHASE' ? styles.optionButtonSelected : styles.optionButtonNormal,
                        ]}
                        onPress={() => handlePhaseTypeSelect('THREE_PHASE')}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            phaseType === 'THREE_PHASE' ? styles.optionTextSelected : styles.optionTextNormal,
                          ]}
                        >
                          BA PHA
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Sản phẩm gợi ý - chỉ hiển thị khi đã chọn số pha */}
            {showSuggestedProducts && (
              <View style={styles.suggestedProductsContainer}>
                <Text style={styles.sectionTitle}>SẢN PHẨM GỢI Ý</Text>
                
                {filteredCombos.length > 0 ? (
                  <View style={styles.horizontalList}>
                    {filteredCombos.map((combo) => (
                      <TouchableOpacity
                        key={combo.id}
                        style={[
                          styles.horizontalCard,
                          selectedCombo?.id === combo.id ? styles.comboCardSelected : {}
                        ]}
                        onPress={() => handleComboSelect(combo)}
                      >
                        <View style={styles.horizontalImageContainer}>
                          {combo.image ? (
                            <Image 
                              source={{ uri: combo.image }} 
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
                          <Text style={styles.productName} numberOfLines={2}>{combo.name}</Text>
                          
                          <View style={styles.productDetails}>
                            <Text style={styles.productDetail}>Sản lượng điện: {formatPowerOutput(combo)}</Text>
                            <Text style={styles.productDetail}>Thời gian hoàn vốn: {formatPaybackPeriod(combo.payback_period)}</Text>
                          </View>
                          
                          <View style={styles.priceContainer}>
                            <Text style={styles.productPrice}>
                              {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              }).format(combo.total_price || combo.price)}
                            </Text>
                          </View>
                        </View>
                        {selectedCombo?.id === combo.id && (
                          <View style={styles.selectedComboIndicator}>
                            <Ionicons name="checkmark-circle" size={24} color="#12B669" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noProductsContainer}>
                    <Text style={styles.noProductsText}>Không tìm thấy sản phẩm phù hợp với lựa chọn của bạn.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.buttonBack}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonTextBack}>QUAY LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonContinue,
              (!showSuggestedProducts) && styles.buttonContinueDisabled
            ]}
            onPress={handleContinue}
            disabled={!showSuggestedProducts}
          >
            <Text style={styles.buttonTextContinue}>TIẾP TỤC</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7B7D9D',
  },
  errorText: {
    fontSize: 16,
    color: '#ED1C24',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ED1C24',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
  },
  progressComplete: {
    flex: 1,
    backgroundColor: '#ED1C24',
    height: 4,
    borderRadius: 2,
  },
  progressIncomplete: {
    flex: 1,
    backgroundColor: '#FFECED',
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#27273E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 24,
  },
  filterOptionsContainer: {
    gap: 24,
  },
  filterGroup: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27273E',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionButtonSelected: {
    backgroundColor: '#ECFDF3',
    borderColor: '#12B669',
  },
  optionButtonNormal: {
    backgroundColor: '#F5F5F8',
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#12B669',
  },
  optionTextNormal: {
    color: '#7B7D9D',
  },
  suggestedProductsContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
    marginBottom: 12,
  },
  horizontalList: {
    gap: 8,
  },
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  comboCardSelected: {
    borderWidth: 1,
    borderColor: '#12B669',
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContentContainer: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
    marginBottom: 4,
    minHeight: 38,
    lineHeight: 18,
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
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ED1C24',
    lineHeight: 20,
  },
  selectedComboIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  buttonBack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ABACC2',
  },
  buttonContinue: {
    backgroundColor: '#ED1C24',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: 120,
    alignItems: 'center',
  },
  buttonTextBack: {
    color: '#7B7D9D',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextContinue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F8',
  },
  noProductsText: {
    fontSize: 14,
    color: '#7B7D9D',
    textAlign: 'center',
  },
  buttonContinueDisabled: {
    backgroundColor: '#ABACC2',
  },
}); 