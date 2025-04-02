import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCombo } from '../../hooks/useCombo';

interface QuoteFormData {
    fullName: string;
    phone: string;
    email: string;
    address: string;
}

export default function ProductQuoteScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { data: product, isLoading } = useCombo(Number(id));
    
    const [formData, setFormData] = useState<QuoteFormData>({
        fullName: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleSubmit = () => {
        // TODO: Implement form submission logic
        console.log('Form submitted:', formData);
        // You can add API call here to submit the quote request
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerTitle: 'Yêu cầu báo giá',
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerShadowVisible: true,
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back" size={28} color="#000" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView style={styles.container}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product?.name}</Text>
                    <Text style={styles.productPrice}>
                        {product?.total_price.toLocaleString('vi-VN')} đ
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Thông tin khách hàng</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ và tên *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({...formData, fullName: text})}
                            placeholder="Nhập họ và tên"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Số điện thoại *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({...formData, phone: text})}
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({...formData, email: text})}
                            placeholder="Nhập email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Địa chỉ</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={formData.address}
                            onChangeText={(text) => setFormData({...formData, address: text})}
                            placeholder="Nhập địa chỉ"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Gửi yêu cầu báo giá</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f8',
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    bottomActions: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 