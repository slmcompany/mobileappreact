import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
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
  onSave,
}: CustomerInfoDrawerProps) {
  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(phoneNumber || '');
  const [dealerCode, setDealerCode] = useState(dealer || '');

  const handleSave = () => {
    onSave({
      name,
      phone,
      dealer: dealerCode,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#7B7D9D" />
        </TouchableOpacity>
        <Text style={styles.title}>Cập nhật thông tin khách hàng</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Đại lý phụ trách</Text>
          <TextInput
            style={styles.input}
            value={dealerCode}
            onChangeText={setDealerCode}
            placeholder="Nhập mã đại lý"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27273E',
  },
  saveButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ED1C24',
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7B7D9D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCDCE6',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#27273E',
  },
}); 