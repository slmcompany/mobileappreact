import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function StatsScreen() {
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const router = useRouter();

  const navigateToCommissionStats = () => {
    router.push('/commission-stats');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.profileName}>Tùy Phong</Text>
        <Text style={styles.profileId}>ID: AG1203</Text>
      </View>
      
      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, styles.halfCard]}>
          <Text style={styles.cardLabel}>Tổng số hợp đồng</Text>
          <Text style={styles.cardValue}>12</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.statsCard, styles.halfCard]}
          onPress={navigateToCommissionStats}
        >
          <Text style={styles.cardLabel}>Hoa hồng đã nhận</Text>
          <Text style={[styles.cardValue, styles.valueGreen]}>8.640.000</Text>
        </TouchableOpacity>
      </View>
      
      {/* List Items */}
      <TouchableOpacity style={styles.listItem}>
        <Text style={styles.listItemText}>Khách hàng tiềm năng</Text>
        <View style={styles.listItemRight}>
          <Text style={styles.listItemValue}>12 người</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.listItem}>
        <Text style={styles.listItemText}>Cộng đồng</Text>
        <View style={styles.listItemRight}>
          <Text style={styles.listItemValue}>12 thành viên</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>
      
      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <View style={styles.chartTooltip}>
          <Text style={styles.tooltipText}>3.000.000 đ</Text>
        </View>
        
        <View style={styles.chartBars}>
          {months.map((month, index) => (
            <View key={index} style={styles.barColumn}>
              <View 
                style={[
                  styles.bar, 
                  { height: index === 6 ? 170 : 50 + Math.random() * 100 },
                  index === 6 ? styles.activeBar : styles.inactiveBar
                ]} 
              />
              <Text style={styles.monthLabel}>{month}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Bottom Stats */}
      <View style={styles.bottomStats}>
        <View style={styles.statsGridRow}>
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.orangeIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Hợp đồng tháng này</Text>
              <Text style={styles.statCardValue}>02</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.blueIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Thu nhập dự kiến</Text>
              <Text style={styles.statCardValue}>12.650.000</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsGridRow}>
          <View style={[styles.statCard, styles.gridCard]}>
            <View style={[styles.statCardIndicator, styles.grayIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Tổng số hợp đồng</Text>
              <Text style={styles.statCardValue}>12</Text>
              <TouchableOpacity style={styles.circleArrow}>
                <Text style={styles.circleArrowText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.gridCard]}
            onPress={navigateToCommissionStats}
          >
            <View style={[styles.statCardIndicator, styles.greenIndicator]} />
            <View style={styles.statCardContent}>
              <Text style={styles.statCardLabel}>Hoa hồng đã nhận</Text>
              <Text style={styles.statCardValue}>8.640.000</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffc5c5',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileId: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  halfCard: {
    flex: 0.48,
  },
  cardLabel: {
    fontSize: 14,
    color: '#444',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066ff',
    marginTop: 5,
  },
  valueGreen: {
    color: '#00aa00',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    paddingBottom: 30,
    paddingTop: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chartTooltip: {
    position: 'absolute',
    top: 50,
    left: '55%',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  activeBar: {
    backgroundColor: '#ff0000',
  },
  inactiveBar: {
    backgroundColor: '#ffcccc',
  },
  monthLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  bottomStats: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  gridCard: {
    flex: 0.48,
  },
  statCardIndicator: {
    width: 8,
  },
  orangeIndicator: {
    backgroundColor: '#ff9900',
  },
  blueIndicator: {
    backgroundColor: '#0066cc',
  },
  grayIndicator: {
    backgroundColor: '#999999',
  },
  greenIndicator: {
    backgroundColor: '#00aa00',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    flex: 1,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  circleArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  circleArrowText: {
    fontSize: 14,
    color: '#666',
  },
}); 