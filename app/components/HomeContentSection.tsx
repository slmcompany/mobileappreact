import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import ContentGallery from './ContentGallery';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HomeContentSectionProps {
  title?: string;
  userId?: number;
  maxItems?: number;
  cardStyle?: 'minimal' | 'standard' | 'full';
  showViewAll?: boolean;
  viewAllPath?: string;
}

const HomeContentSection = ({
  title = 'Bài viết mới nhất',
  userId = 4,
  maxItems = 5,
  cardStyle = 'minimal',
  showViewAll = true,
  viewAllPath = '/(tabs)/gallery'
}: HomeContentSectionProps) => {
  const router = useRouter();

  const navigateToViewAll = () => {
    router.push(viewAllPath as any);
  };

  return (
    <View style={styles.contentSection}>
      <View style={styles.titleContainer}>
        <Text style={styles.contentSectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={navigateToViewAll}
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#ED1C24" />
          </TouchableOpacity>
        )}
      </View>
      
      <ContentGallery 
        userId={userId}
        showTitle={false}
        horizontal={true}
        cardStyle={cardStyle}
        detailInModal={true}
        maxItems={maxItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentSection: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  contentSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#ED1C24',
    marginRight: 4,
  },
});

export default HomeContentSection; 