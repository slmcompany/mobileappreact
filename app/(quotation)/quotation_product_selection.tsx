import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
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
  logoUrl: string;
  rectangularImageUrl: string;
  combosCount: number;
  selected: boolean;
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
    // Get selected product and pass to next screen
    const selectedProduct = productLines.find(product => product.selected);
    
    if (selectedProduct) {
      // Store data in global state or AsyncStorage instead of passing via URL
      console.log('Selected product:', selectedProduct);
      console.log('Customer data:', { customerId, phoneNumber, isNewCustomer });
      
      // Chuyển sang bước 3 - màn hình lọc sản phẩm theo thiết kế Figma
      // Truyền id sector đã chọn
      router.push({
        pathname: '/(quotation)/quotation_basic_info',
        params: { sectorId: selectedProduct.id.toString() }
      });
    }
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
            <Ionicons name="chevron-back" size={24} color="#7B7D9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
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
                style={[
                  styles.productCard,
                  product.selected ? styles.productCardSelected : styles.productCardNormal
                ]}
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
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Bottom indicator */}
        <View style={styles.indicator}>
          <View style={styles.indicatorLine} />
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
    gap: 12,
    paddingHorizontal: 0,
  },
  productCard: {
    borderWidth: 1,
    height: 80,
    borderRadius: 8,
    position: 'relative',
  },
  productCardSelected: {
    borderColor: '#12B669',
  },
  productCardNormal: {
    borderColor: '#DCDCE6',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    height: 40,
    width: 160,
    alignSelf: 'flex-start',
  },
  checkContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 28,
    right: 16,
    backgroundColor: '#12B669',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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