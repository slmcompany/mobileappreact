import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Định nghĩa kiểu dữ liệu cho thiết bị
interface Device {
  id: number;
  name: string;
  activationDate: string;
  warrantyPeriod: string;
  expireDate: string;
  progressPercent: number;
  description?: string;
  brand?: string;
  serialNumber?: string;
  model?: string;
}

// Định nghĩa kiểu dữ liệu cho hợp đồng
interface Contract {
  id: number;
  code: string;
  activationDate: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  description?: string;
  status: string;
  type?: string;
}

export default function ProfileContractDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const contractId = params.contractId as string;
  const contractCode = params.contractCode as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch contract details
  useEffect(() => {
    const fetchContractDetails = async () => {
      setLoading(true);
      try {
        // Fetch contract details
        const contractResponse = await fetch(`https://slmsolar.com/api/contracts/${contractId}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!contractResponse.ok) {
          throw new Error(`Error fetching contract: ${contractResponse.status}`);
        }
        
        const contractData = await contractResponse.json();
        if (contractData) {
          setContract({
            id: contractData.id || 0,
            code: contractData.code || contractCode || '',
            activationDate: contractData.created_at || '',
            customer: {
              name: contractData.customer?.name || '',
              phone: contractData.customer?.phone || '',
              address: contractData.customer?.address || '',
            },
            description: contractData.description || '',
            status: contractData.status || '',
            type: contractData.installation_type || ''
          });
          
          // Fetch merchandises for the contract
          await fetchDevices(contractData.id);
        }
      } catch (error) {
        console.error('Error fetching contract details:', error);
        setLoading(false);
      }
    };
    
    const fetchDevices = async (contractId: number) => {
      try {
        const response = await fetch(`https://slmsolar.com/api/contracts/${contractId}/merchandises`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching merchandises: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.data) {
          // Lọc ra chỉ những thiết bị có warranty_years > 0
          const filteredMerchandises = data.data.filter((item: any) => item.warranty_years > 0);
          
          // Chuyển đổi dữ liệu sang định dạng Device
          const mappedDevices = filteredMerchandises.map((item: any) => {
            // Lấy ngày kích hoạt từ contract hoặc merchandise
            const activationDate = contract?.activationDate 
              ? new Date(contract.activationDate) 
              : (item.created_at ? new Date(item.created_at) : new Date());
            
            // Tính ngày hết hạn bảo hành
            const expireDate = new Date(activationDate);
            expireDate.setFullYear(expireDate.getFullYear() + (item.warranty_years || 0));
            
            // Tính phần trăm thời gian bảo hành đã trôi qua
            const now = new Date();
            const totalWarrantyTime = expireDate.getTime() - activationDate.getTime();
            const timeElapsed = now.getTime() - activationDate.getTime();
            const progressPercent = Math.min(Math.round((timeElapsed / totalWarrantyTime) * 100), 100);
            
            // Định dạng ngày tháng
            const formatDate = (date: Date) => {
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            };

            return {
              id: item.id,
              name: item.merchandise?.name || item.name || '',
              activationDate: formatDate(activationDate),
              warrantyPeriod: `${item.warranty_years || 0} năm`,
              expireDate: formatDate(expireDate),
              progressPercent: progressPercent,
              description: item.merchandise?.description_in_contract || '',
              brand: item.merchandise?.brand?.name || '',
              serialNumber: item.serial_number || '',
              model: item.merchandise?.code || ''
            };
          });
          
          setDevices(mappedDevices);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data if we have a contract ID
    if (contractId) {
      fetchContractDetails();
    } else if (contractCode) {
      // If we only have contract code, try to fetch the contract by code
      const fetchContractByCode = async () => {
        try {
          const response = await fetch(`https://slmsolar.com/api/contracts?code=${contractCode}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error fetching contract: ${response.status}`);
          }
          
          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            // If we found a contract with this code, use its ID to fetch details
            fetchContractDetails();
          }
        } catch (error) {
          console.error('Error fetching contract by code:', error);
          setLoading(false);
        }
      };
      
      fetchContractByCode();
    } else {
      setLoading(false);
    }
  }, [contractId, contractCode]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );

  const renderContractInfo = () => (
    <View style={styles.contractInfoContainer}>
      <View style={styles.contractHeader}>
        <Text style={styles.contractCode}>{contract?.code || contractCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract?.status || '') }]}>
          <Text style={styles.statusText}>{getStatusText(contract?.status || '')}</Text>
        </View>
      </View>
      
      {contract?.activationDate && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày kích hoạt:</Text>
          <Text style={styles.infoValue}>{formatDate(new Date(contract.activationDate))}</Text>
        </View>
      )}
      
      {contract?.type && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Loại hệ thống:</Text>
          <Text style={styles.infoValue}>{contract.type}</Text>
        </View>
      )}
      
      {contract?.customer.name && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Khách hàng:</Text>
          <Text style={styles.infoValue}>{contract.customer.name}</Text>
        </View>
      )}
      
      {contract?.customer.phone && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{contract.customer.phone}</Text>
        </View>
      )}
      
      {contract?.customer.address && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoValue}>{contract.customer.address}</Text>
        </View>
      )}
      
      {contract?.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.infoLabel}>Mô tả:</Text>
          <Text style={styles.description}>{contract.description}</Text>
        </View>
      )}
    </View>
  );

  const renderDeviceItem = (device: Device, index: number) => (
    <View key={device.id} style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceHeaderLeft}>
          <Text style={styles.deviceNumber}>Thiết bị {index + 1}</Text>
          <Text style={styles.deviceName}>{device.name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="hardware-chip-outline" size={24} color="#ED1C24" />
        </View>
      </View>
      
      <View style={styles.deviceContent}>
        <View style={styles.deviceImageContainer}>
          <View style={styles.deviceImagePlaceholder} />
        </View>
        
        <View style={styles.deviceInfo}>
          {device.brand && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thương hiệu:</Text>
              <Text style={styles.infoValue}>{device.brand}</Text>
            </View>
          )}
          
          {device.model && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Model:</Text>
              <Text style={styles.infoValue}>{device.model}</Text>
            </View>
          )}
          
          {device.serialNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số serial:</Text>
              <Text style={styles.infoValue}>{device.serialNumber}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày kích hoạt:</Text>
            <Text style={styles.infoValue}>{device.activationDate}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian bảo hành:</Text>
            <Text style={styles.infoValue}>{device.warrantyPeriod}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hết hạn bảo hành:</Text>
            <Text style={styles.infoValue}>{device.expireDate}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tiến trình bảo hành</Text>
              <Text style={styles.progressPercent}>{device.progressPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${device.progressPercent}%`,
                    backgroundColor: getProgressColor(device.progressPercent)
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
      
      {device.description && (
        <View style={styles.deviceDescription}>
          <Text style={styles.descriptionLabel}>Mô tả:</Text>
          <Text style={styles.descriptionText}>{device.description}</Text>
        </View>
      )}
    </View>
  );

  const renderDevicesSection = () => (
    <View style={styles.devicesSection}>
      <Text style={styles.sectionTitle}>Danh sách thiết bị</Text>
      <View style={styles.deviceList}>
        {devices.length > 0 ? (
          devices.map((device, index) => renderDeviceItem(device, index))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={40} color="#7B7D9D" />
            <Text style={styles.emptyStateText}>Không tìm thấy thiết bị nào</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Helper function to format date
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'accepted':
        return '#12B669';
      case 'pending':
        return '#F79009';
      case 'rejected':
        return '#F04438';
      default:
        return '#7B7D9D';
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Hoạt động';
      case 'accepted':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  };

  // Helper function to get progress color
  const getProgressColor = (percent: number) => {
    if (percent < 50) return '#12B669';
    if (percent < 75) return '#F79009';
    return '#F04438';
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <>
              {renderContractInfo()}
              {renderDevicesSection()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ED1C24',
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#7B7D9D',
  },
  contractInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contractCode: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 18,
    color: '#27273E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    color: '#7B7D9D',
    width: 120,
  },
  infoValue: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#27273E',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#27273E',
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 20,
    color: '#27273E',
    marginBottom: 16,
  },
  devicesSection: {
    gap: 16,
  },
  deviceList: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F8',
  },
  deviceHeaderLeft: {
    gap: 4,
  },
  deviceNumber: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    color: '#7B7D9D',
  },
  deviceName: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 16,
    color: '#27273E',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFECED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceContent: {
    flexDirection: 'row',
    padding: 16,
  },
  deviceImageContainer: {
    marginRight: 16,
  },
  deviceImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
  },
  deviceInfo: {
    flex: 1,
    gap: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#7B7D9D',
  },
  progressPercent: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 12,
    color: '#27273E',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  deviceDescription: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F8',
  },
  descriptionLabel: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 4,
  },
  descriptionText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#27273E',
    lineHeight: 20,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  emptyStateText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#7B7D9D',
    marginTop: 8,
  }
}); 