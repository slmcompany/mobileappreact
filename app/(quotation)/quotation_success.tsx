import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Clipboard, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import CustomerInfoDrawer from './components/CustomerInfoDrawer';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong báo giá
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  warranty_years?: string | number;
  category?: 'PANEL' | 'INVERTER' | 'BATTERY' | 'ACCESSORY';
  description?: string;
  specs?: Record<string, string | number>;
}

// Cập nhật kiểu dữ liệu cho data_json
type MerchandiseDataJson = {
  power_watt?: string;
  width_mm?: string;
  height_mm?: string;
  thickness_mm?: string;
  area_m2?: string;
  weight_kg?: string;
  technology?: string;
  warranty_years?: string;
  price_vnd?: string;
  ac_power_kw?: number;
  dc_max_power_kw?: number;
  installation_type?: string;
  phase_type?: string;
  brand_ranking?: number;
  storage_capacity_kwh?: string;
};

// Cập nhật kiểu dữ liệu cho PreQuoteMerchandiseItem
type PreQuoteMerchandiseItem = {
  id: number;
  merchandise_id: number;
  quantity: number;
  pre_quote_id: number;
  note: string | null;
  price: number;
  warranty_years: number;
  imageUrl?: string;
  merchandise: {
    id: number;
    supplier_id: number | null;
    name: string;
    unit: string;
    data_json: MerchandiseDataJson;
    active: boolean;
    template_id: number;
    brand_id: number;
    code: string;
    data_sheet_link: string;
    description_in_contract: string;
    created_at: string;
  };
};

// Thêm kiểu dữ liệu mới
type GroupedMerchandise = {
  template: {
    id: number;
    sector_id: number;
    gm: number;
    code: string;
    name: string;
    structure_json: any | null;
    is_main: boolean;
  };
  pre_quote_merchandises: PreQuoteMerchandiseItem[];
  price_on_gm: number;
};

interface Merchandise {
  id: number;
  supplier_id: number | null;
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
  images?: Array<{ link: string }>;
}

interface PanelItem {
  specs: {
    power_watt?: string | number;
    technology?: string;
    warranty_years?: string | number;
  };
  quantity: number;
  name: string;
  power: string;
  technology: string;
  warranty: string;
  id: number;
  merchandise_id: number;
  pre_quote_id: number;
  note: string | null;
  price: number;
  unit: string;
  imageUrl?: string;
  warranty_years?: string | number;
  merchandise: Merchandise;
}

interface InverterItem {
  specs: {
    ac_power_kw?: string | number;
    dc_max_power_kw?: string | number;
    warranty_years?: string | number;
  };
  quantity: number;
  name: string;
  ac_power: string;
  dc_power: string;
  warranty: string;
  id: number;
  merchandise_id: number;
  pre_quote_id: number;
  note: string | null;
  price: number;
  unit: string;
  imageUrl?: string;
  warranty_years?: string | number;
  merchandise: Merchandise;
}

interface BatteryItem {
  specs: {
    storage_capacity_kwh?: string | number;
    technology?: string;
    warranty_years?: string | number;
  };
  quantity: number;
  name: string;
  capacity: string;
  technology: string;
  warranty: string;
  id: number;
  merchandise_id: number;
  pre_quote_id: number;
  note: string | null;
  price: number;
  unit: string;
  imageUrl?: string;
  warranty_years?: string | number;
  merchandise: Merchandise;
}

const { width: screenWidth } = Dimensions.get('window');
const itemImageSize = screenWidth / 4;

export default function QuotationSuccess() {
  // Lấy thông tin từ params
  const params = useLocalSearchParams();
  const customerCode = params.customerId as string;
  const createdTime = params.createdTime as string;
  const phoneNumber = params.phoneNumber as string;
  const systemType = params.systemType as string || 'HYBRID';
  const phaseType = params.phaseType as string || 'ONE_PHASE';
  const totalPriceParam = params.totalPrice as string || '0';
  const installationType = params.installationType as string || 'AP_MAI';
  const isNewCustomer = params.isNewCustomer === 'true';
  
  // State cho danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(totalPriceParam !== '0' ? totalPriceParam : '0');
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [dealer, setDealer] = useState<string | null>(null);
  
  // State cho thông tin người lập báo giá
  const [agentName, setAgentName] = useState<string | null>(null);
  
  // Tính tổng công suất từ danh sách tấm pin
  const [totalPower, setTotalPower] = useState('');

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Thêm state để lưu danh sách template
  const [groupedMerchandises, setGroupedMerchandises] = useState<GroupedMerchandise[]>([]);

  // Khai báo refs trong component
  const scrollViewRef = React.useRef<ScrollView>(null);
  const headerRef = React.useRef<View>(null);
  const successContainerRef = React.useRef<View>(null);
  const sectionContainerRef = React.useRef<View>(null);
  const equipmentListRef = React.useRef<View>(null);
  const equipmentListDuplicateRef = React.useRef<View>(null);
  const taxAndHotlineRef = React.useRef<View>(null);
  const companyInfoRef = React.useRef<View>(null);
  const socialContainerRef = React.useRef<View>(null);

  // Hàm lấy dữ liệu sản phẩm và thông tin người dùng từ AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Bắt đầu lấy dữ liệu cho trang Success...');
        
        // Lấy thông tin người lập báo giá từ AsyncStorage
        const userDataString = await AsyncStorage.getItem('@slm_user_data');
        
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            
            const userCode = userData.code || '';
            const userName = userData.name || '';
            
            if (userName) {
              const formattedName = `${userCode} ${userName}`;
              setAgentName(formattedName);
              
              // Thử lấy thông tin mới nhất của người dùng từ API
              if (userData.id) {
                fetchLatestUserData(userData.id);
              }
            } else {
              setAgentName(params.agentName as string || null);
            }
          } catch (parseError) {
            console.error('Lỗi khi parse userData:', parseError);
            setAgentName(params.agentName as string || null);
          }
        } else {
          // Thử lấy dữ liệu từ API trước khi dùng params
          try {
            const token = await AsyncStorage.getItem('@slm_token');
            const response = await fetch('https://api.slmglobal.vn/api/auth/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData && userData.name) {
                const userCode = userData.code || '';
                const userName = userData.name || '';
                const formattedName = `${userCode} ${userName}`;
                setAgentName(formattedName);
                
                // Lưu vào AsyncStorage cho lần sau
                await AsyncStorage.setItem('@slm_user_data', JSON.stringify(userData));
              } else {
                setAgentName(params.agentName as string || null);
              }
            } else {
              setAgentName(params.agentName as string || null);
            }
          } catch (apiError) {
            console.error('Lỗi khi gọi API lấy thông tin người dùng:', apiError);
            setAgentName(params.agentName as string || null);
          }
        }
        
        // Lấy danh sách sản phẩm từ AsyncStorage
        const productsData = await AsyncStorage.getItem('quotationProducts');
        if (productsData) {
          const parsedProducts = JSON.parse(productsData);
          setProducts(parsedProducts);
          
          // Tính tổng công suất từ các tấm pin
          calculateTotalPower();
        }
        
        // Lấy tổng giá trị đơn hàng nếu chưa có
        if (totalPriceParam === '0') {
          const totalPriceData = await AsyncStorage.getItem('quotationTotalPrice');
          if (totalPriceData) {
            setTotalPrice(totalPriceData);
          }
        }
        
        // Chỉ lấy thông tin khách hàng nếu có mã khách hàng và không phải khách hàng mới
        if (customerCode && !isNewCustomer) {
          try {
            const customerData = await AsyncStorage.getItem('customerData');
            if (customerData) {
              const parsedCustomerData = JSON.parse(customerData);
              // Kiểm tra thêm điều kiện mã khách hàng phải khớp
              if (parsedCustomerData.assumed_code === customerCode) {
                if (parsedCustomerData.name) {
                  setCustomerName(parsedCustomerData.name);
                }
                if (parsedCustomerData.agent_id) {
                  setDealer(`SLM${parsedCustomerData.agent_id}`);
                }
              } else {
                // Nếu mã khách hàng không khớp, xóa dữ liệu cũ
                await AsyncStorage.removeItem('customerData');
                setCustomerName(null);
                setDealer(null);
              }
            }
          } catch (error) {
            console.error('Lỗi khi xử lý thông tin khách hàng:', error);
            setCustomerName(null);
            setDealer(null);
          }
        } else {
          // Nếu không có mã khách hàng hoặc là khách hàng mới, đảm bảo không có dữ liệu khách hàng
          setCustomerName(null);
          setDealer(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Thêm useEffect để fetch combo data
  useEffect(() => {
    const fetchComboData = async () => {
      try {
        const response = await fetch('https://api.slmglobal.vn/api/sector');
        if (response.ok) {
          const data = await response.json();
          // Tìm combo đầu tiên có grouped_merchandises
          const firstComboWithGroups = data
            .flatMap((sector: any) => sector.list_combos || [])
            .find((combo: any) => combo.grouped_merchandises?.length > 0);
          
          if (firstComboWithGroups?.grouped_merchandises) {
            setGroupedMerchandises(firstComboWithGroups.grouped_merchandises);
          }
        }
      } catch (error) {
        console.error('Error fetching combo data:', error);
      }
    };

    fetchComboData();
  }, []);

  // Hàm tính tổng công suất từ tấm pin
  const calculateTotalPower = () => {
    if (!groupedMerchandises.length) return 'N/A';
    
    const panelGroup = groupedMerchandises.find(group => group.template.code === 'PIN_PV');
    if (!panelGroup) return 'N/A';
    
    let totalWatts = 0;
    panelGroup.pre_quote_merchandises.forEach(item => {
      const powerWatt = item.merchandise.data_json?.power_watt;
      if (powerWatt) {
        const watts = typeof powerWatt === 'string' ? 
          parseInt(powerWatt) : 
          powerWatt;
        totalWatts += watts * item.quantity;
      }
    });
    
    if (totalWatts > 0) {
      const kW = totalWatts / 1000;
      return `${kW.toFixed(2)}kW`;
    }
    
    return 'N/A';
  };

  // Cập nhật useEffect để theo dõi thay đổi của groupedMerchandises
  useEffect(() => {
    const power = calculateTotalPower();
    setTotalPower(power);
  }, [groupedMerchandises]);

  // Hàm định dạng giá tiền
  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Làm tròn đến hàng nghìn
    const roundedPrice = Math.round(numericPrice / 1000) * 1000;
    return roundedPrice.toLocaleString('vi-VN') + ' VND';
  };

  // Sửa lại hàm handleDownloadQuotation
  const handleDownloadQuotation = async () => {
    try {
      Alert.alert(
        'Thông báo', 
        'Tính năng chụp ảnh báo giá đã bị vô hiệu hóa trong phiên bản này.'
      );
    } catch (error) {
      console.error('Lỗi:', error);
      Alert.alert(
        'Lỗi', 
        'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      );
    }
  };

  // Lọc sản phẩm theo loại
  const getPanels = (): PanelItem[] => {
    if (!groupedMerchandises.length) return [];
    const panelGroup = groupedMerchandises.find(group => group.template.code === 'PIN_PV');
    if (!panelGroup) return [];
    
    return panelGroup.pre_quote_merchandises.map(item => ({
      specs: item.merchandise.data_json || {},
      quantity: item.quantity || 0,
      name: item.merchandise.name || '',
      power: item.merchandise.data_json?.power_watt ? `${item.merchandise.data_json.power_watt}W` : 'N/A',
      technology: item.merchandise.data_json?.technology || 'N/A',
      warranty: item.merchandise.data_json?.warranty_years ? `${item.merchandise.data_json.warranty_years} năm` : 'N/A',
      id: item.id,
      merchandise_id: item.merchandise_id,
      pre_quote_id: item.pre_quote_id,
      note: item.note,
      price: item.price,
      unit: item.merchandise.unit || '',
      merchandise: item.merchandise || {
        id: 0,
        supplier_id: null,
        name: '',
        unit: '',
        data_json: {},
        active: false,
        template_id: 0,
        brand_id: 0,
        code: '',
        data_sheet_link: '',
        description_in_contract: '',
        created_at: '',
      },
    }));
  };

  const getInverters = (): InverterItem[] => {
    if (!groupedMerchandises.length) return [];
    const inverterGroup = groupedMerchandises.find(group => group.template.code === 'INVERTER_DC_AC');
    if (!inverterGroup) return [];
    
    return inverterGroup.pre_quote_merchandises.map(item => ({
      specs: item.merchandise.data_json || {},
      quantity: item.quantity || 0,
      name: item.merchandise.name || '',
      ac_power: item.merchandise.data_json?.ac_power_kw ? `${item.merchandise.data_json.ac_power_kw}kW` : 'N/A',
      dc_power: item.merchandise.data_json?.dc_max_power_kw ? `${item.merchandise.data_json.dc_max_power_kw}kW` : 'N/A',
      warranty: item.merchandise.data_json?.warranty_years ? `${item.merchandise.data_json.warranty_years} năm` : 'N/A',
      id: item.id,
      merchandise_id: item.merchandise_id,
      pre_quote_id: item.pre_quote_id,
      note: item.note,
      price: item.price,
      unit: item.merchandise.unit || '',
      merchandise: item.merchandise || {
        id: 0,
        supplier_id: null,
        name: '',
        unit: '',
        data_json: {},
        active: false,
        template_id: 0,
        brand_id: 0,
        code: '',
        data_sheet_link: '',
        description_in_contract: '',
        created_at: '',
      },
    }));
  };

  const getBatteries = (): BatteryItem[] => {
    if (!groupedMerchandises.length) return [];
    const batteryGroup = groupedMerchandises.find(group => group.template.code === 'BATTERY_STORAGE');
    if (!batteryGroup) return [];
    
    return batteryGroup.pre_quote_merchandises.map(item => ({
      specs: item.merchandise.data_json || {},
      quantity: item.quantity || 0,
      name: item.merchandise.name || '',
      capacity: item.merchandise.data_json?.storage_capacity_kwh ? `${item.merchandise.data_json.storage_capacity_kwh}kWh` : 'N/A',
      technology: item.merchandise.data_json?.technology || 'N/A',
      warranty: item.merchandise.data_json?.warranty_years ? `${item.merchandise.data_json.warranty_years} năm` : 'N/A',
      id: item.id,
      merchandise_id: item.merchandise_id,
      pre_quote_id: item.pre_quote_id,
      note: item.note,
      price: item.price,
      unit: item.merchandise.unit || '',
      merchandise: item.merchandise || {
        id: 0,
        supplier_id: null,
        name: '',
        unit: '',
        data_json: {},
        active: false,
        template_id: 0,
        brand_id: 0,
        code: '',
        data_sheet_link: '',
        description_in_contract: '',
        created_at: '',
      },
    }));
  };

  const getAccessories = () => products.filter(p => p.category === 'ACCESSORY' || !p.category);
  
  // Định dạng tên hiển thị cho sản phẩm
  const formatProductName = (product: Product): string => {
    if (product.description) {
      return product.description;
    }
    return product.name;
  };

  // Định dạng số lượng hiển thị
  const formatQuantity = (product: Product): string => {
    if (product.category === 'PANEL') {
      return `${product.quantity} Tấm`;
    } else if (product.category === 'INVERTER') {
      return `${product.quantity.toString().padStart(2, '0')} Bộ`;
    } else if (product.category === 'BATTERY') {
      return `${product.quantity.toString().padStart(2, '0')} Bộ`;
    } else {
      return `${product.quantity.toString().padStart(2, '0')} Bộ`;
    }
  };

  // Hàm lấy thông tin mới nhất của người dùng từ API
  const fetchLatestUserData = async (userId: string | number) => {
    if (!userId) {
      console.log('Không có userId, bỏ qua việc gọi API');
      return;
    }
    
    try {
      // Thử lấy thông tin từ API auth/me trước
      const token = await AsyncStorage.getItem('@slm_token');
      if (!token) {
        console.log('Không có token, bỏ qua việc gọi API');
        return;
      }

      const meResponse = await fetch('https://api.slmglobal.vn/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        if (meData && meData.name) {
          // Cập nhật thông tin người dùng trong AsyncStorage
          await AsyncStorage.setItem('@slm_user_data', JSON.stringify(meData));
          
          // Cập nhật hiển thị
          const userCode = meData.code || '';
          const userName = meData.name || '';
          setAgentName(`${userCode} ${userName}`);
          console.log('Đã cập nhật thông tin người lập báo giá từ API auth/me');
        }
      } else {
        console.log('API auth/me không thành công, sử dụng dữ liệu từ AsyncStorage');
      }
    } catch (error) {
      console.log('Có lỗi khi gọi API, sử dụng dữ liệu từ AsyncStorage');
    }
  };

  // Hàm hiển thị thông tin người lập báo giá với xử lý dự phòng
  const displayAgentName = () => {
    if (agentName) {
      // Đảm bảo ký tự • được xử lý đúng
      if (agentName.includes('•')) {
        const parts = agentName.split('•');
        return (
          <>
            {parts[0].trim()}<Text> • </Text>{parts[1].trim()}
          </>
        );
      }
      return agentName;
    }
    
    // Hiển thị từ params nếu có
    if (params.agentName) {
      const agentNameStr = params.agentName as string;
      if (agentNameStr.includes('•')) {
        const parts = agentNameStr.split('•');
        return (
          <>
            {parts[0].trim()}<Text> • </Text>{parts[1].trim()}
          </>
        );
      }
      return agentNameStr;
    }
    
    // Hiển thị giá trị mặc định nếu không có thông tin
    return 'Không xác định';
  };

  // Hàm xử lý copy mã khách hàng
  const handleCopyCustomerCode = async () => {
    if (customerCode) {
      await Clipboard.setString(customerCode);
      Alert.alert('Thông báo', 'Đã sao chép mã khách hàng');
    }
  };

  const handleUpdateCustomerInfo = (data: { name: string; phone: string; dealer: string }) => {
    setCustomerName(data.name);
    setDealer(data.dealer);
    // Note: phoneNumber is from params, so we can't update it directly
    // You might want to update it in your backend or state management
  };

  const formatPaybackPeriod = (years: number | undefined): string => {
    if (!years) return 'N/A';
    return `${years} năm`;
  };

  const getPowerFromName = (name: string) => {
    const match = name.match(/(\d+(?:\.\d+)?)\s*(?:kW|kWh)/i);
    return match ? match[1] : 'N/A';
  };

  const formatPowerOutput = (combo: any): string => {
    if (!combo) return 'N/A';
    const power = getPowerFromName(combo.name);
    return power ? `${power}kW` : 'N/A';
  };

  const getPhaseType = (combo: any) => {
    if (!combo) return 'N/A';
    const name = combo.name.toLowerCase();
    if (name.includes('1 pha') || name.includes('1pha')) return '1 PHA';
    if (name.includes('3 pha') || name.includes('3pha')) return '3 PHA';
    return 'N/A';
  };

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Thanh tiêu đề */}
        <View ref={headerRef} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#7B7D9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Nội dung thông báo thành công */}
            <View ref={successContainerRef} style={styles.successContainer}>
              <Text style={styles.successTitle}>Báo giá đã được tạo thành công!</Text>
              <Text style={styles.successDescription}>
                Vui lòng kiểm tra thông tin tóm tắt của báo giá bên dưới. Bạn có thể tải về bản báo giá dưới dạng PDF để gửi đến khách hàng bằng cách nhấn vào nút "BÁO GIÁ KHẢO SÁT" hoặc "BÁO GIÁ CHI TIẾT".
              </Text>
            </View>

            {/* Thông tin sản phẩm */}
            <View ref={sectionContainerRef} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>THÔNG TIN SẢN PHẨM</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Sản phẩm</Text>
                  <Text style={styles.infoValue}>HỆ THỐNG ĐIỆN NLMT SOLARMAX</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Phân loại</Text>
                  <Text style={styles.infoValue}>
                    {systemType === 'HYBRID' ? 'HYBRID' : 'BÁM TẢI'}{' '}
                    <Text>•</Text>{' '}
                    {phaseType === 'ONE_PHASE' ? 'MỘT PHA' : 'BA PHA'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Công suất</Text>
                  <Text style={styles.infoValue}>{totalPower}</Text>
                </View>
                <View style={styles.infoItem}>
                  <View>
                    <Text style={styles.infoLabel}>Giá trị đơn hàng</Text>
                    <Text style={styles.infoSubLabel}>(Bao gồm VAT)</Text>
                  </View>
                  <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
                </View>
              </View>
            </View>

            {/* Equipment List with Images */}
            <View ref={equipmentListRef} style={styles.equipmentList}>
              {(() => {
                let itemNumber = 1;
                return (
                  <>
                    {/* Tấm quang năng */}
                    {getPanels().length > 0 && getPanels()[0] && (
                      <View style={styles.equipmentCard}>
                        <View style={styles.itemRow}>
                          <View style={styles.imageContainer}>
                            {getPanels()[0].warranty_years && (
                              <View style={styles.warrantyTag}>
                                <Text style={styles.warrantyText}>
                                  Bảo hành {getPanels()[0].warranty}
                                </Text>
                              </View>
                            )}
                            <Image 
                              source={getPanels()[0]?.merchandise?.images?.[0]?.link ? 
                                { uri: getPanels()[0]?.merchandise?.images?.[0]?.link } : 
                                require('@/assets/images/replace-holder.png')}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          </View>
                          <View style={styles.itemContent}>
                            <Text style={styles.itemName}>{getPanels()[0].name}</Text>
                            <View style={styles.productDetails}>
                              {getPanels()[0] && (
                                <>
                                  <Text style={styles.productDetail}>
                                    Công suất: {getPanels()[0].power}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Công nghệ: {getPanels()[0].technology}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Bảo hành: {getPanels()[0].warranty}
                                  </Text>
                                </>
                              )}
                            </View>
                            <View style={styles.priceContainer}>
                              <Text style={styles.productPrice}>
                                {getPanels()[0].price ? formatPrice(getPanels()[0].price) : '0 VND'}
                              </Text>
                              <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>Số lượng</Text>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityValue}>
                                    {getPanels()[0].quantity}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Biến tần */}
                    {getInverters().length > 0 && getInverters()[0] && (
                      <View style={styles.equipmentCard}>
                        <View style={styles.itemRow}>
                          <View style={styles.imageContainer}>
                            {getInverters()[0].warranty_years && (
                              <View style={styles.warrantyTag}>
                                <Text style={styles.warrantyText}>
                                  Bảo hành {getInverters()[0].warranty}
                                </Text>
                              </View>
                            )}
                            <Image 
                              source={getInverters()[0]?.merchandise?.images?.[0]?.link ? 
                                { uri: getInverters()[0]?.merchandise?.images?.[0]?.link } : 
                                require('@/assets/images/replace-holder.png')}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          </View>
                          <View style={styles.itemContent}>
                            <Text style={styles.itemName}>{getInverters()[0].name}</Text>
                            <View style={styles.productDetails}>
                              {getInverters()[0] && (
                                <>
                                  <Text style={styles.productDetail}>
                                    Công suất AC: {getInverters()[0].ac_power}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Đầu vào DC Max: {getInverters()[0].dc_power}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Bảo hành: {getInverters()[0].warranty}
                                  </Text>
                                </>
                              )}
                            </View>
                            <View style={styles.priceContainer}>
                              <Text style={styles.productPrice}>
                                {getInverters()[0].price ? formatPrice(getInverters()[0].price) : '0 VND'}
                              </Text>
                              <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>Số lượng</Text>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityValue}>
                                    {getInverters()[0].quantity}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Pin lưu trữ */}
                    {getBatteries().length > 0 && getBatteries()[0] && (
                      <View style={styles.equipmentCard}>
                        <View style={styles.itemRow}>
                          <View style={styles.imageContainer}>
                            {getBatteries()[0].warranty_years && (
                              <View style={styles.warrantyTag}>
                                <Text style={styles.warrantyText}>
                                  Bảo hành {getBatteries()[0].warranty}
                                </Text>
                              </View>
                            )}
                            <Image 
                              source={getBatteries()[0]?.merchandise?.images?.[0]?.link ? 
                                { uri: getBatteries()[0]?.merchandise?.images?.[0]?.link } : 
                                require('@/assets/images/replace-holder.png')}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          </View>
                          <View style={styles.itemContent}>
                            <Text style={styles.itemName}>{getBatteries()[0].name}</Text>
                            <View style={styles.productDetails}>
                              {getBatteries()[0] && (
                                <>
                                  <Text style={styles.productDetail}>
                                    Dung lượng: {getBatteries()[0].capacity}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Công nghệ: {getBatteries()[0].technology}
                                  </Text>
                                  <Text style={styles.productDetail}>
                                    Bảo hành: {getBatteries()[0].warranty}
                                  </Text>
                                </>
                              )}
                            </View>
                            <View style={styles.priceContainer}>
                              <Text style={styles.productPrice}>
                                {getBatteries()[0].price ? formatPrice(getBatteries()[0].price) : '0 VND'}
                              </Text>
                              <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>Số lượng</Text>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityValue}>
                                    {getBatteries()[0].quantity}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>

            {/* Chi tiết báo giá */}
            <View ref={equipmentListDuplicateRef} style={styles.equipmentListDuplicate}>
              <Text style={[styles.sectionTitle, { textAlign: 'center', fontSize: 14, fontWeight: '700', marginBottom: 20 }]}>DANH MỤC THIẾT BỊ</Text>
              
              {groupedMerchandises.map((group, index) => (
                <View key={group.template.id} style={styles.equipmentItem}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemNumber}>{index + 1}</Text>
                    <Text style={[styles.itemName, { flex: 1 }]}>{group.template.name.toUpperCase()}</Text>
                    <Text style={[styles.itemQuantity]}>
                      {group.template.code === 'PIN_PV' && getPanels().length > 0 ? 
                        `${getPanels()[0].quantity} ${getPanels()[0].unit || 'Tấm'}` :
                      group.template.code === 'INVERTER_DC_AC' && getInverters().length > 0 ?
                        `${getInverters()[0].quantity} ${getInverters()[0].unit || 'Bộ'}` :
                      group.template.code === 'BATTERY_STORAGE' && getBatteries().length > 0 ?
                        `${getBatteries()[0].quantity} ${getBatteries()[0].unit || 'Bộ'}` :
                        '1 Bộ'
                      }
                    </Text>
                  </View>
                </View>
              ))}

              {/* Hình thức lắp đặt luôn ở cuối */}
              <View style={styles.equipmentItem}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemNumber}>{groupedMerchandises.length + 1}</Text>
                  <Text style={[styles.itemName, { flex: 1 }]}>
                    {installationType === 'AP_MAI' ? 'HÌNH THỨC LẮP ĐẶT ÁP MÁI' : 'HÌNH THỨC LẮP ĐẶT KHUNG SẮT'}
                  </Text>
                  <Text style={[styles.itemQuantity]}>1 Bộ</Text>
                </View>
              </View>
            </View>

            {/* Tax Info and Hotline */}
            <View ref={taxAndHotlineRef} style={styles.taxAndHotlineContainer}>
              <View style={styles.taxInfoContainer}>
                <Text style={styles.taxInfoText}>Giá đã bao gồm thuế. Phí vận chuyển và các chi phí</Text>
                <Text style={styles.taxInfoText}>khác (nếu có) sẽ được thông báo tới quý khách hàng</Text>
                <Text style={styles.taxInfoText}>thông qua nhân viên tư vấn.</Text>
              </View>
              <TouchableOpacity style={styles.phoneButton}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.phoneNumber}>0969 66 33 87</Text>
              </TouchableOpacity>
            </View>

            {/* Company Info */}
            <View ref={companyInfoRef} style={styles.companyInfo}>
              <View style={styles.companyInfoRow}>
                <View style={styles.companyDetails}>
                  <Text style={styles.companyName}>CÔNG TY CỔ PHẦN ĐẦU TƯ SLM</Text>
                  <View style={styles.addressContainer}>
                    <Text style={styles.companyAddress}>Tầng 5, Tòa nhà Diamond Flower Tower</Text>
                    <Text style={styles.companyAddress}>Số 01, Đ. Hoàng Đạo Thúy, P. Nhân Chính</Text>
                    <Text style={styles.companyAddress}>Quận Thanh Xuân, Hà Nội</Text>
                  </View>
                </View>
                <Image 
                  source={require('@/assets/images/qr-bank.png')}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Website and Social Media */}
            <View ref={socialContainerRef} style={styles.socialContainer}>
              <View style={styles.websiteRow}>
                <Ionicons name="globe-outline" size={12} color="#fff" />
                <Text style={styles.socialText}>www.slmsolar.com</Text>
              </View>
              <View style={styles.socialRow}>
                <View style={styles.socialIconsGroup}>
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-facebook" size={8} color="#7B7D9D" />
                  </View>
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-youtube" size={8} color="#7B7D9D" />
                  </View>
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-tiktok" size={8} color="#7B7D9D" />
                  </View>
                </View>
                <Text style={styles.socialText}>@solarmax87</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom action - Hiển thị chi tiết giá nếu có khung sắt */}
          <View style={styles.bottomContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.downloadButton, styles.surveyButton]}
                // onPress={handleDownloadQuotation}
              >
                <Ionicons name="document-text-outline" size={18} color="#27273E" />
                <Text style={styles.surveyButtonText}>BÁO GIÁ KHẢO SÁT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.downloadButton, styles.detailButton]}
                onPress={handleDownloadQuotation}
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.detailButtonText}>BÁO GIÁ CHI TIẾT</Text>
              </TouchableOpacity>
            </View>
          </View>

          <CustomerInfoDrawer
            visible={isDrawerVisible}
            onClose={() => setIsDrawerVisible(false)}
            customerName={customerName}
            phoneNumber={phoneNumber}
            dealer={dealer}
            onSave={handleUpdateCustomerInfo}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
    minHeight: '100%',
  },
  successContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#27273E',
    lineHeight: 32,
    marginBottom: 24,
  },
  successDescription: {
    fontSize: 14,
    color: '#7B7D9D',
    lineHeight: 20,
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
    marginBottom: 16,
    textAlign: 'left',
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
  equipmentListDuplicate: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  equipmentItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCE6',
    paddingVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNumber: {
    width: 24,
    fontSize: 14,
    color: '#091E42',
    textAlign: 'center',
  },
  itemName: {
    fontSize: 14,
    color: '#091E42',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#091E42',
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F8',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 60,
    textAlign: 'right',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 6,
  },
  surveyButton: {
    backgroundColor: '#F5F5F8',
    borderWidth: 1,
    borderColor: '#DCDCE6',
  },
  detailButton: {
    backgroundColor: '#ED1C24',
  },
  surveyButtonText: {
    color: '#27273E',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  customerCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 4,
  },
  taxAndHotlineContainer: {
    backgroundColor: '#F5F5F8',
    padding: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  taxInfoContainer: {
    flex: 1,
  },
  taxInfoText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#7B7D9D',
  },
  phoneButton: {
    backgroundColor: '#ED1C24',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 8,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  companyInfo: {
    padding: 16,
    backgroundColor: '#DCDCE6',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  companyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyDetails: {
    flex: 1,
    marginRight: 16,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27273E',
    marginBottom: 8,
  },
  addressContainer: {
    gap: 2,
  },
  companyAddress: {
    fontSize: 12,
    color: '#27273E',
    lineHeight: 16,
  },
  qrCode: {
    width: 120,
    height: 120,
    borderRadius: 4,
    maxHeight: 120,
  },
  socialContainer: {
    backgroundColor: '#27273E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 16,
    gap: 14,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  socialIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialIconBox: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 16,
  },
  equipmentList: {
    padding: 16,
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  warrantyTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#ED1C24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  warrantyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  itemImage: {
    width: itemImageSize,
    height: itemImageSize,
    borderRadius: 4,
    backgroundColor: '#F5F5F8',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 8,
    lineHeight: 12,
    color: '#7B7D9D',
  },
  quantityBadge: {
    backgroundColor: '#7B7D9D',
    paddingHorizontal: 6,
    height: 16,
    minWidth: 16,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 8,
    lineHeight: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
}); 