import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCombo } from '../../hooks/useCombo';
import { useSector } from '../../hooks/useSector';

const SECTOR_LOGO = 'https://supabase.slmsolar.com/storage/v1/object/sign/solarmax/logo/logo-white.png';

const { width: screenWidth } = Dimensions.get('window');
const itemImageSize = screenWidth / 4;

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

    const roundToTenThousands = (price: number) => {
        return Math.round(price / 10000) * 10000;
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
                <View style={styles.infoSection}>
                    <View style={styles.infoContent}>
                        {product.image ? (
                            <Image 
                                source={{ uri: product.image }}
                                style={styles.comboImage}
                                resizeMode="cover"
                                onError={handleImageError}
                            />
                        ) : renderPlaceholder()}
                        <View style={styles.infoDetails}>
                            <Text style={styles.productTitle}>{product.name}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>
                                    Sản lượng điện: {productionRange}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>
                                    Thời gian hoàn vốn
                                </Text>
                            </View>
                            <View style={styles.priceRow}>
                                <View style={styles.priceWrapper}>
                                    <Text style={styles.priceText}>
                                        {product.total_price ? roundToTenThousands(product.total_price).toLocaleString('vi-VN') : '0'}
                                    </Text>
                                    <Text style={styles.priceText}>đ</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

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
                    {product.grouped_merchandises?.filter(group => group.template.is_main)
                        .map((group, index) => {
                            const firstItem = group.pre_quote_merchandises[0];
                            if (!firstItem) return null;
                            
                            return (
                                <View key={`${group.template.id}-${index}`} style={styles.equipmentCard}>
                                    <View style={styles.itemRow}>
                                        <View style={styles.imageContainer}>
                                            {firstItem.merchandise.data_json?.warranty_years && (
                                                <View style={styles.warrantyTag}>
                                                    <Text style={styles.warrantyText}>
                                                        Bảo hành {firstItem.merchandise.data_json.warranty_years} năm
                                                    </Text>
                                                </View>
                                            )}
                                            {firstItem.merchandise?.images?.[0]?.link ? (
                                                <Image 
                                                    source={{ uri: firstItem.merchandise.images[0].link }}
                                                    style={styles.itemImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Image 
                                                    source={require('@/assets/images/replace-holder.png')}
                                                    style={styles.itemImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </View>
                                        <View style={styles.itemContent}>
                                            <Text style={styles.itemName}>{firstItem.merchandise.name}</Text>
                                            {firstItem.merchandise.data_json && (
                                                <View style={styles.specList}>
                                                    {Object.entries(firstItem.merchandise.data_json)
                                                        .filter(([key]) => key !== 'price_vnd' && key !== 'area_m2' && key !== 'thickness_mm' && key !== 'height_mm' && key !== 'width_mm' && key !== 'warranty_years' && key !== 'phase_type' && key !== 'weight_kg' && key !== 'brand_ranking' && key !== 'installation_type' && key !== 'cell_brand' && key !== 'max_upgrade_kwh')
                                                        .map(([key, value], idx) => {
                                                        const displayKey = key === 'power_watt' ? 'Công suất' 
                                                            : key === 'technology' ? 'Công nghệ'
                                                            : key === 'installation_method' ? 'Lắp đặt'
                                                            : key === 'dc_max_power_kw' ? 'Đầu vào DC Max'
                                                            : key === 'ac_power_kw' ? 'Công suất AC'
                                                            : key === 'storage_capacity_kwh' ? 'Dung lượng'
                                                            : key;
                                                        
                                                        const displayValue = key === 'dc_max_power_kw'
                                                            ? `${String(value)} kW`
                                                            : key === 'ac_power_kw'
                                                            ? `${String(value)} kW`
                                                            : key === 'storage_capacity_kwh'
                                                            ? `${String(value)} kWh`
                                                            : String(value);
                                                            
                                                        return (
                                                            <Text key={idx} style={styles.specText}>
                                                                {displayKey}: {displayValue}
                                                            </Text>
                                                        );
                                                    })}
                                                </View>
                                            )}
                                            <View style={styles.priceQuantityRow}>
                                                <Text style={styles.itemPrice}>
                                                    {firstItem.price ? (Math.round(firstItem.price / 10000) * 10000).toLocaleString('vi-VN') : 0} đ
                                                </Text>
                                                <View style={styles.quantityContainer}>
                                                    <Text style={styles.quantityLabel}>Số lượng</Text>
                                                    <View style={styles.quantityBadge}>
                                                        <Text style={styles.quantityValue}>
                                                            {firstItem.quantity}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                </View>

                {/* Price and Commitment */}
                <View style={styles.priceCommitment}>
                    <View style={styles.commitmentTextContainer}>
                        <Text style={styles.commitmentText}>Trọn gói 100%</Text>
                        <Text style={styles.commitmentText}>Cam kết không phát sinh</Text>
                        <Text style={styles.commitmentText}>với mái ngói, mái tôn</Text>
                    </View>
                    <View style={styles.priceTag}>
                        <Text style={styles.price}>
                            {product.total_price ? roundToTenThousands(product.total_price).toLocaleString('vi-VN') : '0'}
                        </Text>
                        <Text style={styles.currency}>đ</Text>
                    </View>
                </View>

                {/* Equipment List (Duplicated) */}
                <View style={styles.equipmentListDuplicate}>
                    <Text style={styles.sectionTitle}>DANH MỤC THIẾT BỊ</Text>
                    
                    {product.grouped_merchandises?.map((group, index) => (
                        <View key={`duplicate-${group.template.id}-${index}`} style={styles.equipmentItem}>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemNumber}>{index + 1}</Text>
                                <Text style={[styles.itemName, { flex: 1 }]}>{group.template.name}</Text>
                                <Text style={[styles.itemQuantity, { textAlign: 'right', minWidth: 60 }]}>
                                    {group.pre_quote_merchandises[0]?.quantity} bộ
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Tax Info and Hotline */}
                <View style={styles.taxAndHotlineContainer}>
                    <Text style={styles.taxInfoText}>
                        Giá đã bao gồm thuế. Phí vận chuyển và các chi phí khác (nếu có) sẽ được thông báo tới quý khách hàng thông qua nhân viên tư vấn.
                    </Text>
                    <TouchableOpacity style={styles.phoneButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                        <Text style={styles.phoneNumber}>0969 66 33 87</Text>
                    </TouchableOpacity>
                </View>

                {/* Company Info */}
                <View style={styles.companyInfo}>
                    <View style={styles.companyInfoRow}>
                        <Text style={styles.companyName}>CÔNG TY CỔ PHẦN ĐẦU TƯ SLM</Text>
                    </View>
                    <Text style={styles.companyAddress}>
                        Tầng 5, Tòa nhà Diamond Flower Tower Số 01, Đ. Hoàng Đạo Thúy, P. Nhân Chính Quận Thanh Xuân, Hà Nội
                    </Text>
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
        gap: 12,
    },
    equipmentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
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
        gap: 12,
    },
    itemNumber: {
        width: 24,
        fontSize: 14,
        color: '#091E42',
        textAlign: 'center',
    },
    itemContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        color: '#091E42',
        paddingTop: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#091E42',
        paddingHorizontal: 8,
        backgroundColor: '#F5F5F8',
        borderRadius: 4,
        overflow: 'hidden',
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    itemImage: {
        width: itemImageSize,
        height: itemImageSize,
        borderRadius: 4,
        backgroundColor: '#F5F5F8',
    },
    priceCommitment: {
        backgroundColor: '#f5f5f8',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commitmentTextContainer: {
        flex: 1,
    },
    commitmentText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#27273E',
        lineHeight: 20,
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
    companyInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 10,
        fontWeight: '700',
        color: '#27273E',
    },
    companyAddress: {
        fontSize: 8,
        color: '#27273E',
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
    equipmentListDuplicate: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 16,
    },
    infoSection: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    infoContent: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    comboImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F8',
    },
    infoDetails: {
        flex: 1,
        gap: 6,
    },
    infoRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 20,
        color: '#7B7D9D',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 4,
    },
    priceWrapper: {
        flexDirection: 'row',
        gap: 2,
    },
    priceText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#ED1C24',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#27273E',
        marginBottom: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    quantityLabel: {
        fontSize: 8,
        lineHeight: 12,
        color: '#7B7D9D',
    },
    quantityBadge: {
        backgroundColor: '#7B7D9D',
        paddingHorizontal: 6,
        height: 16,
        minWidth: 16,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityValue: {
        fontSize: 8,
        lineHeight: 12,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    itemPrice: {
        fontSize: 14,
        color: '#ED1C24',
        fontWeight: '500',
    },
    specList: {
        marginTop: 2,
    },
    specText: {
        fontSize: 12,
        color: '#7B7D9D',
        lineHeight: 20,
    },
    priceQuantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    imageContainer: {
        position: 'relative',
    },
    warrantyTag: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: '#ED1C24',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    warrantyText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '500',
    },
    taxAndHotlineContainer: {
        backgroundColor: '#F5F5F8',
        padding: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    taxInfoText: {
        fontSize: 8,
        lineHeight: 12,
        color: '#7B7D9D',
        flex: 1,
    },
}); 