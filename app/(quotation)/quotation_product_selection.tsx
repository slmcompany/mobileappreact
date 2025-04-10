import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Sector = {
  id: number;
  name: string;
  code: string;
  image: string;
  image_rectangular: string;
  list_combos: any[];
};

type ProductLine = {
  id: number;
  name: string;
  code: string;
  logoUrl: string;
  rectangularImageUrl: string;
  combosCount: number;
  selected: boolean;
};

type CardStyle = {
  borderWidth?: number;
  height?: number;
  borderRadius?: number;
  position?: 'relative';
  borderColor?: string;
  backgroundColor?: string;
};

export default function QuotationProductSelection() {
  const params = useLocalSearchParams();
  const customerId = params.customerId as string;
  const phoneNumber = params.phoneNumber as string;
  const isNewCustomer = params.isNewCustomer === 'true';
  
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://id.slmsolar.com/api/sector');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sectors');
      }
      
      const data: Sector[] = await response.json();
      
      // Transform data for our component
      const formattedData = data.map((sector, index) => ({
        id: sector.id,
        name: sector.name,
        code: sector.code,
        logoUrl: sector.image,
        rectangularImageUrl: sector.image_rectangular,
        combosCount: sector.list_combos?.length || 0,
        selected: index === 0, // Select the first item by default
      }));
      
      setProductLines(formattedData);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (id: number) => {
    setProductLines(
      productLines.map((product) => ({
        ...product,
        selected: product.id === id,
      }))
    );
  };

  const handleContinue = () => {
    const selectedProduct = productLines.find(product => product.selected);
    
    if (selectedProduct) {
      // Store data in global state or AsyncStorage instead of passing via URL
      console.log('Selected product:', selectedProduct);
      console.log('Customer data:', { customerId, phoneNumber, isNewCustomer });
      
      // Chuyển sang bước 3 - màn hình lọc sản phẩm theo thiết kế Figma
      // Truyền id sector đã chọn và thông tin khách hàng
      router.push({
        pathname: '/(quotation)/quotation_basic_info',
        params: { 
          sectorId: selectedProduct.id.toString(),
          customerId,
          phoneNumber,
          isNewCustomer: isNewCustomer ? 'true' : 'false'
        }
      });
    }
  };

  const getCardStyle = (product: ProductLine) => {
    const cardStyles: CardStyle[] = [
      styles.productCard,
      { backgroundColor: product.code === 'SLM' ? '#4CAF50' : '#FFD700' }
    ];
    
    if (product.selected) {
      cardStyles.push({ 
        borderColor: product.code === 'SLM' ? '#12B669' : '#FFB800',
        borderWidth: 1,
      });
    }
    
    return cardStyles;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSectors}>
          <Text style={styles.retryText}>Thử lại</Text>
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
            <Text>
              <Ionicons name="chevron-back" size={24} color="#7B7D9D" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text>
              <Ionicons name="close" size={24} color="#7B7D9D" />
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
            <View style={styles.progressIncomplete} />
            <View style={styles.progressIncomplete} />
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.title}>Bạn muốn tạo báo giá cho dòng sản phẩm nào?</Text>
          <Text style={styles.subtitle}>Chọn 1 dòng sản phẩm để tiếp tục</Text>
          
          {/* Product lines */}
          <View style={styles.productLinesContainer}>
            {productLines.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={getCardStyle(product)}
                onPress={() => handleProductSelect(product.id)}
              >
                <View style={styles.cardContent}>
                  <Image
                    source={{ uri: product.logoUrl }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                
                {product.selected && (
                  <View style={styles.checkContainer}>
                    <Text>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
   
        
        {/* Bottom action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>TIẾP TỤC</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#27273E',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 24,
    fontFamily: 'System',
  },
  productLinesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  productCard: {
    flex: 1,
    borderWidth: 1,
    height: 48,
    borderRadius: 8,
    position: 'relative',
    borderColor: '#DCDCE6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solarMaxBackground: {
    backgroundColor: '#4CAF50',
  },
  elitonBackground: {
    backgroundColor: '#FFD700',
  },
  solarMaxBorder: {
    borderColor: '#12B669',
  },
  elitonBorder: {
    borderColor: '#FFB800',
  },
  productCardNormal: {
    borderColor: '#DCDCE6',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 32,
    width: '100%',
    alignSelf: 'center',
  },
  checkContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 4,
    right: 8,
    backgroundColor: '#12B669',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  button: {
    backgroundColor: '#ED1C24',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  debug: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
}); 