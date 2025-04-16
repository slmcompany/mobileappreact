import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Clipboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import CustomerInfoDrawer from './components/CustomerInfoDrawer';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong báo giá
type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: 'PANEL' | 'INVERTER' | 'BATTERY' | 'ACCESSORY';
  unit?: string;
};

// Định nghĩa kiểu dữ liệu cho API response
type PreQuoteMerchandiseItem = {
  merchandise_id: number;
  pre_quote_id: number;
  quantity: number;
  gm: number;
  id: number;
  note: string | null;
  price: number;
  warranty_years: number;
  price_on_gm?: number;
  merchandise: {
    unit: string;
    template_id: number;
    description_in_contract: string;
    id: number;
    data_json: Record<string, any>;
    brand_id: number;
    created_at: string;
    supplier_id: number | null;
    active: boolean;
    code: string;
    description_in_quotation: string;
    name: string;
    data_sheet_link: string;
    template: {
      id: number;
      sector_id: number;
      gm: number;
      code: string;
      name: string;
      structure_json: any | null;
      is_main: boolean;
    };
    brand: {
      image: string | null;
      code: string;
      name: string;
      id: number;
      description: string | null;
    };
    images?: Array<{
      id: number;
      merchandise_id: number;
      link: string;
    }>;
  };
};

// Định nghĩa kiểu dữ liệu cho nhóm sản phẩm
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
};

// Định nghĩa kiểu dữ liệu cho dữ liệu hợp đồng
type ContractData = {
  customer_id: number;
  output_max: number | null;
  id: number;
  status: string;
  output_min: number | null;
  name: string;
  image: string;
  description: string | null;
  sector: string;
  created_at: string;
  best_selling: boolean | null;
  total_price: number;
  buyer_id: number;
  installation_type: string;
  potential_customer_id: number | null;
  code: string;
  kind: string;
  phase_type: string | null;
  customer: {
    name: string;
    id: number;
    description: string | null;
    created_at: string;
    citizen_id: string | null;
    province: string;
    ward: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    user_id: number;
    tax_code: string;
    district: string;
    gender: boolean;
  };
  pre_quote_merchandises: PreQuoteMerchandiseItem[];
  grouped_merchandises: GroupedMerchandise[];
};

export default function QuotationSuccess() {
  // Lấy thông tin từ params
  const params = useLocalSearchParams();
  const contractId = params.contract_id as string;
  
  // State cho thông tin hợp đồng
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho thông tin hiển thị
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerCode, setCustomerCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [dealer, setDealer] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string>('HYBRID');
  const [phaseType, setPhaseType] = useState<string>('ONE_PHASE');
  const [totalPrice, setTotalPrice] = useState<string>('0');
  const [installationType, setInstallationType] = useState<string>('AP_MAI');
  const [createdTime, setCreatedTime] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('SLM');
  const [brandColor, setBrandColor] = useState<string>('#ED1C24');
  const [sector, setSector] = useState<string>('');
  
  // State cho thông tin người lập báo giá
  const [agentName, setAgentName] = useState<string | null>(null);
  
  // Tính tổng công suất từ danh sách tấm pin
  const [totalPower, setTotalPower] = useState<string>('');

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Hàm lấy dữ liệu từ API
  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) {
        setError('Thiếu mã hợp đồng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Bắt đầu lấy dữ liệu hợp đồng từ API với ID: ${contractId}`);
        
        // Gọi API để lấy dữ liệu hợp đồng
        const response = await fetch(`https://api.slmglobal.vn/api/pre_quote/get_one/${contractId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu hợp đồng từ API');
        }
        
        const data: ContractData = await response.json();
        setContractData(data);
        
        // Cập nhật thông tin từ dữ liệu API
        if (data) {
          // Thông tin khách hàng
          if (data.customer) {
            setCustomerName(data.customer.name);
            setCustomerCode(data.customer.code);
            setPhoneNumber(data.customer.phone);
          }
          
          // Thông tin đại lý phụ trách
          setDealer(`SLM${data.buyer_id}`);
          
          // Thông tin loại hệ thống
          setInstallationType(data.installation_type || 'AP_MAI');
          setPhaseType(data.phase_type || 'ONE_PHASE');
          
          // Thông tin giá và thời gian tạo
          setTotalPrice(data.total_price.toString());
          setCreatedTime(formatDate(data.created_at));
          
          // Cập nhật thông tin sector
          setSector(data.sector || '');
          // Thiết lập brand theo sector
          setBrandBySector(data.sector || '');
          
          // Chuyển đổi dữ liệu merchandise thành dạng Product
          const convertedProducts = convertToProducts(data);
          setProducts(convertedProducts);
          
          // Tính tổng công suất từ các tấm pin
          calculateTotalPower(convertedProducts);
        }
        
        // Lấy thông tin người lập báo giá từ AsyncStorage
        await fetchAgentInfo();
        
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu hợp đồng:', error);
        setError('Không thể tải dữ liệu hợp đồng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId]);

  // Thiết lập brand theo sector
  const setBrandBySector = (sector: string) => {
    switch(sector) {
      case 'SOLAR_PV':
        setBrandName('SOLARMAX');
        setBrandColor('#ED1C24'); // Đỏ
        break;
      case 'HOME_SOLAR':
        setBrandName('HSMAX');
        setBrandColor('#00A651'); // Xanh lá
        break;
      case 'PUMP_SOLAR':
        setBrandName('PUMPMAX');
        setBrandColor('#0072BC'); // Xanh dương
        break;
      case 'SOLAR_LIGHTING':
        setBrandName('LIGHTMAX');
        setBrandColor('#FF7F27'); // Cam
        break;
      default:
        setBrandName('SLM');
        setBrandColor('#ED1C24'); // Đỏ mặc định
        break;
    }
  };

  // Hàm chuyển đổi dữ liệu merchandise từ API thành dạng Product
  const convertToProducts = (data: ContractData): Product[] => {
    const products: Product[] = [];
    
    if (data.grouped_merchandises && data.grouped_merchandises.length > 0) {
      data.grouped_merchandises.forEach(group => {
        // Xác định category dựa trên template code
        let category: 'PANEL' | 'INVERTER' | 'BATTERY' | 'ACCESSORY' | undefined;
        
        switch (group.template.code) {
          case 'PIN_PV':
            category = 'PANEL';
            break;
          case 'INVERTER_DC_AC':
            category = 'INVERTER';
            break;
          case 'BATTERY':
            category = 'BATTERY';
            break;
          default:
            category = 'ACCESSORY';
        }
        
        // Thêm các sản phẩm từ nhóm
        group.pre_quote_merchandises.forEach(item => {
          products.push({
            id: item.id,
            name: item.merchandise.name,
            description: item.merchandise.description_in_quotation || item.merchandise.description_in_contract,
            price: item.price,
            quantity: item.quantity,
            category: category,
            unit: item.merchandise.unit
          });
        });
      });
    }
    
    return products;
  };

  // Hàm lấy thông tin người lập báo giá từ AsyncStorage
  const fetchAgentInfo = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@slm_user_data');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const userCode = userData.code || '';
        const userName = userData.name || '';
        
        if (userName) {
          const formattedName = `${userCode} ${userName}`;
          setAgentName(formattedName);
        }
      } else {
        // Thử lấy dữ liệu từ API nếu không có trong AsyncStorage
        const token = await AsyncStorage.getItem('@slm_token');
        if (token) {
          const response = await fetch('https://api.slmglobal.vn/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
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
            }
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người lập báo giá:', error);
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Hàm tính tổng công suất từ tấm pin
  const calculateTotalPower = (productsList: Product[]) => {
    const panels = productsList.filter(p => p.category === 'PANEL');
    
    if (panels.length === 0) {
      setTotalPower('N/A');
      return;
    }
    
    let totalWatts = 0;
    panels.forEach(panel => {
      // Tìm giá trị công suất từ tên hoặc mô tả
      const nameParts = panel.name.split('|');
      if (nameParts.length > 1) {
        const powerPart = nameParts.find(part => part.trim().includes('W'));
        if (powerPart) {
          const watts = parseInt(powerPart.trim().replace(/[^0-9]/g, '')) || 0;
          totalWatts += watts * panel.quantity;
        }
      } else {
        // Thử tìm số watt trong tên sản phẩm
        const wattMatch = panel.name.match(/(\d+)\s*[wW][pP]?/);
        if (wattMatch) {
          const watts = parseInt(wattMatch[1]) || 0;
          totalWatts += watts * panel.quantity;
        }
      }
    });
    
    if (totalWatts > 0) {
      const kW = totalWatts / 1000;
      setTotalPower(`${kW.toString()}kW`);
    } else {
      setTotalPower('N/A');
    }
  };

  // Hàm định dạng giá tiền
  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Làm tròn đến hàng nghìn
    const roundedPrice = Math.round(numericPrice / 1000) * 1000;
    return roundedPrice.toLocaleString('vi-VN') + ' VND';
  };

  // Tạo HTML cho PDF
  const createPDFHTML = () => {
    // Lấy ngày hiện tại để đặt tên file
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Tạo các phần HTML cho mỗi loại sản phẩm
    const renderProductGroup = (title: string, products: Product[]) => {
      if (products.length === 0) return '';
      
      const productRows = products.map((product, index) => {
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatProductName(product)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatQuantity(product)}</td>
          </tr>
        `;
      }).join('');
      
      return `
        <div style="margin-top: 16px; margin-bottom: 8px;">
          <h3 style="font-size: 14px; color: #7B7D9D; margin-bottom: 8px;">${title}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #7B7D9D;">Tên sản phẩm</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #7B7D9D;">Số lượng</th>
            </tr>
            ${productRows}
          </table>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Báo giá SLM Solar</title>
          <style>
            body {
              font-family: 'Helvetica', Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #27273E;
              font-size: 12px;
            }
            .container {
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #EFEFEF;
              padding-bottom: 20px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 10px;
            }
            h1 {
              color: #ED1C24;
              font-size: 22px;
              margin-bottom: 10px;
            }
            .date {
              color: #7B7D9D;
              font-size: 12px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
              border-bottom: 1px solid #EFEFEF;
              padding-bottom: 20px;
            }
            .section-title {
              font-size: 16px;
              color: #7B7D9D;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .label {
              color: #7B7D9D;
              flex: 1;
            }
            .value {
              color: #27273E;
              font-weight: 500;
              flex: 1;
              text-align: right;
            }
            .total-price {
              color: #ED1C24;
              font-weight: bold;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              color: #7B7D9D;
              margin-top: 30px;
              font-size: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              color: #7B7D9D;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://slmsolar.com/wp-content/uploads/2023/05/logo-solarmax.webp" alt="SLM Solar Logo" class="logo">
              <h1>BÁO GIÁ HỆ THỐNG ĐIỆN NĂNG LƯỢNG MẶT TRỜI</h1>
              <div class="date">Ngày lập báo giá: ${createdTime || currentDate}</div>
            </div>
            
            <div class="section">
              <div class="section-title">THÔNG TIN CHUNG</div>
              <div class="info-row">
                <div class="label">Mã Hợp đồng:</div>
                <div class="value">${customerCode || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Bên bán:</div>
                <div class="value">CÔNG TY CỔ PHẦN ĐẦU TƯ SLM</div>
              </div>
              <div class="info-row">
                <div class="label">Bên mua:</div>
                <div class="value">${customerName || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Đại lý bán hàng:</div>
                <div class="value">${dealer || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Ngày ký:</div>
                <div class="value">${createdTime || currentDate}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">THÔNG TIN SẢN PHẨM</div>
              <div class="info-row">
                <div class="label">Sản phẩm:</div>
                <div class="value">HỆ THỐNG ĐIỆN NLMT SOLARMAX</div>
              </div>
              <div class="info-row">
                <div class="label">Phân loại:</div>
                <div class="value">
                  ${systemType === 'HYBRID' ? 'HYBRID' : 'BÁM TẢI'} • 
                  ${phaseType === 'ONE_PHASE' ? 'MỘT PHA' : 'BA PHA'}
                </div>
              </div>
              <div class="info-row">
                <div class="label">Công suất:</div>
                <div class="value">${totalPower || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Giá trị đơn hàng (bao gồm VAT):</div>
                <div class="value total-price">${formatPrice(totalPrice)}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">CHI TIẾT BÁO GIÁ</div>
              
              ${renderProductGroup('1. TẤM QUANG NĂNG', getPanels())}
              ${renderProductGroup('2. BIẾN TẦN', getInverters())}
              ${renderProductGroup('3. PIN LƯU TRỮ', getBatteries())}
              
              <div style="margin-top: 16px; margin-bottom: 8px;">
                <h3 style="font-size: 14px; color: #7B7D9D; margin-bottom: 8px;">4. HÌNH THỨC LẮP ĐẶT</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <th style="padding: 8px; text-align: left; font-size: 12px; color: #7B7D9D;">Kiểu lắp đặt</th>
                    <th style="padding: 8px; text-align: right; font-size: 12px; color: #7B7D9D;">Số lượng</th>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${installationType === 'AP_MAI' ? 'Áp mái' : 'Khung sắt'}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Trọn gói</td>
                  </tr>
                </table>
              </div>
              
              ${renderProductGroup('5. PHỤ KIỆN, VẬT TƯ', getAccessories())}
            </div>
            
            <div class="footer">
              <p>© SLM Solar - Thương hiệu thuộc Công ty TNHH SLM Việt Nam</p>
              <p>Địa chỉ: 115/5 Phổ Quang, Phường 9, Quận Phú Nhuận, Thành phố Hồ Chí Minh</p>
              <p>Hotline: 1900 232425 | Email: info@slmsolar.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Hàm xử lý tải xuống báo giá
  const handleDownloadQuotation = async () => {
    try {
      // Hiển thị thông báo đang tạo PDF
      Alert.alert('Thông báo', 'Đang tạo file PDF báo giá. Vui lòng đợi trong giây lát...');

      // Tạo HTML cho PDF
      const html = createPDFHTML();
      
      // Tạo file PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      console.log('PDF created at', uri);
      
      // Tạo tên file PDF mới có dấu thời gian
      const fileName = `bao-gia-slm-solar-${Date.now()}.pdf`;
      const newUri = FileSystem.documentDirectory + fileName;
      
      // Sao chép file đến thư mục document để có thể chia sẻ
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });
      
      console.log('PDF copied to', newUri);
      
      // Kiểm tra xem thiết bị có hỗ trợ chia sẻ không
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Chia sẻ file PDF
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Chia sẻ báo giá SLM Solar',
          UTI: 'com.adobe.pdf'
        });
        
        console.log('Sharing PDF completed');
      } else {
        // Nếu không hỗ trợ chia sẻ, thông báo cho người dùng
        Alert.alert(
          'Thông báo', 
          'Thiết bị của bạn không hỗ trợ tính năng chia sẻ file. Vui lòng cập nhật phiên bản mới nhất của ứng dụng.'
        );
      }
      
      // Xóa file tạm sau khi chia sẻ
      await FileSystem.deleteAsync(uri, { idempotent: true });
      
    } catch (error) {
      console.error('Lỗi khi tạo hoặc chia sẻ PDF:', error);
      Alert.alert(
        'Lỗi', 
        'Đã xảy ra lỗi khi tạo hoặc chia sẻ file PDF. Vui lòng thử lại sau.'
      );
    }
  };

  // Lọc sản phẩm theo loại
  const getPanels = () => products.filter(p => p.category === 'PANEL');
  const getInverters = () => products.filter(p => p.category === 'INVERTER');
  const getBatteries = () => products.filter(p => p.category === 'BATTERY');
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

  return (
    <React.Fragment>
      <Stack.Screen options={{ 
        headerShown: true,
        title: "Tóm tắt hợp đồng",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#27273E',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        ),
      }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F8' }} edges={['bottom']}>
        <StatusBar barStyle="dark-content" />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED1C24" />
            <Text style={styles.loadingText}>Đang tải thông tin hợp đồng...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ED1C24" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Logo và Mã hợp đồng */}
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Text style={[styles.logoText, { color: brandColor }]}>{brandName}</Text>
              </View>
              <View style={styles.contractCodeContainer}>
                <Text style={styles.contractCodeValue}>{customerCode || 'N/A'}</Text>
              </View>
            </View>
            
            {/* Thông tin chung */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>THÔNG TIN CHUNG</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Mã Hợp đồng</Text>
                  <Text style={styles.infoValue}>{customerCode || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Bên bán</Text>
                  <Text style={styles.infoValue}>CÔNG TY CỔ PHẦN ĐẦU TƯ SLM</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Bên mua</Text>
                  <Text style={styles.infoValue}>{customerName || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Đại lý bán hàng</Text>
                  <Text style={styles.infoValue}>{dealer || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Ngày ký</Text>
                  <Text style={styles.infoValue}>{createdTime || '-'}</Text>
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
                  <Text style={styles.infoValue}>{totalPower || '-'}</Text>
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

            {/* Chi tiết báo giá */}
            <View style={styles.equipmentListDuplicate}>
              <Text style={styles.sectionTitle}>CHI TIẾT</Text>
              
              {(() => {
                let itemNumber = 1;
                return (
                  <>
                    {/* Tấm quang năng */}
                    {getPanels().length > 0 && (
                      <View style={styles.equipmentItem}>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemNumber}>{itemNumber++}</Text>
                          <Text style={[styles.itemName, { flex: 1 }]}>TẤM QUANG NĂNG</Text>
                          <Text style={[styles.itemQuantity]}>
                            {`${getPanels()[0].quantity} ${getPanels()[0].unit || 'Tấm'}`}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Biến tần */}
                    {getInverters().length > 0 && (
                      <View style={styles.equipmentItem}>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemNumber}>{itemNumber++}</Text>
                          <Text style={[styles.itemName, { flex: 1 }]}>BIẾN TẦN</Text>
                          <Text style={[styles.itemQuantity]}>
                            {`${getInverters()[0].quantity} ${getInverters()[0].unit || 'Bộ'}`}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Pin lưu trữ */}
                    {getBatteries().length > 0 && (
                      <View style={styles.equipmentItem}>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemNumber}>{itemNumber++}</Text>
                          <Text style={[styles.itemName, { flex: 1 }]}>PIN LƯU TRỮ</Text>
                          <Text style={[styles.itemQuantity]}>
                            {`${getBatteries()[0].quantity} ${getBatteries()[0].unit || 'Bộ'}`}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Hình thức lắp đặt */}
                    <View style={styles.equipmentItem}>
                      <View style={styles.itemRow}>
                        <Text style={styles.itemNumber}>{itemNumber++}</Text>
                        <Text style={[styles.itemName, { flex: 1 }]}>
                          {installationType === 'AP_MAI' ? 'HÌNH THỨC LẮP ĐẶT ÁP MÁI' : 'HÌNH THỨC LẮP ĐẶT KHUNG SẮT'}
                        </Text>
                        <Text style={[styles.itemQuantity]}>1 Bộ</Text>
                      </View>
                    </View>

                    {/* Phụ kiện, vật tư */}
                    {getAccessories().length > 0 && (
                      <View style={styles.equipmentItem}>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemNumber}>{itemNumber++}</Text>
                          <Text style={[styles.itemName, { flex: 1 }]}>PHỤ KIỆN, VẬT TƯ</Text>
                          <Text style={[styles.itemQuantity]}>1 Bộ</Text>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          </ScrollView>
        )}

        <CustomerInfoDrawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          customerName={customerName}
          phoneNumber={phoneNumber}
          dealer={dealer}
          onSave={(data) => {
            setCustomerName(data.name);
            setDealer(data.dealer);
            // Note: phoneNumber is from params, so we can't update it directly
            // You might want to update it in your backend or state management
          }}
        />
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
    paddingTop: 0,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractCodeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  contractCodeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B7D9D',
    marginRight: 8,
  },
  contractCodeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27273E',
    marginRight: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
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
    marginTop: 8,
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
    fontSize: 12,
    color: '#091E42',
    textAlign: 'center',
  },
  itemName: {
    fontSize: 12,
    color: '#091E42',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#091E42',
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F8',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 60,
    textAlign: 'right',
  },
  customerCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#7B7D9D',
    fontSize: 14,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ED1C24',
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ED1C24',
    padding: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 