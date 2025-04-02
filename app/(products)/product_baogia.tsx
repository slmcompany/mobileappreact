import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCombo } from '../../hooks/useCombo';
import { useSector } from '../../hooks/useSector';

const SECTOR_LOGO = 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/logo/logo-white.png';

export default function ProductQuoteScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [imageError, setImageError] = useState(false);
    const { data: product, isLoading, error } = useCombo(Number(id));
    const { data: sector } = useSector(Number(product?.grouped_merchandises?.[0]?.template?.sector_id));

    const handleImageError = () => {
        setImageError(true);
    };

    const renderPlaceholder = () => {
        return (
            <Image 
                source={require('@/assets/images/replace-holder.png')}
                style={styles.placeholderImage}
                resizeMode="contain"
            />
        );
    };

    const getTypeDisplay = (type?: string) => {
        switch(type) {
            case 'DOC_LAP_MOT_PHA': return 'ĐỘC LẬP - MỘT PHA';
            case 'DOC_LAP_BA_PHA': return 'ĐỘC LẬP - BA PHA';
            case 'BAM_TAI_MOT_PHA': return 'BÁM TẢI - MỘT PHA';
            case 'BAM_TAI_BA_PHA': return 'BÁM TẢI - BA PHA';
            default: return 'ĐỘC LẬP';
        }
    };

    const getPowerFromName = (name: string) => {
        const match = name.match(/(\d+(\.\d+)?)\s*kw/i);
        return match ? match[1] : '5.5';
    };

    const getPhaseFromType = (type?: string) => {
        return type?.includes('BA_PHA') ? 3 : 1;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00A650" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
                    <Text style={styles.errorText}>{error?.message || 'Không tìm thấy sản phẩm'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const power = getPowerFromName(product.name);
    const phase = getPhaseFromType(product.type);
    const productionRange = `${Math.round(Number(power) * 80)}-${Math.round(Number(power) * 120)} kWh/tháng`;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <Stack.Screen
                options={{
                    headerTitle: 'Báo giá chi tiết',
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
                {/* System Overview */}
                <View style={styles.systemOverview}>
                    <View style={styles.greenBanner}>
                        <View style={styles.bannerLeft}>
                            {sector?.image && (
                                <Image 
                                    source={{ uri: sector.image }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            )}
                            <Image 
                                source={{ uri: SECTOR_LOGO }}
                                style={styles.sectorLogo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.bannerText}>Bật để Tiết kiệm Điện</Text>
                    </View>
                    
                    <View style={styles.systemInfo}>
                        <View style={styles.systemType}>
                            <View style={styles.infoRow}>
                                <Text style={[styles.infoLabel, { flex: 1 }]}>{product.name}</Text>
                            </View>
                            <Text style={styles.productionNote}>
                                Sản lượng trung bình: {productionRange}
                            </Text>
                        </View>
                        
                        <View style={styles.systemTags}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{phase === 1 ? 'MỘT PHA' : 'BA PHA'}</Text>
                            </View>
                            <View style={[styles.tag, styles.blueTag]}>
                                <Text style={[styles.tagText, styles.blueTagText]}>ÁP THẤP</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Equipment List */}
                <View style={styles.equipmentList}>
                    <Text style={styles.sectionTitle}>DANH MỤC THIẾT BỊ</Text>
                    
                    {product.grouped_merchandises?.map((group, index) => (
                        <View key={`${group.template.id}-${index}`} style={styles.equipmentItem}>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemNumber}>{index + 1}</Text>
                                <Text style={styles.itemName}>{group.template.name}</Text>
                                <Text style={styles.itemQuantity}>
                                    {group.pre_quote_merchandises[0]?.quantity} bộ
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Price and Commitment */}
                <View style={styles.priceCommitment}>
                    <Text style={styles.commitmentText}>
                        Trọn gói 100% Cam kết không phát sinh với mái ngói, mái tôn
                    </Text>
                    <View style={styles.priceTag}>
                        <Text style={styles.price}>
                            {product.total_price?.toLocaleString('vi-VN')}
                        </Text>
                        <Text style={styles.currency}>đ</Text>
                    </View>
                </View>

                {/* Company Info */}
                <View style={styles.companyInfo}>
                    <View style={styles.companyDetails}>
                        <Text style={styles.companyName}>CÔNG TY CỔ PHẦN ĐẦU TƯ SLM</Text>
                        <Text style={styles.companyAddress}>
                            Tầng 5, Tòa nhà Diamond Flower Tower Số 01, Đ. Hoàng Đạo Thúy, P. Nhân Chính Quận Thanh Xuân, Hà Nội
                        </Text>
                    </View>
                    
                    <View style={styles.contactInfo}>
                        <TouchableOpacity style={styles.phoneButton}>
                            <Ionicons name="call" size={20} color="#fff" />
                            <Text style={styles.phoneNumber}>0969 66 33 87</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        backgroundColor: '#fff',
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    systemOverview: {
        backgroundColor: '#f5f5f8',
    },
    greenBanner: {
        backgroundColor: '#0F974A',
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productImage: {
        height: 64,
        aspectRatio: 1,
        borderRadius: 4,
    },
    sectorLogo: {
        width: 24,
        height: 24,
    },
    bannerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        textAlign: 'right',
    },
    systemInfo: {
        padding: 16,
        position: 'relative',
    },
    systemType: {
        marginBottom: 16,
        paddingRight: 100,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#004B22',
    },
    productionNote: {
        fontSize: 14,
        color: '#7B7D9D',
        textAlign: 'left',
        marginTop: 8,
        fontWeight: '500',
    },
    systemTags: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        position: 'absolute',
        right: 16,
        top: 16,
    },
    tag: {
        backgroundColor: '#f5f5f8',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    blueTag: {
        backgroundColor: '#EFF8FF',
    },
    tagText: {
        fontSize: 10,
        color: '#666888',
    },
    blueTagText: {
        color: '#2E90FA',
    },
    equipmentList: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#98A1B0',
        marginBottom: 16,
    },
    equipmentItem: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#DCDCE6',
        paddingVertical: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemNumber: {
        width: 24,
        fontSize: 14,
        color: '#091E42',
        textAlign: 'center',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#091E42',
        marginHorizontal: 8,
    },
    itemQuantity: {
        width: 60,
        fontSize: 14,
        color: '#091E42',
        textAlign: 'center',
    },
    priceCommitment: {
        backgroundColor: '#f5f5f8',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commitmentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#27273E',
    },
    priceTag: {
        backgroundColor: '#ED1C24',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 6,
        marginLeft: 16,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    currency: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 2,
    },
    companyInfo: {
        padding: 16,
        backgroundColor: '#DCDCE6',
    },
    companyDetails: {
        marginBottom: 16,
    },
    companyName: {
        fontSize: 10,
        fontWeight: '700',
        color: '#27273E',
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 8,
        color: '#27273E',
    },
    contactInfo: {
        alignItems: 'center',
    },
    phoneButton: {
        backgroundColor: '#ED1C24',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 8,
    },
    phoneNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    placeholderImage: {
        width: 200,
        height: 200,
    },
}); 