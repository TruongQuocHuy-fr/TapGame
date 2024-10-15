import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AwardSection from '../componentsMission/AwardSection';
import DailyRewardScreen from '../componentsMission/DailyRewardScreen';



const MissionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mission</Text>
      <Text style={styles.subHeader}>Complete mission to get bonuses</Text>

      {/* Your Awards Section */}
      <AwardSection />

      {/* Daily Rewards Section */}
      <DailyRewardScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
});

export default MissionScreen;
