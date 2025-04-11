import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Interface cho đối tượng thông báo
interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  iconColor: string;
  hasAction: boolean;
  actionText?: string;
  actionHandler?: () => void;
}

// Interface cho loại bộ lọc
interface FilterOption {
  id: string;
  type: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  iconColor: string;
  selected: boolean;
}

// Dữ liệu mẫu cho các thông báo
const notifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: '🎉 Chúc mừng! Hợp đồng DA588 đã ký thành công!',
    message: 'Xin chúc mừng bạn đã ký thành công hợp đồng [Mã số hợp đồng] với khách hàng [Tên khách hàng]. Hoa hồng của bạn sẽ được xử lý và chuyển sớm.',
    time: '01 giờ trước',
    icon: 'checkmark-circle',
    iconBackground: '#ECFDF3',
    iconColor: '#12B669',
    hasAction: false,
  },
  {
    id: '2',
    type: 'info',
    title: '🎉 Chào mừng thành viên mới!',
    message: 'Xin chúc mừng! Yêu cầu đăng ký đại lý mới của Hoàng Ngọc Tân đã được phê duyệt và bạn đã có thêm một thành viên mới gia nhập cộng đồng bán hàng của mình. Chúc bạn và đội ngũ gặt hái nhiều thành công!',
    time: '01 giờ trước',
    icon: 'people',
    iconBackground: '#EFF8FF',
    iconColor: '#2E90FA',
    hasAction: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Bài viết mới về dự án DA688 vừa được đăng tải!',
    message: 'Đã có bài viết mới nhất về dự án DA688 mà bạn đã ký hợp đồng thành công! Khám phá ngay thông tin cập nhật và hấp dẫn.',
    time: '02 ngày trước',
    icon: 'document',
    iconBackground: '#FFFAEB',
    iconColor: '#F79009',
    hasAction: true,
    actionText: 'Xem bài viết',
    actionHandler: () => console.log('Mở bài viết'),
  },
  {
    id: '4',
    type: 'alert',
    title: 'Chú ý, thông tin về khách hàng sắp hết hiệu lực',
    message: 'Thời hạn hiệu lực nhận hoa hồng từ việc cung cấp thông tin khách hàng tiềm năng Nguyễn Văn Đại sắp kết thúc. Hãy nhanh chóng liên hệ để không bỏ lỡ cơ hội này!',
    time: '02 ngày trước',
    icon: 'person',
    iconBackground: '#FFECED',
    iconColor: '#ED1C24',
    hasAction: true,
    actionText: 'Xem thông tin khách hàng',
    actionHandler: () => console.log('Xem thông tin khách hàng'),
  },
];

// Dữ liệu các loại bộ lọc
const filterOptions: FilterOption[] = [
  {
    id: '1',
    type: 'success',
    label: 'Hợp đồng',
    icon: 'checkmark-circle',
    iconBackground: '#ECFDF3',
    iconColor: '#12B669',
    selected: false,
  },
  {
    id: '2',
    type: 'commission',
    label: 'Hoa hồng',
    icon: 'cash',
    iconBackground: '#F9F5FF',
    iconColor: '#9D76ED',
    selected: false,
  },
  {
    id: '3',
    type: 'info',
    label: 'Cộng đồng',
    icon: 'people',
    iconBackground: '#EFF8FF',
    iconColor: '#2E90FA',
    selected: false,
  },
  {
    id: '4',
    type: 'warning',
    label: 'Bài viết',
    icon: 'document',
    iconBackground: '#FFFAEB',
    iconColor: '#F79009',
    selected: false,
  },
  {
    id: '5',
    type: 'alert',
    label: 'Khách hàng',
    icon: 'person',
    iconBackground: '#FFECED',
    iconColor: '#ED1C24',
    selected: false,
  },
];

// Component hiển thị từng thông báo riêng lẻ
const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <View style={styles.notificationItem}>
      <View style={[styles.iconContainer, { backgroundColor: notification.iconBackground }]}>
        <Ionicons name={notification.icon} size={20} color={notification.iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{notification.time}</Text>
          </View>
        </View>
        
        {notification.hasAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={notification.actionHandler}
          >
            <Text style={styles.actionText}>{notification.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Component hiển thị từng item trong bộ lọc
const FilterItem = ({ filter, onPress }: { filter: FilterOption, onPress: () => void }) => {
  return (
    <TouchableOpacity 
      style={styles.filterItem}
      onPress={onPress}
    >
      <View style={[styles.filterIconContainer, { backgroundColor: filter.iconBackground }]}>
        <Ionicons name={filter.icon} size={20} color={filter.iconColor} />
      </View>
      <Text style={styles.filterLabel}>{filter.label}</Text>
    </TouchableOpacity>
  );
};

export default function NotificationScreen() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>(filterOptions);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(notifications);
  
  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const drawerTranslateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Animation timing
  const ANIMATION_DURATION = 300;

  // Hiển thị/ẩn bộ lọc với animation
  const toggleFilterModal = () => {
    if (isFilterVisible) {
      // Ẩn
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(drawerTranslateY, {
          toValue: Dimensions.get('window').height,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsFilterVisible(false);
      });
    } else {
      // Hiển thị
      setIsFilterVisible(true);
    }
  };

  // Khi modal được hiển thị, bắt đầu animation
  useEffect(() => {
    if (isFilterVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(drawerTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFilterVisible]);

  // Xử lý khi chọn một bộ lọc
  const handleFilterSelect = (filterId: string) => {
    const updatedFilters = filters.map(filter => {
      if (filter.id === filterId) {
        return { ...filter, selected: !filter.selected };
      }
      return filter;
    });
    setFilters(updatedFilters);
    
    // Lọc danh sách thông báo dựa trên bộ lọc được chọn
    // Đây là logic đơn giản, bạn có thể tùy chỉnh theo nhu cầu thực tế
    const selectedFilterTypes = updatedFilters
      .filter(filter => filter.selected)
      .map(filter => filter.type);
    
    if (selectedFilterTypes.length === 0) {
      // Nếu không có bộ lọc nào được chọn, hiển thị tất cả
      setFilteredNotifications(notifications);
    } else {
      // Nếu có bộ lọc được chọn, lọc theo loại tương ứng
      const filtered = notifications.filter(notification => 
        selectedFilterTypes.includes(notification.type));
      setFilteredNotifications(filtered);
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
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <TouchableOpacity onPress={toggleFilterModal}>
            <Ionicons name="filter" size={24} color="#7B7D9D" />
          </TouchableOpacity>
        </View>
        
        {/* Danh sách thông báo */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.notificationsContainer}>
            {filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            {filteredNotifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có thông báo nào phù hợp</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Modal bộ lọc với animation tùy chỉnh */}
        {isFilterVisible && (
          <View style={styles.modalContainer}>
            {/* Backdrop với hiệu ứng fade */}
            <Animated.View 
              style={[
                styles.modalBackdrop,
                { opacity: backdropOpacity }
              ]}
            >
              <Pressable 
                style={StyleSheet.absoluteFill}
                onPress={toggleFilterModal}
              />
            </Animated.View>
            
            {/* Drawer với hiệu ứng slide up */}
            <Animated.View 
              style={[
                styles.filterContainer,
                { transform: [{ translateY: drawerTranslateY }] }
              ]}
            >
              {/* Thanh kéo */}
              <View style={styles.dragIndicator} />
              
              {/* Tiêu đề */}
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Lọc thông báo</Text>
              </View>
              
              {/* Danh sách bộ lọc */}
              <View style={styles.filterList}>
                {filters.map((filter) => (
                  <FilterItem 
                    key={filter.id} 
                    filter={filter} 
                    onPress={() => handleFilterSelect(filter.id)} 
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111927',
  },
  notificationsContainer: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 8,
  },
  textContainer: {
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#27273E',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#7B7D9D',
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9394B0',
  },
  actionButton: {
    borderWidth: 0.5,
    borderColor: '#ED1C24',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#ED1C24',
  },
  // Styles cho bộ lọc
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(39, 39, 62, 0.3)',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111927',
  },
  filterList: {
    padding: 16,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  filterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27273E',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7B7D9D',
  },
}); 