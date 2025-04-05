import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';

export default function QuotationCreateNew() {
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  const checkCustomerExistence = useCallback(
    debounce(async (id: string) => {
      if (!id || id.trim() === '') {
          setIsLoading(false);
          setIsNewCustomer(false);
          setCustomerExists(null);
          setCustomerData(null);
          setError(null);
          return;
      }
      setIsLoading(true);
      setError(null);
      setCustomerExists(null);
      setCustomerData(null);

      try {
        const response = await fetch(`https://id.slmsolar.com/api/mini_admins/potential-customer/check-exist-by-code/${id.trim()}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCustomerExists(data.exist);
        setIsNewCustomer(!data.exist);
        
        if (data.exist && data.potential_customer) {
          setCustomerData(data.potential_customer);
        }
      } catch (err: any) {
        console.error('API call failed:', err);
        setError(err.message || 'Không thể kiểm tra mã khách hàng. Vui lòng thử lại.');
        setIsNewCustomer(false);
        setCustomerExists(null);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  const handleCustomerIdChange = (text: string) => {
    const upperCaseText = text.toUpperCase();
    setCustomerId(upperCaseText);
    checkCustomerExistence(upperCaseText);
  };

  const handleCreateQuotation = () => {
    if (isLoading) {
        console.log("Still checking customer ID...");
        return;
    }
    if (error) {
        console.log("Cannot proceed due to an error:", error);
        return;
    }
    console.log('Tạo báo giá với:', { customerId, phoneNumber, isNewCustomer });
    
    // Chuyển sang step 2 trong quy trình tạo báo giá
    router.push({
      pathname: '/(quotation)/quotation_product_selection',
      params: { 
        customerId, 
        phoneNumber, 
        isNewCustomer: isNewCustomer ? 'true' : 'false' 
      }
    });
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressComplete} />
            <View style={styles.progressIncomplete} />
            <View style={styles.progressIncomplete} />
            <View style={styles.progressIncomplete} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Titles */}
            <Text style={styles.title}>Nhập thông tin khách hàng</Text>
            <Text style={styles.subtitle}>
              Vui lòng điền thông tin của khách hàng trước khi tiếp tục tạo báo giá.
            </Text>

            {/* Customer ID Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#7B7D9D" />
                <TextInput
                  style={styles.input}
                  value={customerId}
                  onChangeText={handleCustomerIdChange}
                  placeholder="Nhập mã khách hàng (VD: V001)"
                  placeholderTextColor="#7B7D9D"
                  autoCapitalize="characters"
                />
                {isLoading && <ActivityIndicator size="small" color="#ED1C24" style={styles.loadingIndicator} />}
                {!isLoading && customerId.length > 0 && customerExists !== null && (
                  <Ionicons
                    name={customerExists ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={20}
                    color={customerExists ? "#28a745" : "#dc3545"}
                    style={styles.validationIcon}
                  />
                )}
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Phone Number Input - Only show if customer doesn't exist */}
            {(!customerExists || customerExists === null) && (
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#7B7D9D" />
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Nhập số điện thoại khách hàng"
                    placeholderTextColor="#7B7D9D"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Info alert for new customer */}
            {isNewCustomer && !isLoading && customerExists === false && (
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={20} color="#2E90FA" />
                <Text style={styles.infoText}>
                  Thông tin khách hàng mà bạn vừa nhập chưa tồn tại, tạo báo giá mới đồng nghĩa với việc tạo thông tin khách hàng mới.
                </Text>
              </View>
            )}

            {/* Info alert for existing customer */}
            {!isLoading && customerExists === true && (
              <View style={[styles.infoContainer, styles.infoContainerSuccess]}>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                <Text style={styles.infoTextSuccess}>
                  Thông tin khách hàng mà bạn vừa nhập đã tồn tại trên hệ thống.
                </Text>
              </View>
            )}

            {/* Customer Details Section - Show only when customer exists */}
            {!isLoading && customerExists === true && customerData && (
              <View style={styles.customerDetailsContainer}>
                {/* Customer Information Section Header */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>THÔNG TIN KHÁCH HÀNG</Text>
                </View>
                
                {/* Customer Details */}
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Họ và tên</Text>
                    <Text style={styles.detailValue}>{customerData.name || null}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Số điện thoại</Text>
                    <Text style={styles.detailValue}>{customerData.phone || null}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Đại lý phụ trách</Text>
                    <Text style={styles.detailValue}>{customerData.agent_id ? `SLM${customerData.agent_id}` : null}</Text>
                  </View>
                  
                  <View style={styles.detailRowFull}>
                    <Text style={styles.detailLabel}>Địa chỉ liên hệ</Text>
                    <Text style={styles.detailValue}>{customerData.address || null}</Text>
                  </View>
                </View>
                
                {/* Quotation History Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>LỊCH SỬ BÁO GIÁ</Text>
                </View>
                
                {/* No history placeholder - You can replace this with actual history if available */}
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>Khách hàng chưa có báo giá nào</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, (isLoading || !customerId || customerExists === null) && styles.buttonDisabled]}
              onPress={handleCreateQuotation}
              disabled={isLoading || !customerId || customerExists === null}
            >
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Tạo báo giá mới</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    position: 'relative',
    zIndex: 2,
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
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ABACC2',
    borderRadius: 6,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#27273E',
    paddingVertical: 0,
    minHeight: 24,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 24,
  },
  loadingIndicator: {
    marginLeft: 8,
    zIndex: 6,
  },
  validationIcon: {
    marginLeft: 8,
    zIndex: 6,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF8FF',
    padding: 16,
    borderRadius: 6,
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  infoContainerSuccess: {
      backgroundColor: '#e9f7ec',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E90FA',
    lineHeight: 20,
  },
  infoTextSuccess: {
      flex: 1,
      fontSize: 14,
      color: '#28a745',
      lineHeight: 20,
  },
  bottomContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 180,
    height: 48,
  },
  buttonDisabled: {
    backgroundColor: '#FAD7D9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  customerDetailsContainer: {
    width: '100%',
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B7D9D',
    textTransform: 'uppercase',
  },
  detailsCard: {
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  detailRowFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCE6',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7B7D9D',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27273E',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  emptyHistory: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#7B7D9D',
    fontStyle: 'italic',
  },
}); 