import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function NewContactScreen() {
  const router = useRouter();
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Nhập thông tin khách hàng',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          contentStyle: {
            backgroundColor: '#fff'
          }
        }}
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]} edges={['bottom']}>
        <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingTop: 0 }}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Họ và tên *"
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Số điện thoại *"
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor="#666"
            />
          </View>

          <TouchableOpacity style={styles.inputContainer}>
            <Ionicons name="male-female" size={20} color="#666" style={styles.inputIcon} />
            <Text style={[styles.input, !gender && styles.placeholder]}>
              {gender || 'Giới tính'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Số Nhà, Tên Đường"
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.addressRow}>
            <TouchableOpacity style={[styles.inputContainer, styles.halfInput]}>
              <Text style={[styles.input, !province && styles.placeholder]}>
                {province || 'Tỉnh/TP'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.inputContainer, styles.halfInput]}>
              <Text style={[styles.input, !district && styles.placeholder]}>
                {district || 'Quận, Huyện'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.inputContainer}>
            <Text style={[styles.input, !ward && styles.placeholder]}>
              {ward || 'Phường, Xã'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Nghề nghiệp"
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <Text style={[styles.sectionTitle, styles.productTitle]}>Sản phẩm quan tâm</Text>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Tôi xác nhận thông tin đã cung cấp là chính xác và phù hợp với yêu cầu của SLM Agent App, đồng thời Xác nhận rằng Tôi đã Đọc và Chấp thuận các{' '}
              <Text style={styles.link}>Điều khoản & Điều kiện</Text>
              {' '}của ứng dụng trước khi tiến hành gửi.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Gửi thông tin</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 0,
    marginBottom: 10,
  },
  productTitle: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  placeholder: {
    color: '#666',
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  disclaimer: {
    marginTop: 15,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#EE0033',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
}); 