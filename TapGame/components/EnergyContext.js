import React, { createContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { auth, db } from '../ConnectFirebase/firebaseConfig';

export const EnergyContext = createContext();

export const EnergyProvider = ({ children }) => {
  const initialMaxEnergy = 3000;
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(initialMaxEnergy);
  const [maxEnergy, setMaxEnergy] = useState(initialMaxEnergy);
  const [tapValue, setTapValue] = useState(10);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalMinedCoins, setTotalMinedCoins] = useState(0);
  const [freeBoosts, setFreeBoosts] = useState(4); // Initialize freeBoosts state

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const energyDocRef = doc(db, 'energy', user.uid);
      const boostersDocRef = doc(db, 'boosters', user.uid);

      // Listener for user data changes
      const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCoins(userData.totalCoins || 0);
    //      console.log('User data updated:', userData);
        }
      });

      // Listener for energy data changes
      const unsubscribeEnergy = onSnapshot(energyDocRef, (energySnap) => {
        if (energySnap.exists()) {
          const energyData = energySnap.data();
          setEnergy(energyData.currentEnergy || initialMaxEnergy);
          setMaxEnergy(energyData.maxEnergy || initialMaxEnergy);
          setTapValue(energyData.tapValue || 10);
       //   console.log('Energy data updated:', energyData);
        }
      });

      // Listener for boosters data changes
      const unsubscribeBoosters = onSnapshot(boostersDocRef, async (boostersSnap) => {
        if (boostersSnap.exists()) {
          const boostersData = boostersSnap.data();
          setFreeBoosts(boostersData.freeBoosts || 4);
       //   console.log('Boosters data updated:', boostersData);

          // Daily reset logic
          const today = new Date().toDateString();
          const lastResetDate = await AsyncStorage.getItem('lastResetDate');

          if (lastResetDate !== today) {
            // Reset free boosts to 4
            setFreeBoosts(4);
            await AsyncStorage.setItem('lastResetDate', today); // Update the last reset date in AsyncStorage

            // Update Firestore as well
            await updateDoc(boostersDocRef, {
              freeBoosts: 4,
            });
        //    console.log('Free boosts reset to 4 in Firestore.');
          }
        }
      });

      // Cleanup listeners on unmount
      return () => {
        unsubscribeUser();
        unsubscribeEnergy();
        unsubscribeBoosters();
      };
    }
  }, [auth.currentUser]);

  // Logic for energy restoration over time
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, maxEnergy));
    }, 1000);

    return () => clearInterval(interval);
  }, [maxEnergy]);

  const addCoins = async (amount) => {
    const newCoins = coins + amount;
    setCoins(newCoins);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userDocRef, {
          totalCoins: newCoins,
        });
      //  console.log('Coins updated in Firestore:', newCoins);
      } catch (error) {
    //    console.error('Failed to update coins in Firestore:', error);
      }
    }
  };

  const spendEnergy = (amount) => {
    setEnergy((prevEnergy) => Math.max(prevEnergy - amount, 0));
  };

  return (
    <EnergyContext.Provider
      value={{
        coins,
        setCoins,
        energy,
        setEnergy,
        maxEnergy,
        setMaxEnergy,
        tapValue,
        setTapValue,
        totalCoins,
        setTotalCoins,
        totalMinedCoins,
        setTotalMinedCoins,
        addCoins,
        spendEnergy,
        freeBoosts, // Expose freeBoosts to the context
        setFreeBoosts, // Optional: expose setter if needed elsewhere
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
};
