import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const AwardSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Awards</Text>
      
      <View style={styles.awardCard}>
        <Image 
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfR5j5X6LKa5CQu6PhHVrFp0mW5QNLzkV05_jg2KKdFas280QJqc88Jz_Thj1VYqR6IUU&usqp=CAU' }} 
          style={styles.awardBadge}
        />
        <View style={styles.awardDetails}>
          <Text style={styles.awardText}>Elite member</Text>
          <View style={styles.rewardRow}>
            <MaterialCommunityIcons name="cash" size={24} color="gold" />
            <Text style={styles.rewardAmount}>+50,000</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  awardCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  awardBadge: {
    width: 80,
    height: 80,
  },
  awardDetails: {
    marginLeft: 15,
  },
  awardText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rewardAmount: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default AwardSection;
