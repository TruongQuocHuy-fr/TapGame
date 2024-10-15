import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { EnergyContext } from './EnergyContext';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../ConnectFirebase/firebaseConfig';

// Import a fallback image to use when no avatar is available
const defaultAvatar = require('../assets/defaultAvatar.png'); // Path to your default avatar image

const UserInfo = () => {
  const { totalMinedCoins, setTotalMinedCoins } = useContext(EnergyContext);
  const [profile, setProfile] = useState({ avatar: '', characterName: '' });
  const [level, setLevel] = useState(0);
  const [progress] = useState(new Animated.Value(0)); // Initialize Animated.Value for progress bar
  const maxLevel = 100;

  const coinsNeededForLevel = useCallback((level) => {
    return level === 0 ? 1000 : Math.floor(1000 * Math.pow(1.5, level));
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    let unsubscribe;

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile({
            avatar: userData.avatar || '',
            characterName: userData.characterName || 'No Name Provided',
          });
          setTotalMinedCoins(userData.totalMinedCoins || 0);
          setLevel(userData.level || 0);
        } else {
        //  console.log('No user data found in Firestore');
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setTotalMinedCoins]);

  useEffect(() => {
    const calculateLevelAndProgress = () => {
      let currentLevel = level;

      // Calculate new level based on total mined coins
      while (currentLevel < maxLevel && totalMinedCoins >= coinsNeededForLevel(currentLevel)) {
        currentLevel++;
      }

      // Update level only if there is a change
      if (currentLevel !== level) {
        setLevel(currentLevel);
        const user = auth.currentUser;

        if (user) {
          const docRef = doc(db, 'users', user.uid);
          updateDoc(docRef, { level: currentLevel });
          
          // Reset progress bar to 0 when leveling up
          progress.setValue(0); 
        }
      }

      // Calculate coins needed for next level
      const coinsNeededForNextLevel = coinsNeededForLevel(currentLevel + 1);
      const coinsNeededForThisLevel = coinsNeededForLevel(currentLevel);
      const coinsNeededForRankup = Math.max(0, coinsNeededForNextLevel - totalMinedCoins);

      // Update progress bar based on coins needed for rank up
      const progressPercent = coinsNeededForRankup > 0 
        ? ((coinsNeededForThisLevel - coinsNeededForRankup) / coinsNeededForThisLevel) * 100 
        : 100; // If no coins are needed, it's at 100%

      // Run animation for progress bar from 0 to progressPercent
      Animated.timing(progress, {
        toValue: progressPercent,
        duration: 1000, // Duration for animation
        useNativeDriver: false,
      }).start();
    };

    calculateLevelAndProgress();
  }, [totalMinedCoins, level, coinsNeededForLevel, progress]);

  return (
    <View style={styles.container}>
      {/* Use fallback image if avatar is not provided */}
      <Image 
        source={profile.avatar ? { uri: profile.avatar } : defaultAvatar} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{profile.characterName}</Text>
        <Text style={styles.rankupText}>
          {totalMinedCoins < coinsNeededForLevel(level + 1) 
            ? `${coinsNeededForLevel(level + 1) - totalMinedCoins} coins to rank up`
            : 'Max level reached!'}
        </Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progress, { width: progress.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }) }]} />
        </View>
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>LV{level}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankupText: {
    fontSize: 12,
    color: '#888',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  levelBadge: {
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 10,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserInfo;
