import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Clipboard } from 'react-native';
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
          calculateTotalPower(parsedProducts);
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
                <div class="label">Mã khách hàng:</div>
                <div class="value">${customerCode || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Người lập báo giá:</div>
                <div class="value">${agentName}</div>
              </div>
              <div class="info-row">
                <div class="label">Thời gian lập báo giá:</div>
                <div class="value">${createdTime || currentDate}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">THÔNG TIN KHÁCH HÀNG</div>
              <div class="info-row">
                <div class="label">Họ và tên:</div>
                <div class="value">${customerName || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Số điện thoại:</div>
                <div class="value">${phoneNumber || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Đại lý phụ trách:</div>
                <div class="value">${dealer || '-'}</div>
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

  return (
    <React.Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Thanh tiêu đề */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#7B7D9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>

        {/* Nội dung thông báo thành công */}
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Báo giá đã được tạo thành công!</Text>
          <Text style={styles.successDescription}>
            Vui lòng kiểm tra thông tin tóm tắt của báo giá bên dưới. Bạn có thể tải về bản báo giá dưới dạng PDF để gửi đến khách hàng bằng cách nhấn vào nút "BÁO GIÁ KHẢO SÁT" hoặc "BÁO GIÁ CHI TIẾT".
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
                <View style={styles.customerCodeContainer}>
                  <Text style={styles.infoValue}>{customerCode || '-'}</Text>
                  {customerCode && (
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={handleCopyCustomerCode}
                    >
                      <Ionicons name="copy-outline" size={16} color="#7B7D9D" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Người lập báo giá</Text>
                <Text style={styles.infoValue}>{displayAgentName()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Thời gian lập báo giá</Text>
                <Text style={styles.infoValue}>{createdTime || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Thông tin khách hàng */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
              <TouchableOpacity onPress={() => setIsDrawerVisible(true)}>
                <Text style={styles.updateButton}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{customerName || '-'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{phoneNumber || '-'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Đại lý phụ trách</Text>
                <Text style={styles.infoValue}>{dealer || '-'}</Text>
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
            <Text style={styles.sectionTitle}>DANH MỤC THIẾT BỊ</Text>
            
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

        {/* Nút tải xuống báo giá */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.downloadButton, styles.surveyButton]}
              onPress={handleDownloadQuotation}
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
}); 