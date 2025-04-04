import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function QuotationSuccess() {
  // Thông tin giả định về báo giá
  const quotationInfo = {
    customerCode: 'DA688',
    agentName: 'SLM01 • Nguyễn Tiến Mạnh',
    createdTime: '14:03 - 25/03/2025',
    customerName: '-',
    phoneNumber: '-',
    dealer: '-',
    productName: 'HỆ THỐNG ĐIỆN NLMT SOLARMAX',
    productCategory: 'HYBRID • MỘT PHA',
    power: '20kW',
    totalPrice: '284.125.000,00 VND',
    panels: [
      { name: 'PV JASolar | 580W | 1 mặt kính', quantity: '10 tấm' },
      { name: 'PV Longi | 580W | 1 mặt kính', quantity: '5 tấm' }
    ],
    inverters: [
      { name: 'Solis Hybrid 5kW | 1 pha', quantity: '01 bộ' }
    ],
    batteries: [
      { name: 'Pin Lithium Dyness | 5kWh | Bản xếp tầng', quantity: '02 cái' }
    ],
    installationType: 'Khung sắt',
    accessories: [
      { name: 'Tủ điện NLMT SolarMax', quantity: '01 bộ' }
    ]
  };

  // Hàm xử lý tải xuống báo giá
  const handleDownloadQuotation = () => {
    console.log('Tải xuống báo giá');
    // Thực hiện logic tải xuống báo giá tại đây
  };

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Thanh tiêu đề */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>

        {/* Nội dung thông báo thành công */}
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Báo giá đã được tạo thành công!</Text>
          <Text style={styles.successDescription}>
            Vui lòng kiểm tra thông tin tóm tắt của báo giá bên dưới. Bạn có thể tải về bản báo giá dưới dạng PDF để gửi đến khách hàng bằng cách nhấn vào nút "TẢI XUỐNG BÁO GIÁ".
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Thông tin chung */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG TIN CHUNG</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mã khách hàng</Text>
                <Text style={styles.infoValue}>{quotationInfo.customerCode}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Người lập báo giá</Text>
                <Text style={styles.infoValue}>{quotationInfo.agentName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Thời gian lập báo giá</Text>
                <Text style={styles.infoValue}>{quotationInfo.createdTime}</Text>
              </View>
            </View>
          </View>

          {/* Thông tin khách hàng */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
              <TouchableOpacity>
                <Text style={styles.updateButton}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{quotationInfo.customerName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{quotationInfo.phoneNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Đại lý phụ trách</Text>
                <Text style={styles.infoValue}>{quotationInfo.dealer}</Text>
              </View>
            </View>
          </View>

          {/* Thông tin sản phẩm */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG TIN SẢN PHẨM</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sản phẩm</Text>
                <Text style={styles.infoValue}>{quotationInfo.productName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phân loại</Text>
                <Text style={styles.infoValue}>{quotationInfo.productCategory}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Công suất</Text>
                <Text style={styles.infoValue}>{quotationInfo.power}</Text>
              </View>
              <View style={styles.infoItem}>
                <View>
                  <Text style={styles.infoLabel}>Giá trị đơn hàng</Text>
                  <Text style={styles.infoSubLabel}>(Bao gồm VAT)</Text>
                </View>
                <Text style={styles.totalPrice}>{quotationInfo.totalPrice}</Text>
              </View>
            </View>
          </View>

          {/* Chi tiết báo giá */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CHI TIẾT BÁO GIÁ</Text>
            </View>
            <View style={styles.detailContent}>
              {/* Tấm quang năng */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>1. TẤM QUANG NĂNG</Text>
                  <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                </View>
                {quotationInfo.panels.map((panel, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailValue}>{panel.name}</Text>
                    <Text style={styles.detailValue}>{panel.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Biến tần */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>2. BIẾN TẦN</Text>
                </View>
                {quotationInfo.inverters.map((inverter, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailValue}>{inverter.name}</Text>
                    <Text style={styles.detailValue}>{inverter.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Pin lưu trữ */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>3. PIN LƯU TRỮ</Text>
                </View>
                {quotationInfo.batteries.map((battery, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailValue}>{battery.name}</Text>
                    <Text style={styles.detailValue}>{battery.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Hình thức lắp đặt */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>4. HÌNH THỨC LẮP ĐẶT</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{quotationInfo.installationType}</Text>
                  <Text style={styles.detailValue}>Trọn gói</Text>
                </View>
              </View>

              {/* Phụ kiện, vật tư */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>5. PHỤ KIỆN, VẬT TƯ</Text>
                </View>
                {quotationInfo.accessories.map((accessory, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailValue}>{accessory.name}</Text>
                    <Text style={styles.detailValue}>{accessory.quantity}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Thanh chỉ số ở dưới */}
        <View style={styles.indicator}>
          <View style={styles.indicatorLine} />
        </View>
        
        {/* Nút tải xuống báo giá */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadQuotation}
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>TẢI XUỐNG BÁO GIÁ</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  successContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#27273E',
    lineHeight: 32,
  },
  successDescription: {
    fontSize: 14,
    color: '#7B7D9D',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
  },
  updateButton: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ED1C24',
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  infoSubLabel: {
    fontSize: 10,
    color: '#7B7D9D',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
    textAlign: 'right',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED1C24',
    textAlign: 'right',
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ED1C24',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 