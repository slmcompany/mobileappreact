import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Định nghĩa các loại tùy chọn
type SystemType = 'HYBRID' | 'BAM_TAI';
type PhaseType = 'ONE_PHASE' | 'THREE_PHASE_LOW' | 'THREE_PHASE_HIGH';

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
        const response = await fetch('https://id.slmsolar.com/api/sector');
        
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
    }

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
                    onPress={() => setSystemType('HYBRID')}
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
                    onPress={() => setSystemType('BAM_TAI')}
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

              {/* Số pha */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Số pha</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      phaseType === 'ONE_PHASE' ? styles.optionButtonSelected : styles.optionButtonNormal,
                    ]}
                    onPress={() => setPhaseType('ONE_PHASE')}
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
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      phaseType === 'THREE_PHASE_LOW' ? styles.optionButtonSelected : styles.optionButtonNormal,
                    ]}
                    onPress={() => setPhaseType('THREE_PHASE_LOW')}
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
                    onPress={() => setPhaseType('THREE_PHASE_HIGH')}
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
                </View>
              </View>
            </View>

            {/* Sản phẩm gợi ý */}
            <View style={styles.suggestedProductsContainer}>
              <Text style={styles.suggestedTitle}>SẢN PHẨM GỢI Ý</Text>
              
              <View style={styles.productList}>
                {filteredCombos.map((combo) => (
                  <TouchableOpacity
                    key={combo.id}
                    style={[
                      styles.comboCard,
                      selectedCombo?.id === combo.id ? styles.comboCardSelected : {}
                    ]}
                    onPress={() => handleComboSelect(combo)}
                  >
                    <View style={styles.comboImageContainer}>
                      {combo.image ? (
                        <Image 
                          source={{ uri: combo.image }} 
                          style={styles.comboImage}
                          resizeMode="contain" 
                        />
                      ) : (
                        <View style={styles.comboImagePlaceholder}>
                          <Ionicons name="image-outline" size={24} color="#ABACC2" />
                        </View>
                      )}
                    </View>
                    <View style={styles.comboDetails}>
                      <Text style={styles.comboName}>{combo.name}</Text>
                      {combo.description && (
                        <Text style={styles.comboDescription}>{combo.description}</Text>
                      )}
                      <View style={styles.priceAndTagsContainer}>
                        <View style={styles.comboPrice}>
                          <Text style={styles.comboPriceValue}>
                            {(combo.total_price || combo.price).toLocaleString()}
                          </Text>
                          <Text style={styles.comboPriceCurrency}>đ</Text>
                        </View>
                        <View style={styles.tagsRow}>
                          {getProductTag(combo).phase && (
                            <View style={styles.phaseTag}>
                              <Text style={styles.phaseTagText}>{getProductTag(combo).phase}</Text>
                            </View>
                          )}
                          {getProductTag(combo).system && (
                            <View style={styles.systemTag}>
                              <Text style={styles.systemTagText}>{getProductTag(combo).system}</Text>
                            </View>
                          )}
                        </View>
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
            </View>
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
            style={styles.buttonContinue}
            onPress={handleContinue}
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
  suggestedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
    marginBottom: 12,
  },
  productList: {
    gap: 8,
  },
  comboCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#27273E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    position: 'relative',
  },
  comboCardSelected: {
    borderWidth: 1,
    borderColor: '#12B669',
  },
  comboImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  comboImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F8',
  },
  comboImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comboDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  comboName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
    marginBottom: 4,
  },
  comboDescription: {
    fontSize: 12,
    color: '#7B7D9D',
    marginBottom: 8,
  },
  priceAndTagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  comboPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ED1C24',
  },
  comboPriceCurrency: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ED1C24',
    marginLeft: 2,
  },
  selectedComboIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  indicator: {
    height: 34,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  indicatorLine: {
    width: 135,
    height: 4,
    backgroundColor: '#0A0E15',
    borderRadius: 100,
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
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseTag: {
    backgroundColor: '#F5F5F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  phaseTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7B7D9D',
  },
  systemTag: {
    backgroundColor: '#ECF8F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  systemTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F974A',
  },
}); 