import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong báo giá
type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: 'PANEL' | 'INVERTER' | 'BATTERY' | 'ACCESSORY';
};

export default function QuotationSuccess() {
  // Lấy thông tin từ params
  const params = useLocalSearchParams();
  const customerCode = params.customerId as string || '';
  const createdTime = params.createdTime as string || '';
  const phoneNumber = params.phoneNumber as string || '';
  const systemType = params.systemType as string || 'HYBRID';
  const phaseType = params.phaseType as string || 'ONE_PHASE';
  const totalPriceParam = params.totalPrice as string || '0';
  const installationType = params.installationType as string || 'AP_MAI';
  
  // State cho danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(totalPriceParam !== '0' ? totalPriceParam : '0');
  const [customerName, setCustomerName] = useState('-');
  const [dealer, setDealer] = useState('-');
  
  // State cho thông tin người lập báo giá
  const [agentName, setAgentName] = useState('');
  
  // Tính tổng công suất từ danh sách tấm pin
  const [totalPower, setTotalPower] = useState('');

  // Hàm lấy dữ liệu sản phẩm và thông tin người dùng từ AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Bắt đầu lấy dữ liệu cho trang Success...');
        
        // Lấy thông tin người lập báo giá từ AsyncStorage - QUAN TRỌNG!!!
        console.log('Đang lấy thông tin user đăng nhập từ AsyncStorage...');
        const userDataString = await AsyncStorage.getItem('userData');
        console.log('Data từ AsyncStorage:', userDataString ? 'Đã tìm thấy' : 'Không tìm thấy');
        
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            console.log('Thông tin user đã parse:', userData);
            
            const userCode = userData.code || '';
            const userName = userData.name || '';
            
            if (userName) {
              const formattedName = `${userCode} - ${userName}`;
              setAgentName(formattedName);
              console.log('Đã lấy thông tin người lập báo giá:', formattedName);
              
              // Thử lấy thông tin mới nhất của người dùng từ API
              if (userData.id) {
                console.log('Đang gọi API lấy thông tin mới nhất của user ID:', userData.id);
                fetchLatestUserData(userData.id);
              }
            } else {
              console.log('Tên người dùng không tìm thấy trong userData');
              // Sử dụng giá trị từ params nếu không có trong AsyncStorage
              setAgentName(params.agentName as string || '-');
            }
          } catch (parseError) {
            console.error('Lỗi khi parse userData:', parseError);
            // Sử dụng giá trị từ params nếu không parse được
            setAgentName(params.agentName as string || '-');
          }
        } else {
          console.log('Không tìm thấy userData trong AsyncStorage');
          
          // Thử lấy dữ liệu từ API trước khi dùng params
          try {
            const response = await fetch('https://id.slmsolar.com/api/auth/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                // Thêm token nếu cần
                'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData && userData.name) {
                const userCode = userData.code || '';
                const userName = userData.name || '';
                const formattedName = `${userCode} - ${userName}`;
                setAgentName(formattedName);
                console.log('Đã lấy thông tin người dùng từ API:', formattedName);
                
                // Lưu vào AsyncStorage cho lần sau
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
              } else {
                // Sử dụng giá trị từ params nếu API không trả về đúng định dạng
                setAgentName(params.agentName as string || '-');
              }
            } else {
              // Sử dụng giá trị từ params nếu API lỗi
              setAgentName(params.agentName as string || '-');
            }
          } catch (apiError) {
            console.error('Lỗi khi gọi API lấy thông tin người dùng:', apiError);
            // Sử dụng giá trị từ params nếu API lỗi
            setAgentName(params.agentName as string || '-');
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
        
        // Lấy thông tin khách hàng nếu có
        const customerData = await AsyncStorage.getItem('customerData');
        if (customerData) {
          const parsedCustomerData = JSON.parse(customerData);
          if (parsedCustomerData.name) {
            setCustomerName(parsedCustomerData.name);
          }
          if (parsedCustomerData.agent_id) {
            setDealer(`SLM${parsedCustomerData.agent_id}`);
          }
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
    return numericPrice.toLocaleString('vi-VN') + ' VND';
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
                <div class="value">${customerName}</div>
              </div>
              <div class="info-row">
                <div class="label">Số điện thoại:</div>
                <div class="value">${phoneNumber || '-'}</div>
              </div>
              <div class="info-row">
                <div class="label">Đại lý phụ trách:</div>
                <div class="value">${dealer}</div>
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
      return `${product.quantity} tấm`;
    } else if (product.category === 'INVERTER') {
      return `${product.quantity.toString().padStart(2, '0')} bộ`;
    } else if (product.category === 'BATTERY') {
      return `${product.quantity.toString().padStart(2, '0')} cái`;
    } else {
      return `${product.quantity.toString().padStart(2, '0')} bộ`;
    }
  };

  // Hàm lấy thông tin mới nhất của người dùng từ API
  const fetchLatestUserData = async (userId: string | number) => {
    if (!userId) {
      console.log('Không có userId, không thể gọi API');
      return;
    }
    
    try {
      console.log('Đang gọi API lấy thông tin user với ID:', userId);
      
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`https://id.slmsolar.com/api/mini_admins/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API trả về lỗi: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log('Kết quả từ API:', userData ? 'Thành công' : 'Không có dữ liệu');
      
      if (userData && userData.name) {
        // Cập nhật thông tin người dùng trong AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('Đã lưu thông tin mới nhất vào AsyncStorage');
        
        // Cập nhật hiển thị - không sử dụng ký tự • trực tiếp
        const userCode = userData.code || '';
        const userName = userData.name || '';
        // Lưu riêng biệt để tránh vấn đề với ký tự đặc biệt
        setAgentName(`${userCode} - ${userName}`);
        console.log('Đã cập nhật thông tin người lập báo giá từ API:', userCode, userName);
      } else {
        console.log('API không trả về thông tin tên người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng từ API:', error);
      // Giữ nguyên thông tin hiện tại nếu có lỗi
      
      // Thử gọi API auth/me nếu API users không hoạt động
      try {
        console.log('Thử gọi API auth/me để lấy thông tin người dùng...');
        const token = await AsyncStorage.getItem('token');
        
        const meResponse = await fetch('https://id.slmsolar.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          if (meData && meData.name) {
            // Cập nhật thông tin người dùng trong AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify(meData));
            
            // Cập nhật hiển thị - không sử dụng ký tự • trực tiếp
            const userCode = meData.code || '';
            const userName = meData.name || '';
            // Lưu riêng biệt để tránh vấn đề với ký tự đặc biệt
            setAgentName(`${userCode} - ${userName}`);
            console.log('Đã cập nhật thông tin người lập báo giá từ API auth/me:', userCode, userName);
          }
        }
      } catch (meError) {
        console.error('Lỗi khi gọi API auth/me:', meError);
      }
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
                <Text style={styles.infoValue}>{customerCode || '-'}</Text>
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
              <TouchableOpacity>
                <Text style={styles.updateButton}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{customerName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{phoneNumber || '-'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Đại lý phụ trách</Text>
                <Text style={styles.infoValue}>{dealer}</Text>
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
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CHI TIẾT BÁO GIÁ</Text>
            </View>
            <View style={styles.detailContent}>
              {/* Tấm quang năng */}
              {getPanels().length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>1. TẤM QUANG NĂNG</Text>
                    <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                  </View>
                  {getPanels().map((panel, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailValue}>{formatProductName(panel)}</Text>
                      <Text style={styles.detailValue}>{formatQuantity(panel)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Biến tần */}
              {getInverters().length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>2. BIẾN TẦN</Text>
                    <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                  </View>
                  {getInverters().map((inverter, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailValue}>{formatProductName(inverter)}</Text>
                      <Text style={styles.detailValue}>{formatQuantity(inverter)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Pin lưu trữ */}
              {getBatteries().length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>3. PIN LƯU TRỮ</Text>
                    <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                  </View>
                  {getBatteries().map((battery, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailValue}>{formatProductName(battery)}</Text>
                      <Text style={styles.detailValue}>{formatQuantity(battery)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Hình thức lắp đặt */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>4. HÌNH THỨC LẮP ĐẶT</Text>
                  <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{installationType === 'AP_MAI' ? 'Áp mái' : 'Khung sắt'}</Text>
                  <Text style={styles.detailValue}>Trọn gói</Text>
                </View>
              </View>

              {/* Phụ kiện, vật tư */}
              {getAccessories().length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>5. PHỤ KIỆN, VẬT TƯ</Text>
                    <Text style={styles.detailTitle}>SỐ LƯỢNG</Text>
                  </View>
                  {getAccessories().map((accessory, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailValue}>{formatProductName(accessory)}</Text>
                      <Text style={styles.detailValue}>{formatQuantity(accessory)}</Text>
                    </View>
                  ))}
                </View>
              )}
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