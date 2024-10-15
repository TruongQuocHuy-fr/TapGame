import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnergyContext } from './EnergyContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../ConnectFirebase/firebaseConfig';

const BoostScreen = ({ navigation }) => {
  const { coins, setCoins, maxEnergy, setMaxEnergy, tapValue, setTapValue } = useContext(EnergyContext);

  const [freeBoosts, setFreeBoosts] = useState(4);
  const [multitapLevel, setMultitapLevel] = useState(1);
  const [energyLimitLevel, setEnergyLimitLevel] = useState(1);
  
  const [multitapUpgradeCost, setMultitapUpgradeCost] = useState(1000);
  const [energyLimitUpgradeCost, setEnergyLimitUpgradeCost] = useState(1500);

  useEffect(() => {
    const loadBoosters = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'boosters', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const boosterData = userSnap.data();
            setMultitapLevel(boosterData.multitapLevel || 1);
            setEnergyLimitLevel(boosterData.energyLimitLevel || 1);
            setMultitapUpgradeCost(boosterData.multitapUpgradeCost || 1000);
            setEnergyLimitUpgradeCost(boosterData.energyLimitUpgradeCost || 1500);
            setFreeBoosts(boosterData.freeBoosts || 4);
          } else {
            console.log('No booster data found in Firestore.');
          }
        } catch (error) {
          console.error('Error fetching booster data from Firestore:', error);
        }
      }
    };

    loadBoosters();
  }, []);

  const handleMultitapUpgrade = async () => {
    if (coins >= multitapUpgradeCost) {
      try {
        const newMultitapLevel = multitapLevel + 1;
        setCoins(coins - multitapUpgradeCost);
        setTapValue(tapValue + 10);
        setMultitapLevel(newMultitapLevel);
        const newMultitapUpgradeCost = Math.floor(multitapUpgradeCost * 1.5);
        setMultitapUpgradeCost(newMultitapUpgradeCost);

        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'boosters', user.uid);
          await updateDoc(userDocRef, {
            multitapLevel: newMultitapLevel,
            multitapUpgradeCost: newMultitapUpgradeCost,
          });
          Alert.alert(`Multitap Upgrade Purchased! (Level ${newMultitapLevel}).`);
          console.log('Multitap upgraded:', newMultitapLevel);
        }
      } catch (error) {
        console.error('Failed to update multitap boosters in Firestore:', error);
        Alert.alert('Error', 'Failed to update multitap boosters. Please try again.');
      }
    } else {
      Alert.alert('Not enough coins!');
    }
  };

  const handleEnergyLimitUpgrade = async () => {
    if (coins >= energyLimitUpgradeCost) {
      try {
        const newEnergyLimitLevel = energyLimitLevel + 1;
        setCoins(coins - energyLimitUpgradeCost);
        setMaxEnergy(maxEnergy + 500);
        setEnergyLimitLevel(newEnergyLimitLevel);
        const newEnergyLimitUpgradeCost = Math.floor(energyLimitUpgradeCost * 1.5);
        setEnergyLimitUpgradeCost(newEnergyLimitUpgradeCost);

        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'boosters', user.uid);
          await updateDoc(userDocRef, {
            energyLimitLevel: newEnergyLimitLevel,
            energyLimitUpgradeCost: newEnergyLimitUpgradeCost,
          });
          Alert.alert(`Energy Limit Upgrade Purchased! Max energy is now ${maxEnergy + 500}.`);
          console.log('Energy limit upgraded:', newEnergyLimitLevel);
        }
      } catch (error) {
        console.error('Failed to update energy limit boosters in Firestore:', error);
        Alert.alert('Error', 'Failed to update energy limit. Please try again.');
      }
    } else {
      Alert.alert('Not enough coins!');
    }
  };

  const handleFreeBoost = async () => {
    if (freeBoosts > 0) {
      setMaxEnergy(maxEnergy); // Refill energy to the maximum
      setFreeBoosts(freeBoosts - 1); // Deduct one free boost

      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'boosters', user.uid);
          await updateDoc(userDocRef, {
            freeBoosts: freeBoosts - 1,
          });
          Alert.alert('Energy refilled to maximum using free boost!');
          console.log('Free boost used. Remaining:', freeBoosts - 1);
        } catch (error) {
          console.error('Failed to update free boosts in Firestore:', error);
          Alert.alert('Error', 'Failed to use free boost. Please try again.');
        }
      }
    } else {
      Alert.alert('No free boosts left today!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>Your balance</Text>
      <Text style={styles.coins}>
        <Ionicons name="cash-outline" size={24} color="gold" /> ₵ {coins.toLocaleString()}
      </Text>

      <TouchableOpacity style={styles.boosterButton} onPress={handleFreeBoost}>
        <Ionicons name="flash-outline" size={24} color="orange" />
        <Text style={styles.boosterText}>Free Boost (Refill Energy)</Text>
        <Text style={styles.boosterCount}>{freeBoosts}/4 available</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boosterButton} onPress={handleMultitapUpgrade}>
        <Ionicons name="hand-left-outline" size={24} color="blue" />
        <Text style={styles.boosterText}>Multitap (+{tapValue} tap max)</Text>
        <Text style={styles.boosterLevel}>Level: {multitapLevel}</Text>
        <Text style={styles.boosterCost}>₵ {multitapUpgradeCost}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boosterButton} onPress={handleEnergyLimitUpgrade}>
        <Ionicons name="battery-full-outline" size={24} color="green" />
        <Text style={styles.boosterText}>Energy limit (+{maxEnergy})</Text>
        <Text style={styles.boosterLevel}>Level: {energyLimitLevel}</Text>
        <Text style={styles.boosterCost}>₵ {energyLimitUpgradeCost}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    padding: 20,
    alignItems: 'center',
  },
  balance: {
    fontSize: 18,
    color: '#888',
    marginVertical: 10,
  },
  coins: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  boosterButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  boosterText: {
    fontSize: 18,
    color: '#333',
  },
  boosterLevel: {
    fontSize: 14,
    color: '#777',
  },
  boosterCost: {
    fontSize: 18,
    color: '#333',
  },
  boosterCount: {
    fontSize: 14,
    color: '#777',
  },
  backButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default BoostScreen;
