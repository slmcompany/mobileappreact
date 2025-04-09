import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image, Modal, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu dữ liệu cho sản phẩm
type Product = {
  id: number;
  name: string;
  description?: string;
  specs?: {
    label: string;
    value: string;
  }[];
  price: number;
  importPrice: number;
  gmRate: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  warranty_years?: number;
  template?: {
    gm: number;
    code: string;
    name: string;
  };
};

// Định nghĩa category type
type Category = 'PANEL' | 'INVERTER' | 'BATTERY' | 'ACCESSORY';

// Định nghĩa filter type
type FilterState = {
  systemType: string;
  phaseType: string;
  category?: Category;
};

// Định nghĩa kiểu dữ liệu cho API response
type PreQuoteMerchandiseItem = {
  pre_quote_id: number;
  merchandise_id: number;
  quantity: number;
  gm: number;
  id: number;
  note: string | null;
  price: number;
  warranty_years: number;
  merchandise: {
    id: number;
    name: string;
    category: string;
    specs: Record<string, string>;
    tags: string[];
    image_url?: string;
  };
};

// Định nghĩa kiểu dữ liệu cho API product response
type ProductApiItem = {
  id: number;
  name: string;
  code: string;
  description_in_quotation: string;
  description_in_contract: string;
  active: boolean;
  unit: string;
  data_sheet_link: string;
  data_json: Record<string, any>;
  template_id: number;
  template: {
    id: number;
    code: string;
    name: string;
    structure_json: Record<string, any>;
    is_main: boolean;
    sector_id: number;
    gm: number;
  };
  brand_id: number;
  brand: {
    id: number;
    code: string;
    name: string;
    image: string | null;
    description: string | null;
  };
  supplier_id: number | null;
  supplier: {
    id: number;
    code: string;
    name: string;
    image: string | null;
    description: string | null;
  };
  price_infos: {
    id: number;
    merchandise_id: number;
    import_price_include_vat: number;
    created_at: string;
  }[];
  images?: {
    id: number;
    merchandise_id: number;
    link: string;
  }[];
};

type ComboItem = {
  id: number;
  name: string;
  code: string;
  total_price?: number;
  description?: string;
  image?: string;
  grouped_merchandises?: any[];
};

export default function QuotationDetails() {
  // Nhận params từ màn hình trước
  const params = useLocalSearchParams();
  const systemType = (Array.isArray(params.systemType) ? params.systemType[0] : params.systemType) || '';
  const phaseType = (Array.isArray(params.phaseType) ? params.phaseType[0] : params.phaseType) || '';
  const customerId = (Array.isArray(params.customerId) ? params.customerId[0] : params.customerId) || '';
  const phoneNumber = (Array.isArray(params.phoneNumber) ? params.phoneNumber[0] : params.phoneNumber) || '';
  const isNewCustomer = (Array.isArray(params.isNewCustomer) ? params.isNewCustomer[0] : params.isNewCustomer) === 'true';
  const comboId = (Array.isArray(params.comboId) ? params.comboId[0] : params.comboId) || '';
  const comboName = (Array.isArray(params.comboName) ? params.comboName[0] : params.comboName) || '';
  const comboPrice = parseInt((Array.isArray(params.comboPrice) ? params.comboPrice[0] : params.comboPrice) || '0');
  
  // State hiển thị drawer và danh mục đang chọn
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    systemType: 'HYBRID',
    phaseType: 'ONE_PHASE'
  });
  
  // State cho số lượng sản phẩm
  const [products, setProducts] = useState<Product[]>([]);

  // State cho hình thức lắp đặt
  const [installationType, setInstallationType] = useState<'AP_MAI' | 'KHUNG_SAT'>('AP_MAI');
  const [frameSellPrice, setFrameSellPrice] = useState<string>('');
  const [frameLaborPrice, setFrameLaborPrice] = useState<string>('');

  // State cho danh sách tất cả sản phẩm từ API
  const [allProducts, setAllProducts] = useState<ProductApiItem[]>([]);
  
  // Khai báo state mới để lưu trạng thái đã xử lý combo
  const [comboProcessed, setComboProcessed] = useState(false);

  // State cho hiển thị khung nhấn mạnh khi nhập giá
  const [focusedInput, setFocusedInput] = useState<'frame_price' | 'labor_price' | null>(null);

  // State cho thông tin người dùng đăng nhập
  const [userData, setUserData] = useState<any>(null);
  
  // State cho việc tìm kiếm sản phẩm
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State cho việc xác nhận xóa sản phẩm
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Lấy thông tin người dùng đăng nhập từ AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
          console.log('Đã lấy thông tin người dùng:', parsedUserData);
        } else {
          console.log('Không tìm thấy thông tin người dùng trong AsyncStorage');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    getUserData();
    
    // Lấy thông tin khách hàng nếu có customerId
    if (customerId) {
      fetchAndSaveCustomerData(customerId);
    }
  }, []);

  // Fetch tất cả sản phẩm từ API khi component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Thêm useEffect để xử lý combo được chọn
  useEffect(() => {
    if (comboId && !comboProcessed && allProducts.length > 0) {
      fetchComboProducts(comboId.toString());
    }
  }, [comboId, allProducts, comboProcessed]);

  // Xử lý tăng số lượng sản phẩm
  const handleIncreaseQuantity = (productId: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, quantity: product.quantity + 1 } 
          : product
      )
    );
  };

  // Xử lý giảm số lượng sản phẩm
  const handleDecreaseQuantity = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && product.quantity === 1) {
      // Hiển thị dialog xác nhận khi giảm số lượng từ 1 xuống 0
      Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa sản phẩm này khỏi báo giá?",
        [
          {
            text: "Hủy",
            style: "cancel"
          },
          {
            text: "Xóa",
            onPress: () => handleDeleteProduct(productId),
            style: "destructive"
          }
        ]
      );
    } else {
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId && product.quantity > 1
            ? { ...product, quantity: product.quantity - 1 } 
            : product
        )
      );
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = (productId: number) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  };

  // Thêm hàm tính tổng giá bao gồm khung sắt và nhân công nếu được chọn
  const calculateTotalPrice = (): number => {
    // Tính tổng giá của tất cả sản phẩm đã chọn
    const productsTotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    // Nếu chọn hình thức lắp đặt là khung sắt, cộng thêm giá khung sắt và nhân công
    if (installationType === 'KHUNG_SAT') {
      const frameSellPriceValue = parseInt(frameSellPrice) || 0;
      const frameLaborPriceValue = parseInt(frameLaborPrice) || 0;
      return productsTotal + frameSellPriceValue + frameLaborPriceValue;
    }
    
    return productsTotal;
  };

  // Tính tổng tiền sử dụng hàm calculateTotalPrice
  const totalPrice = calculateTotalPrice();
  
  // Tính giá khung sắt và nhân công
  const frameSellPriceValue = parseInt(frameSellPrice) || 0;
  const frameLaborPriceValue = parseInt(frameLaborPrice) || 0;
  const frameTotal = frameSellPriceValue + frameLaborPriceValue;
  const productTotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  // Hàm làm tròn đến hàng nghìn
  const roundToThousand = (price: number): number => {
    return Math.round(price / 1000) * 1000;
  };

  // Mở drawer theo danh mục
  const openCategoryDrawer = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryProducts(category);
    setDrawerVisible(true);
  };

  // Đóng drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Fetch tất cả sản phẩm
  const fetchAllProducts = async () => {
    try {
      const response = await fetch('https://id.slmsolar.com/api/products/with-images');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data: ProductApiItem[] = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Thêm hàm để fetch sản phẩm của combo
  const fetchComboProducts = async (comboId: string) => {
    try {
      setLoading(true);
      console.log('Bắt đầu fetch sản phẩm của combo với ID:', comboId);
      
      // Gọi API để lấy sector data
      const sectorResponse = await fetch('https://id.slmsolar.com/api/sector');
      
      if (!sectorResponse.ok) {
        console.error('API trả về status không thành công:', sectorResponse.status);
        throw new Error('Không thể lấy dữ liệu sector');
      }
      
      const sectorData = await sectorResponse.json();
      console.log('Đã lấy được dữ liệu sector');
      
      // Tìm combo trong tất cả các sector
      let targetCombo = null;
      let comboProducts: Product[] = [];
      
      for (const sector of sectorData) {
        if (sector.list_combos && Array.isArray(sector.list_combos)) {
          targetCombo = sector.list_combos.find((combo: ComboItem) => combo.id.toString() === comboId);
          if (targetCombo) {
            console.log('Đã tìm thấy combo trong sector:', sector.name);
            break;
          }
        }
      }
      
      if (targetCombo) {
        console.log('Combo được tìm thấy:', targetCombo.name);
        
        // Xử lý grouped_merchandises
        if (targetCombo.grouped_merchandises && Array.isArray(targetCombo.grouped_merchandises)) {
          console.log('Số nhóm sản phẩm trong combo:', targetCombo.grouped_merchandises.length);
          
          for (const group of targetCombo.grouped_merchandises) {
            console.log('Đang xử lý nhóm sản phẩm:', group.template?.name || 'Không có tên');
            
            if (group.pre_quote_merchandises && Array.isArray(group.pre_quote_merchandises)) {
              console.log('Số sản phẩm trong nhóm:', group.pre_quote_merchandises.length);
              
              for (const item of group.pre_quote_merchandises) {
                const merchandiseId = item.merchandise_id;
                console.log('Tìm kiếm sản phẩm có ID:', merchandiseId);
                
                const matchingProduct = allProducts.find(p => p.id === merchandiseId);
                if (matchingProduct) {
                  console.log('Đã tìm thấy sản phẩm phù hợp:', matchingProduct.name);
                  const product = convertApiItemToProduct(matchingProduct);
                  product.quantity = item.quantity || 1;
                  comboProducts.push(product);
                } else {
                  console.warn('Không tìm thấy sản phẩm phù hợp cho ID:', merchandiseId);
                  
                  // Nếu có merchandise data được trả về từ API, sử dụng nó để hiển thị sản phẩm
                  if (item.merchandise) {
                    console.log('Sử dụng dữ liệu merchandise từ API sector');
                    
                    // Tạo sản phẩm từ dữ liệu merchandise trong combo
                    const specs = item.merchandise.specs ? 
                      Object.entries(item.merchandise.specs).slice(0, 2).map(([key, value]) => ({
                        label: key,
                        value: String(value)
                      })) : [];
                    
                    // Xác định loại sản phẩm dựa trên template code của group
                    let category: Category | undefined = undefined;
                    if (group.template?.code === 'PIN_PV') category = 'PANEL';
                    else if (group.template?.code === 'INVERTER_DC_AC') category = 'INVERTER';
                    else if (group.template?.code === 'BATTERY_STORAGE') category = 'BATTERY';
                    else category = 'ACCESSORY';
                    
                    const product: Product = {
                      id: item.merchandise.id,
                      name: item.merchandise.name,
                      description: '',
                      specs,
                      price: item.price || 0,
                      importPrice: item.price ? (item.price * (1 - (item.gm || 0) / 100)) : 0,
                      gmRate: item.gm || 0,
                      quantity: item.quantity || 1,
                      imageUrl: item.merchandise.image_url,
                      category,
                      tags: item.merchandise.tags || [],
                      warranty_years: item.warranty_years || 0
                    };
                    
                    comboProducts.push(product);
                  }
                }
              }
            }
          }
        }
        
        // Thêm sản phẩm đã tìm thấy vào danh sách
        if (comboProducts.length > 0) {
          console.log('Tổng số sản phẩm đã tìm thấy:', comboProducts.length);
          setProducts(prevProducts => [...prevProducts, ...comboProducts]);
        } else {
          console.warn('Không tìm thấy sản phẩm nào trong combo');
          
          // Thử sử dụng backup API nếu không tìm được sản phẩm nào
          try {
            const backupResponse = await fetch(`https://id.slmsolar.com/api/combos/${comboId}/products`);
            if (backupResponse.ok) {
              const data = await backupResponse.json();
              console.log('Dữ liệu từ API backup:', data);
              
              if (data && Array.isArray(data) && data.length > 0) {
                const backupProducts: Product[] = [];
                
                data.forEach((comboProduct: any) => {
                  const merchandiseId = comboProduct.merchandise_id;
                  const matchingProduct = allProducts.find(p => p.id === merchandiseId);
                  
                  if (matchingProduct) {
                    const product = convertApiItemToProduct(matchingProduct);
                    product.quantity = comboProduct.quantity || 1;
                    backupProducts.push(product);
                  }
                });
                
                if (backupProducts.length > 0) {
                  console.log('Đã tìm thấy sản phẩm từ API backup:', backupProducts.length);
                  setProducts(prevProducts => [...prevProducts, ...backupProducts]);
                }
              }
            }
          } catch (backupError) {
            console.error('Lỗi khi gọi API backup:', backupError);
          }
        }
      } else {
        console.error('Không tìm thấy combo có ID:', comboId);
        
        // Thử sử dụng API backup nếu không tìm được combo
        try {
          const backupResponse = await fetch(`https://id.slmsolar.com/api/combos/${comboId}/products`);
          if (backupResponse.ok) {
            const data = await backupResponse.json();
            console.log('Dữ liệu từ API backup:', data);
            
            if (data && Array.isArray(data) && data.length > 0) {
              const backupProducts: Product[] = [];
              
              data.forEach((comboProduct: any) => {
                const merchandiseId = comboProduct.merchandise_id;
                const matchingProduct = allProducts.find(p => p.id === merchandiseId);
                
                if (matchingProduct) {
                  const product = convertApiItemToProduct(matchingProduct);
                  product.quantity = comboProduct.quantity || 1;
                  backupProducts.push(product);
                }
              });
              
              if (backupProducts.length > 0) {
                console.log('Đã tìm thấy sản phẩm từ API backup:', backupProducts.length);
                setProducts(prevProducts => [...prevProducts, ...backupProducts]);
              }
            }
          }
        } catch (backupError) {
          console.error('Lỗi khi gọi API backup:', backupError);
        }
      }
      
      // Đánh dấu đã xử lý combo để không xử lý lại
      setComboProcessed(true);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm của combo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc sản phẩm từ danh sách tất cả sản phẩm theo loại
  const filterProductsByCategory = (category: Category) => {
    // Ánh xạ Category sang template code
    const categoryToTemplateCode: Record<Category, string> = {
      'PANEL': 'PIN_PV',
      'INVERTER': 'INVERTER_DC_AC',
      'BATTERY': 'BATTERY_STORAGE',
      'ACCESSORY': 'ACCESSORY'
    };
    
    const templateCode = categoryToTemplateCode[category];
    
    if (category === 'ACCESSORY') {
      // Phụ kiện là những sản phẩm active không thuộc 3 loại chính
      return allProducts.filter(product => {
        const code = product.template?.code;
        return product.active && code !== 'PIN_PV' && code !== 'INVERTER_DC_AC' && code !== 'BATTERY_STORAGE';
      });
    }
    
    return allProducts.filter(product => 
      product.template?.code === templateCode && product.active
    );
  };

  // Thêm hàm tính giá bán từ giá nhập và GM
  const calculateSellingPrice = (importPrice: number, gmRate: number): number => {
    return importPrice / (1 - gmRate/100);
  };

  // Cập nhật hàm fetchCategoryProducts
  const fetchCategoryProducts = async (category: Category) => {
    setLoading(true);
    try {
      // Nếu đã có danh sách tất cả sản phẩm
      if (allProducts.length > 0) {
        const filteredApiProducts = filterProductsByCategory(category);
        const convertedProducts = filteredApiProducts.map(convertApiItemToProduct);
        setCategoryProducts(convertedProducts);
      } else {
        // Fetch lại nếu chưa có
        const response = await fetch('https://id.slmsolar.com/api/products/with-images');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data: ProductApiItem[] = await response.json();
        setAllProducts(data);
        
        const filteredApiProducts = data.filter(product => {
          const templateCode = product.template?.code;
          if (category === 'PANEL') return templateCode === 'PIN_PV';
          if (category === 'INVERTER') return templateCode === 'INVERTER_DC_AC';
          if (category === 'BATTERY') return templateCode === 'BATTERY_STORAGE';
          if (category === 'ACCESSORY') {
            return product.active && 
              templateCode !== 'PIN_PV' && 
              templateCode !== 'INVERTER_DC_AC' && 
              templateCode !== 'BATTERY_STORAGE';
          }
          return false;
        });
        
        const convertedProducts = filteredApiProducts.map(convertApiItemToProduct);
        setCategoryProducts(convertedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trong hàm convertApiItemToProduct
  const convertApiItemToProduct = (item: ProductApiItem): Product => {
    // Tạo specs từ data_json
    const specs = item.data_json ? Object.entries(item.data_json).map(([key, value]) => {
      // Xác định label dựa trên key
      let label = key;
      if (key === 'power_watt') label = 'Công suất';
      else if (key === 'width_mm') label = 'Chiều rộng';
      else if (key === 'height_mm') label = 'Chiều cao';
      else if (key === 'thickness_mm') label = 'Độ dày';
      else if (key === 'weight_kg') label = 'Khối lượng';
      else if (key === 'technology') label = 'Công nghệ';
      else if (key === 'warranty_years') label = 'Bảo hành';
      else if (key === 'ac_power_kw') label = 'Công suất AC';
      else if (key === 'dc_max_power_kw') label = 'Công suất DC tối đa';
      else if (key === 'installation_type') label = 'Loại lắp đặt';
      else if (key === 'phase_type') label = 'Loại pha';
      else if (key === 'storage_capacity_kwh') label = 'Dung lượng lưu trữ';
      
      return {
        label,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      };
    }) : [];

    // Thêm thông tin bảo hành vào specs nếu có
    if (item.data_json?.warranty_years && !specs.find(spec => spec.label === 'Bảo hành')) {
      specs.push({
        label: 'Bảo hành',
        value: `${item.data_json.warranty_years} năm`
      });
    }
    
    // Xác định category từ template code
    let category: Category | undefined = undefined;
    if (item.template?.code === 'PIN_PV') category = 'PANEL';
    else if (item.template?.code === 'INVERTER_DC_AC') category = 'INVERTER';
    else if (item.template?.code === 'BATTERY_STORAGE') category = 'BATTERY';
    
    // Lấy giá nhập từ price_infos
    let importPrice = 0;
    if (item.price_infos && item.price_infos.length > 0) {
      importPrice = item.price_infos[0].import_price_include_vat;
    }
    
    // Tính giá bán bao gồm GM
    const gmRate = item.template?.gm || 10; // Mặc định GM là 10% nếu không có
    const sellingPrice = importPrice / (1 - gmRate/100);
    
    // Ưu tiên lấy hình ảnh từ thuộc tính images, nếu không có thì lấy từ brand.image
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0].link
      : item.brand?.image || undefined;
    
    return {
      id: item.id,
      name: item.name,
      description: item.description_in_quotation,
      specs,
      price: sellingPrice,
      importPrice,
      gmRate,
      quantity: 1,
      imageUrl,
      category,
      tags: [], // API không có tags
      warranty_years: item.data_json?.warranty_years || 0,
      template: item.template ? {
        gm: item.template.gm,
        code: item.template.code,
        name: item.template.name
      } : undefined
    };
  };

  // Cập nhật hàm addProductToSelection
  const addProductToSelection = (product: Product) => {
    // Kiểm tra xem sản phẩm đã tồn tại chưa
    const existingProduct = products.find(p => p.id === product.id);
    
    if (existingProduct) {
      // Nếu đã tồn tại, tăng số lượng
      handleIncreaseQuantity(product.id);
    } else {
      // Nếu chưa tồn tại, thêm mới
      setProducts(prevProducts => [...prevProducts, {...product, quantity: 1}]);
    }
    
    // Đóng drawer
    closeDrawer();
  };

  // Xử lý chọn hình thức lắp đặt
  const handleInstallationTypeChange = (type: 'AP_MAI' | 'KHUNG_SAT') => {
    setInstallationType(type);
  };

  // Xử lý nhập giá khung sắt
  const handleFrameSellPriceChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, '');
    setFrameSellPrice(numericValue);
  };

  // Xử lý nhập giá nhân công
  const handleFrameLaborPriceChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, '');
    setFrameLaborPrice(numericValue);
  };

  // Render component ProductDrawer
  const renderProductDrawer = () => {
    const getCategoryTitle = () => {
      switch (selectedCategory) {
        case 'PANEL':
          return 'Tấm quang năng';
        case 'INVERTER':
          return 'Biến tần';
        case 'BATTERY':
          return 'Pin lưu trữ';
        case 'ACCESSORY':
          return 'Phụ kiện và vật tư đi kèm';
        default:
          return 'Chọn sản phẩm';
      }
    };

    return (
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContainer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHandleBar} />
              <View style={styles.drawerTitleContainer}>
                <Text style={styles.drawerTitle}>{getCategoryTitle()}</Text>
                <TouchableOpacity onPress={closeDrawer}>
                  <Ionicons name="close" size={24} color="#7B7D9D" />
                </TouchableOpacity>
              </View>
              
              {/* Filter tags */}
              <View style={styles.filterTagsContainer}>
                <View style={styles.selectedFilterTag}>
                  <Text style={styles.selectedFilterTagText}>HYBRID</Text>
                </View>
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText}>MỘT PHA</Text>
                </View>
                {selectedCategory === 'INVERTER' && (
                  <View style={styles.categoryFilterTag}>
                    <Text style={styles.filterTagText}>BIẾN TẦN</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Drawer Content */}
            <ScrollView style={styles.drawerContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#ED1C24" />
                  <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
              ) : categoryProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không có sản phẩm phù hợp</Text>
                </View>
              ) : (
                categoryProducts.map(product => (
                  <View key={product.id} style={styles.productCardInDrawer}>
                    <View style={styles.drawerProductImageContainer}>
                      {product.imageUrl ? (
                        <Image 
                          source={{ uri: product.imageUrl }} 
                          style={styles.drawerProductImage}
                          resizeMode="contain" 
                        />
                      ) : (
                        <View style={styles.drawerImagePlaceholder} />
                      )}
                    </View>
                    <View style={styles.drawerProductDetails}>
                      <View style={styles.drawerProductHeader}>
                        <Text style={styles.drawerProductName}>{product.name}</Text>
                        {product.tags && product.tags.length > 0 && (
                          <View style={styles.drawerProductTag}>
                            <Text style={styles.drawerProductTagText}>{product.tags[0]}</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.drawerProductSpecsContainer}>
                        {product.specs?.slice(0, 2).map((spec, index) => (
                          <View key={index} style={styles.drawerProductSpec}>
                            <Text style={styles.drawerProductSpecLabel}>{spec.label}:</Text>
                            <Text style={styles.drawerProductSpecValue}>{spec.value}</Text>
                          </View>
                        ))}
                        {product.specs?.slice(0, 3).map((spec, index) => (
                          <View key={`spec-${index}`} style={styles.drawerProductSpec}>
                            <Text style={styles.drawerProductSpecLabel}>{spec.label}:</Text>
                            <Text style={styles.drawerProductSpecValue}>{spec.value}</Text>
                          </View>
                        ))}
                        {/* Hiển thị thông tin bảo hành nếu có */}
                        {!product.specs?.some(spec => spec.label === 'Bảo hành') && product.warranty_years && product.warranty_years > 0 && (
                          <View style={styles.drawerProductSpec}>
                            <Text style={[styles.drawerProductSpecLabel, styles.warrantyText]}>
                              Bảo hành: {product.warranty_years} năm
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.drawerProductFooter}>
                        <View style={styles.drawerProductPrice}>
                          <Text style={styles.drawerProductPriceValue}>
                            {roundToThousand(product.importPrice / (1 - (product.gmRate || 10) / 100)).toLocaleString()}
                          </Text>
                          <Text style={styles.drawerProductPriceCurrency}>đ</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.drawerAddButton}
                          onPress={() => addProductToSelection({
                            ...product,
                            price: roundToThousand(product.importPrice / (1 - (product.gmRate || 10) / 100))
                          })}
                        >
                          <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            {/* Bottom indicator */}
            <View style={styles.drawerIndicator}>
              <View style={styles.drawerIndicatorLine} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Hàm cập nhật thông tin khách hàng nếu đã tồn tại
  const updateExistingCustomer = async (customerId: string) => {
    try {
      // Ví dụ gọi API cập nhật thông tin khách hàng
      const response = await fetch(`https://id.slmsolar.com/api/mini_admins/potential-customer/update/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Dữ liệu cập nhật, có thể lấy từ state hoặc form
          last_quotation_date: new Date().toISOString(),
          agent_id: userData?.id || null,
          // Các trường khác nếu cần
        }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin khách hàng');
      }
      
      const data = await response.json();
      console.log('Đã cập nhật thông tin khách hàng:', data);
      
      // Lấy thông tin khách hàng để lưu vào AsyncStorage
      await fetchAndSaveCustomerData(customerId);
      
      return data;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
      return null;
    }
  };
  
  // Hàm lấy và lưu thông tin khách hàng
  const fetchAndSaveCustomerData = async (customerId: string) => {
    try {
      const response = await fetch(`https://id.slmsolar.com/api/mini_admins/potential-customer/check-exist-by-code/${customerId}`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin khách hàng');
      }
      
      const data = await response.json();
      if (data.exist && data.potential_customer) {
        // Lưu thông tin khách hàng vào AsyncStorage
        await AsyncStorage.setItem('customerData', JSON.stringify(data.potential_customer));
        console.log('Đã lưu thông tin khách hàng vào AsyncStorage');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin khách hàng:', error);
    }
  };

  // Helper function to get display text for phase type
  const getPhaseTypeDisplayText = (type: string) => {
    switch (type) {
      case 'ONE_PHASE':
        return 'MỘT PHA';
      case 'THREE_PHASE_LOW':
        return 'BA PHA ÁP THẤP';
      case 'THREE_PHASE_HIGH':
        return 'BA PHA ÁP CAO';
      default:
        return '';
    }
  };

  // Helper function to get display text for system type
  const getSystemTypeDisplayText = (type: string) => {
    switch (type) {
      case 'HYBRID':
        return 'HYBRID';
      case 'BAM_TAI':
        return 'BÁM TẢI';
      default:
        return '';
    }
  };

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

        {/* Title */}
        <Text style={styles.title}>Danh mục thiết bị và vật tư</Text>

        {/* Đã chọn - Hiển thị các tùy chọn đã chọn từ màn hình trước */}
        <View style={styles.selectedOptionsContainer}>
          <Text style={styles.selectedOptionsLabel}>Đã chọn</Text>
          <View style={styles.selectedOptionTag}>
            <Text style={styles.selectedOptionText}>{getSystemTypeDisplayText(systemType)}</Text>
          </View>
          <View style={[styles.selectedOptionTag]}>
            <Text style={[styles.selectedOptionText]}>
              {getPhaseTypeDisplayText(phaseType)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
            <View style={styles.progressComplete} />
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Danh mục thiết bị */}
          <View style={styles.categoriesContainer}>
            {/* Tấm quang năng */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>TẤM QUANG NĂNG</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => openCategoryDrawer('PANEL')}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {/* Hiển thị các sản phẩm đã chọn thuộc danh mục này */}
              {products.filter(p => p.category === 'PANEL').length > 0 && (
                <View style={styles.accessoriesContainer}>
                  {products.filter(p => p.category === 'PANEL').map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productImageContainer}>
                        {product.imageUrl ? (
                          <Image 
                            source={{ uri: product.imageUrl }} 
                            style={styles.productImage}
                            resizeMode="contain" 
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#ABACC2" />
                          </View>
                        )}
                      </View>
                      <View style={styles.productDetails}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        
                        <View style={styles.productSpecsContainer}>
                          {/* Hiển thị description_in_quotation */}
                          {product.description && (
                            <View style={styles.productSpec}>
                              <Text style={styles.productSpecText}>{product.description}</Text>
                            </View>
                          )}
                          
                          {/* Hiển thị thông tin bảo hành riêng biệt */}
                          {!product.specs?.some(spec => spec.label === 'Bảo hành') && product.warranty_years && product.warranty_years > 0 && (
                            <View style={styles.productSpec}>
                              <Text style={[styles.productSpecText, styles.warrantyText]}>
                                Bảo hành: {product.warranty_years} năm
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.productPriceContainer}>
                          <View style={styles.priceWrapper}>
                            <Text style={styles.productPrice}>{roundToThousand(product.price).toLocaleString()}</Text>
                            <Text style={styles.productCurrency}>đ</Text>
                          </View>
                          
                          <View style={styles.productActions}>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity 
                                style={styles.decreaseButton}
                                onPress={() => handleDecreaseQuantity(product.id)}
                              >
                                <Ionicons name="remove" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                              
                              <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityText}>{product.quantity}</Text>
                              </View>
                              
                              <TouchableOpacity 
                                style={styles.increaseButton}
                                onPress={() => handleIncreaseQuantity(product.id)}
                              >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Biến tần */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>BIẾN TẦN</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => openCategoryDrawer('INVERTER')}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {/* Hiển thị các sản phẩm đã chọn thuộc danh mục này */}
              {products.filter(p => p.category === 'INVERTER').length > 0 && (
                <View style={styles.accessoriesContainer}>
                  {products.filter(p => p.category === 'INVERTER').map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productImageContainer}>
                        {product.imageUrl ? (
                          <Image 
                            source={{ uri: product.imageUrl }} 
                            style={styles.productImage}
                            resizeMode="contain" 
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#ABACC2" />
                          </View>
                        )}
                      </View>
                      <View style={styles.productDetails}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        
                        <View style={styles.productSpecsContainer}>
                          {/* Hiển thị description_in_quotation */}
                          {product.description && (
                            <View style={styles.productSpec}>
                              <Text style={styles.productSpecText}>{product.description}</Text>
                            </View>
                          )}
                          
                          {/* Hiển thị thông tin bảo hành riêng biệt */}
                          {!product.specs?.some(spec => spec.label === 'Bảo hành') && product.warranty_years && product.warranty_years > 0 && (
                            <View style={styles.productSpec}>
                              <Text style={[styles.productSpecText, styles.warrantyText]}>
                                Bảo hành: {product.warranty_years} năm
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.productPriceContainer}>
                          <View style={styles.priceWrapper}>
                            <Text style={styles.productPrice}>{roundToThousand(product.price).toLocaleString()}</Text>
                            <Text style={styles.productCurrency}>đ</Text>
                          </View>
                          
                          <View style={styles.productActions}>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity 
                                style={styles.decreaseButton}
                                onPress={() => handleDecreaseQuantity(product.id)}
                              >
                                <Ionicons name="remove" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                              
                              <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityText}>{product.quantity}</Text>
                              </View>
                              
                              <TouchableOpacity 
                                style={styles.increaseButton}
                                onPress={() => handleIncreaseQuantity(product.id)}
                              >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Pin lưu trữ */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>PIN LƯU TRỮ</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => openCategoryDrawer('BATTERY')}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {/* Hiển thị các sản phẩm đã chọn thuộc danh mục này */}
              {products.filter(p => p.category === 'BATTERY').length > 0 && (
                <View style={styles.accessoriesContainer}>
                  {products.filter(p => p.category === 'BATTERY').map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productImageContainer}>
                        {product.imageUrl ? (
                          <Image 
                            source={{ uri: product.imageUrl }} 
                            style={styles.productImage}
                            resizeMode="contain" 
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#ABACC2" />
                          </View>
                        )}
                      </View>
                      <View style={styles.productDetails}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        
                        <View style={styles.productSpecsContainer}>
                          {/* Hiển thị description_in_quotation */}
                          {product.description && (
                            <View style={styles.productSpec}>
                              <Text style={styles.productSpecText}>{product.description}</Text>
                            </View>
                          )}
                          
                          {/* Hiển thị thông tin bảo hành riêng biệt */}
                          {!product.specs?.some(spec => spec.label === 'Bảo hành') && product.warranty_years && product.warranty_years > 0 && (
                            <View style={styles.productSpec}>
                              <Text style={[styles.productSpecText, styles.warrantyText]}>
                                Bảo hành: {product.warranty_years} năm
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.productPriceContainer}>
                          <View style={styles.priceWrapper}>
                            <Text style={styles.productPrice}>{roundToThousand(product.price).toLocaleString()}</Text>
                            <Text style={styles.productCurrency}>đ</Text>
                          </View>
                          
                          <View style={styles.productActions}>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity 
                                style={styles.decreaseButton}
                                onPress={() => handleDecreaseQuantity(product.id)}
                              >
                                <Ionicons name="remove" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                              
                              <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityText}>{product.quantity}</Text>
                              </View>
                              
                              <TouchableOpacity 
                                style={styles.increaseButton}
                                onPress={() => handleIncreaseQuantity(product.id)}
                              >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Hình thức lắp đặt */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>HÌNH THỨC LẮP ĐẶT</Text>
              </View>
              <View style={styles.installationContainer}>
                <View style={styles.installationOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.installOption, 
                      installationType === 'AP_MAI' && styles.installOptionSelected
                    ]}
                    onPress={() => handleInstallationTypeChange('AP_MAI')}
                  >
                    <Text 
                      style={[
                        styles.installOptionText, 
                        installationType === 'AP_MAI' && styles.installOptionTextSelected
                      ]}
                    >
                      ÁP MÁI
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.installOption, 
                      installationType === 'KHUNG_SAT' && styles.installOptionSelected
                    ]}
                    onPress={() => handleInstallationTypeChange('KHUNG_SAT')}
                  >
                    <Text 
                      style={[
                        styles.installOptionText, 
                        installationType === 'KHUNG_SAT' && styles.installOptionTextSelected
                      ]}
                    >
                      KHUNG SẮT
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Hiển thị trường nhập liệu khi chọn KHUNG SẮT */}
                {installationType === 'KHUNG_SAT' && (
                  <View style={styles.frameInputsContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Giá bán khung sắt</Text>
                      <View style={[
                        styles.inputContainer, 
                        focusedInput === 'frame_price' && styles.inputContainerFocused
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Nhập giá bán khung sắt"
                          placeholderTextColor="#7B7D9D"
                          keyboardType="numeric"
                          value={frameSellPrice}
                          onChangeText={handleFrameSellPriceChange}
                          onFocus={() => setFocusedInput('frame_price')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Giá nhân công khung sắt</Text>
                      <View style={[
                        styles.inputContainer, 
                        focusedInput === 'labor_price' && styles.inputContainerFocused
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Nhập giá nhân công khung sắt"
                          placeholderTextColor="#7B7D9D"
                          keyboardType="numeric"
                          value={frameLaborPrice}
                          onChangeText={handleFrameLaborPriceChange}
                          onFocus={() => setFocusedInput('labor_price')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Phụ kiện và vật tư đi kèm */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>PHỤ KIỆN VÀ VẬT TƯ ĐI KÈM</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => openCategoryDrawer('ACCESSORY')}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {/* Hiển thị các sản phẩm đã chọn thuộc danh mục này */}
              {products.filter(p => !p.category || p.category === 'ACCESSORY').length > 0 && (
                <View style={styles.accessoriesContainer}>
                  {products.filter(p => !p.category || p.category === 'ACCESSORY').map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productImageContainer}>
                        {product.imageUrl ? (
                          <Image 
                            source={{ uri: product.imageUrl }} 
                            style={styles.productImage}
                            resizeMode="contain" 
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#ABACC2" />
                          </View>
                        )}
                      </View>
                      <View style={styles.productDetails}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName}>{product.name}</Text>
                        </View>
                        
                        <View style={styles.productSpecsContainer}>
                          {/* Hiển thị description_in_quotation */}
                          {product.description && (
                            <View style={styles.productSpec}>
                              <Text style={styles.productSpecText}>{product.description}</Text>
                            </View>
                          )}
                          
                          {/* Hiển thị thông tin bảo hành riêng biệt */}
                          {!product.specs?.some(spec => spec.label === 'Bảo hành') && product.warranty_years && product.warranty_years > 0 && (
                            <View style={styles.productSpec}>
                              <Text style={[styles.productSpecText, styles.warrantyText]}>
                                Bảo hành: {product.warranty_years} năm
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.productPriceContainer}>
                          <View style={styles.priceWrapper}>
                            <Text style={styles.productPrice}>{roundToThousand(product.price).toLocaleString()}</Text>
                            <Text style={styles.productCurrency}>đ</Text>
                          </View>
                          
                          <View style={styles.productActions}>
                            <View style={styles.quantityControl}>
                              <TouchableOpacity 
                                style={styles.decreaseButton}
                                onPress={() => handleDecreaseQuantity(product.id)}
                              >
                                <Ionicons name="remove" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                              
                              <View style={styles.quantityDisplay}>
                                <Text style={styles.quantityText}>{product.quantity}</Text>
                              </View>
                              
                              <TouchableOpacity 
                                style={styles.increaseButton}
                                onPress={() => handleIncreaseQuantity(product.id)}
                              >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom indicator */}
        <View style={styles.indicator}>
          <View style={styles.indicatorLine} />
        </View>
        
        {/* Bottom action - Hiển thị chi tiết giá nếu có khung sắt */}
        <View style={styles.bottomContainer}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Tổng tạm tính (bao gồm VAT)</Text>
            <Text style={styles.totalPriceValue}>
              {totalPrice > 0 ? roundToThousand(totalPrice).toLocaleString() + ' đ' : '-'}
            </Text>
            {installationType === 'KHUNG_SAT' && (frameSellPrice || frameLaborPrice) && (
              <View style={styles.priceDetailsContainer}>
                <Text style={styles.priceDetailText}>
                  Thiết bị: {roundToThousand(productTotal).toLocaleString()} đ
                </Text>
                {frameSellPrice && (
                  <Text style={styles.priceDetailText}>
                    Khung sắt: +{parseInt(frameSellPrice).toLocaleString()} đ
                  </Text>
                )}
                {frameLaborPrice && (
                  <Text style={styles.priceDetailText}>
                    Nhân công: +{parseInt(frameLaborPrice).toLocaleString()} đ
                  </Text>
                )}
                {frameTotal > 0 && (
                  <Text style={styles.priceDetailTextTotal}>
                    Tổng (Đã bao gồm khung + nhân công): {roundToThousand(totalPrice).toLocaleString()} đ
                  </Text>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={async () => {
              // Lấy thời điểm hiện tại
              const now = new Date();
              const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
              
              // Ghi log và xử lý khách hàng đã tồn tại nếu cần
              const isNewCustomer = params.isNewCustomer === 'true';
              const customerId = params.customerId as string;
              const phoneNumber = params.phoneNumber as string;
              
              // Lưu thông tin khách hàng nếu cần
              if (isNewCustomer === false && customerId) {
                try {
                  await updateExistingCustomer(customerId);
                } catch (error) {
                  console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
                  // Vẫn tiếp tục chuyển trang ngay cả khi cập nhật thất bại
                }
              }
              
              // Lưu danh sách sản phẩm vào AsyncStorage để hiển thị trên trang thành công
              try {
                await AsyncStorage.setItem('quotationProducts', JSON.stringify(products));
                await AsyncStorage.setItem('quotationTotalPrice', totalPrice.toString());
                
                // Lưu cả thông tin cấu hình (systemType, phaseType, installationType)
                await AsyncStorage.setItem('quotationConfig', JSON.stringify({
                  systemType,
                  phaseType,
                  installationType
                }));
                
                console.log('Đã lưu thông tin báo giá vào AsyncStorage');
              } catch (error) {
                console.error('Lỗi khi lưu thông tin báo giá:', error);
              }
              
              // Chuyển sang trang kết quả báo giá, trang success sẽ tự lấy thông tin người dùng từ AsyncStorage
              router.push({
                pathname: '/(quotation)/quotation_success',
                params: { 
                  customerId: customerId || '',
                  phoneNumber: phoneNumber || '',
                  createdTime: formattedTime,
                  totalPrice: totalPrice.toString(),
                  systemType,
                  phaseType,
                  installationType
                }
              });
            }}
          >
            <Text style={styles.continueButtonText}>TIẾP TỤC</Text>
          </TouchableOpacity>
        </View>

        {/* Render Product Drawer */}
        {renderProductDrawer()}
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
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#27273E',
    marginHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'System',
  },
  selectedOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  selectedOptionsLabel: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  selectedOptionTag: {
    backgroundColor: '#ECFDF3',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#12B669',
  },
  selectedOptionTagSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#555777',
  },
  selectedOptionText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#12B669',
  },
  selectedOptionTextSecondary: {
    color: '#27273E',
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
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  categoriesContainer: {
    paddingBottom: 30,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
    backgroundColor: '#FFFFFF',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  installationContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  installationOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  installOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#DCDCE6',
  },
  installOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ED1C24',
  },
  installOptionText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#7B7D9D',
  },
  installOptionTextSelected: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ED1C24',
  },
  frameInputsContainer: {
    marginTop: 12,
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#C4C4D4',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputContainerFocused: {
    borderColor: '#ED1C24',
    borderWidth: 2,
  },
  input: {
    color: '#27273E',
    fontSize: 14,
    padding: 0,
    textAlign: 'right',
  },
  accessoriesContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#27273E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  productImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  productDetails: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  productSpecsContainer: {
    gap: 4,
  },
  productSpec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productSpecText: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  productPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceWrapper: {
    flexDirection: 'row',
    gap: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED1C24',
  },
  productCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED1C24',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decreaseButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#9C1C21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#27273E',
  },
  increaseButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ED1C24',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#27273E',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 4,
  },
  totalPriceContainer: {
    flexDirection: 'column',
  },
  totalPriceLabel: {
    fontSize: 10,
    color: '#7B7D9D',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ED1C24',
  },
  continueButton: {
    backgroundColor: '#ED1C24',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: 120,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 62, 0.3)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  drawerHeader: {
    paddingBottom: 12,
  },
  drawerHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 12,
  },
  drawerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27273E',
  },
  filterTagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedFilterTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#12B669',
  },
  selectedFilterTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#12B669',
  },
  filterTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#555777',
  },
  filterTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#27273E',
  },
  categoryFilterTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#DCDCE6',
    borderWidth: 1,
    borderColor: '#555777',
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7B7D9D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#7B7D9D',
  },
  productCardInDrawer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#27273E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  drawerProductImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  drawerProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  drawerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerProductDetails: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  drawerProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  drawerProductTag: {
    backgroundColor: '#F5F5F8',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  drawerProductTagText: {
    fontSize: 8,
    color: '#7B7D9D',
  },
  drawerProductSpecsContainer: {
    marginTop: 4,
  },
  drawerProductSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  drawerProductSpecLabel: {
    fontSize: 12,
    color: '#7B7D9D',
  },
  drawerProductSpecValue: {
    fontSize: 12,
    color: '#7B7D9D',
    marginLeft: 4,
  },
  drawerProductFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  drawerProductPrice: {
    flexDirection: 'row',
    gap: 2,
  },
  drawerProductPriceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED1C24',
  },
  drawerProductPriceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ED1C24',
  },
  drawerAddButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ED1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerIndicator: {
    height: 34,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  drawerIndicatorLine: {
    width: 135,
    height: 4,
    backgroundColor: '#0A0E15',
    borderRadius: 100,
  },
  drawerProductActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9C1C21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  priceDetailsContainer: {
    marginTop: 4,
  },
  priceDetailText: {
    fontSize: 10,
    color: '#7B7D9D',
    marginBottom: 2,
  },
  priceDetailTextTotal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ED1C24',
    marginTop: 2,
  },
  warrantyText: {
    color: '#12B669',
    fontWeight: '500',
    fontSize: 12,
  },
}); 