import React from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Text, WhiteSpace, WingBlank, Flex } from '@ant-design/react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSector } from '../../hooks/useSector';
import { Combo, Sector } from '../../models/sector';

export default function ProductBrandScreen() {
  const { id } = useLocalSearchParams();
  const { data: sector, isLoading, error } = useSector(Number(id));
  const { width } = Dimensions.get('window');
  const CARD_MARGIN = 8;
  const HORIZONTAL_PADDING = 16;
  const VISIBLE_CARDS = 2.5;
  const cardWidth = (width - (HORIZONTAL_PADDING * 2) - (CARD_MARGIN * (VISIBLE_CARDS - 1))) / VISIBLE_CARDS;

  const ProductItem = ({ item, isHorizontal }: { item: Combo, isHorizontal?: boolean }) => (
    <TouchableOpacity 
      style={[
        styles.productCard,
        isHorizontal && { width: cardWidth }
      ]}
      onPress={() => router.push({
        pathname: "/(products)/product_detail",
        params: { id: item.id.toString() }
      })}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={40} color="#888" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productType}>
          <Text style={styles.productTypeText}>{item.type || 'ĐỘC LẬP'}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {!isHorizontal && (
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

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#0F974A',
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
        <View style={styles.brandHeader}>
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
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Bán chạy</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {sector.list_combos?.slice(0, 5).map((combo) => (
              <ProductItem key={combo.id} item={combo} isHorizontal />
            ))}
          </ScrollView>
        </View>

        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Hệ Độc lập</Text>
          <Text style={styles.subSectionTitle}>ĐỘC LẬP - MỘT PHA</Text>
          <View style={styles.productGrid}>
            {sector.list_combos?.filter(combo => combo.type === 'DOC_LAP_MOT_PHA').map((combo) => (
              <ProductItem key={combo.id} item={combo} />
            ))}
          </View>
          
          <Text style={styles.subSectionTitle}>ĐỘC LẬP - BA PHA</Text>
          <View style={styles.productGrid}>
            {sector.list_combos?.filter(combo => combo.type === 'DOC_LAP_BA_PHA').map((combo) => (
              <ProductItem key={combo.id} item={combo} />
            ))}
          </View>
        </View>

        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Hệ Bám tải</Text>
          <Text style={styles.subSectionTitle}>HỆ BÁM TẢI - MỘT PHA</Text>
          <View style={styles.productGrid}>
            {sector.list_combos?.filter(combo => combo.type === 'BAM_TAI_MOT_PHA').map((combo) => (
              <ProductItem key={combo.id} item={combo} />
            ))}
          </View>
          
          <Text style={styles.subSectionTitle}>HỆ BÁM TẢI - BA PHA</Text>
          <View style={styles.productGrid}>
            {sector.list_combos?.filter(combo => combo.type === 'BAM_TAI_BA_PHA').map((combo) => (
              <ProductItem key={combo.id} item={combo} />
            ))}
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
    backgroundColor: '#0F974A',
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
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  productGrid: {
    paddingHorizontal: 16,
    gap: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
}); 