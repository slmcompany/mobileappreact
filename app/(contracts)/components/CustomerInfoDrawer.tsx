import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomerInfoDrawerProps {
  visible: boolean;
  onClose: () => void;
  customerName: string | null;
  phoneNumber: string | null;
  dealer: string | null;
  onSave: (data: { name: string; phone: string; dealer: string }) => void;
}

export default function CustomerInfoDrawer({
  visible,
  onClose,
  customerName,
  phoneNumber,
  dealer,
  onSave
}: CustomerInfoDrawerProps) {
  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(phoneNumber || '');
  const [dealerCode, setDealerCode] = useState(dealer || '');

  const handleSave = () => {
    onSave({
      name,
      phone,
      dealer: dealerCode
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Cập nhật thông tin khách hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#27273E" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên khách hàng"
                placeholderTextColor="#9394B0"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9394B0"
                keyboardType="phone-pad"
                editable={false}
              />
              <Text style={styles.helperText}>Số điện thoại không thể thay đổi</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mã đại lý phụ trách</Text>
              <TextInput
                style={styles.input}
                value={dealerCode}
                onChangeText={setDealerCode}
                placeholder="Nhập mã đại lý phụ trách"
                placeholderTextColor="#9394B0"
              />
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>HỦY BỎ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>LƯU THÔNG TIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#27273E',
  },
  content: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#7B7D9D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCDCE6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#27273E',
  },
  helperText: {
    fontSize: 12,
    color: '#9394B0',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCDCE6',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ED1C24',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#27273E',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 