import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, StatusBar, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProductLine {
  id: string;
  name: string;
  image: any;
  productCount: number;
  route: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  image: any | null;
  tags: string[];
}

const productLines: ProductLine[] = [
  {
    id: '1',
    name: 'Điện mặt trời SolarMax',
    image: require('@/assets/images/solarmax-logo.png'),
    productCount: 16,
    route: '/product_line'
  },
  {
    id: '2',
    name: 'Thang máy Eliton',
    image: require('@/assets/images/eliton-logo.png'),
    productCount: 12,
    route: '/product_line'
  },
];

const bestSellersSolarmax: Product[] = [
  {
    id: '1',
    name: 'Hệ Độc lập Một pha 8kW',
    price: '124 570 689 đ',
    image: null,
    tags: ['ĐỘC LẬP']
  },
  {
    id: '2',
    name: 'Hệ Bám tải Một pha 8kW',
    price: '124 570 689 đ',
    image: null,
    tags: ['BÁM TẢI']
  },
  {
    id: '3',
    name: 'Hệ Độc lập Ba pha 8kW Áp cao',
    price: '124 570 689 đ',
    image: null,
    tags: []
  },
];

const bestSellersEliton: Product[] = [
  {
    id: '1',
    name: 'Dragonfly Gold',
    price: '124 570 689 đ',
    image: null,
    tags: ['ELI-01']
  },
  {
    id: '2',
    name: 'Dragonfly Silver',
    price: '124 570 689 đ',
    image: null,
    tags: ['ELI-01']
  },
  {
    id: '3',
    name: 'Minions',
    price: '124 570 689 đ',
    image: null,
    tags: []
  },
];

export default function ProductScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const [currentNewProductIndex, setCurrentNewProductIndex] = useState(0);

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productImageContainer}>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.tags[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string, onPress: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>Tất cả</Text>
        <Ionicons name="chevron-forward" size={16} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const handleIndicatorPress = (index: number) => {
    setCurrentNewProductIndex(index);
  };

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

        {/* Product Lines */}
        <View style={styles.productLinesContainer}>
          <View style={styles.productLinesRow}>
            {productLines.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productLine}
                onPress={() => router.push(product.route as any)}
              >
                <Image 
                  source={product.image}
                  style={styles.productLogo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
          <View style={styles.newProductsContainer}>
            <View style={styles.newProductCard}>
              {/* Placeholder for product image */}
            </View>
          </View>
          <View style={styles.indicators}>
            <TouchableOpacity 
              style={[styles.indicator, currentNewProductIndex === 0 ? styles.activeIndicator : null]}
              onPress={() => handleIndicatorPress(0)}
            />
            <TouchableOpacity 
              style={[styles.indicator, currentNewProductIndex === 1 ? styles.activeIndicator : null]}
              onPress={() => handleIndicatorPress(1)}
            />
            <TouchableOpacity 
              style={[styles.indicator, currentNewProductIndex === 2 ? styles.activeIndicator : null]}
              onPress={() => handleIndicatorPress(2)}
            />
          </View>
        </View>

        {/* Best Sellers - SolarMax */}
        <View style={styles.section}>
          {renderSectionHeader('Bán chạy', () => {})}
          <Text style={styles.brandTitle}>ĐIỆN MẶT TRỜI SOLARMAX</Text>
          <FlatList
            data={bestSellersSolarmax}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsListContainer}
          />
        </View>

        {/* Best Sellers - Eliton */}
        <View style={styles.section}>
          <Text style={styles.brandTitle}>THANG MÁY ELITON</Text>
          <FlatList
            data={bestSellersEliton}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsListContainer}
          />
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
  },
  productLinesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
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
  productLogo: {
    width: '80%',
    height: '80%',
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  newProductsContainer: {
    marginHorizontal: -15,
  },
  newProductCard: {
    height: 180,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
    borderRadius: 8,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FF3B30',
    width: 16,
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
    fontSize: 14,
    color: '#FF3B30',
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
  productItem: {
    width: 130,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    height: 100,
    backgroundColor: '#f0f0f0',
    position: 'relative',
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
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
    height: 36,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
}); 