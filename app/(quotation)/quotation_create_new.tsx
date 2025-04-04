import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function QuotationCreateNew() {
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const handleCustomerIdChange = (text: string) => {
    setCustomerId(text);
    // Thực tế cần check xem ID khách hàng đã tồn tại chưa
    // Giả định nếu customerId = 'M101' thì đã tồn tại
    setIsNewCustomer(text !== 'M101' && text.length > 0);
  };

  const handleCreateQuotation = () => {
    // Xử lý logic tạo báo giá và chuyển đến màn hình tiếp theo
    console.log('Tạo báo giá với:', { customerId, phoneNumber });
    // router.push('/(quotation)/quotation_details');
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
                placeholder="Mã khách hàng"
                placeholderTextColor="#7B7D9D"
              />
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#7B7D9D" />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Số điện thoại"
                placeholderTextColor="#7B7D9D"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Info alert for new customer */}
          {isNewCustomer && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color="#2E90FA" />
              <Text style={styles.infoText}>
                Thông tin khách hàng mà bạn vừa nhập chưa tồn tại, tạo báo giá mới đồng nghĩa với việc tạo thông tin khách hàng mới.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom navigation */}
        <View style={styles.bottomContainer}>
         
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleCreateQuotation}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  progressContainer: {
    paddingHorizontal: 16,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ABACC2',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#27273E',
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
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E90FA',
  },
  bottomContainer: {
    width: '100%',
  },
  indicator: {
    height: 34,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  indicatorLine: {
    width: 134,
    height: 5,
    backgroundColor: '#0A0E15',
    borderRadius: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#ED1C24',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 