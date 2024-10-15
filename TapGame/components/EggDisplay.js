import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyContext } from './EnergyContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import AuthService from '../componentsAuth/AuthService';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import the local images from the assets directory
const coinImage = require('../assets/coin.png'); // Path to your coin image
const eggImage = require('../assets/chicken.png'); // Path to your chicken image
const rocketImage = require('../assets/rocket_1f680.png'); // Path to your rocket image (ensure correct format)

const EggDisplay = () => {
  const { coins, addCoins, energy, spendEnergy, maxEnergy, tapValue } = useContext(EnergyContext);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [showBonusEffect, setShowBonusEffect] = useState(false);
  const [bonusCoinAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setUserId(user.uid);
      } catch (error) {
     //   console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const triggerBonusEffect = () => {
    Animated.timing(bonusCoinAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      bonusCoinAnimation.setValue(0);
      setShowBonusEffect(false);
    });
  };

  const handleEggTap = async () => {
    setTapCount(prev => prev + 1);

    if (energy >= tapValue) {
      let newTotalCoins = coins + tapValue;

      addCoins(tapValue);
      spendEnergy(tapValue);
      setShowBonusEffect(true);
      triggerBonusEffect();

      if (tapCount + 1 === 5) {
        const bonusCoins = 20;
        newTotalCoins += bonusCoins;
        addCoins(bonusCoins);
        setTapCount(0);
      }

      if (userId) {
        try {
          await AuthService.updateUserCoinsAndLevel(userId, newTotalCoins, 1, tapValue);
       //   console.log('User coins updated on tap:', newTotalCoins);
        } catch (error) {
       //   console.error('Error updating user coins:', error);
        }
      }
    } else {
      alert('Not enough energy!');
    }
  };

  useEffect(() => {
    if (tapCount > 0) {
      const timeoutId = setTimeout(() => {
        setTapCount(0);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [tapCount]);

  const handleBoost = () => {
    navigation.navigate('BoostScreen');
  };

  const coinFlyStyle = {
    position: 'absolute',
    top: 160,
    left: '50%',
    marginLeft: -25,
    transform: [
      {
        translateY: bonusCoinAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -200],
        }),
      },
      {
        scale: bonusCoinAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.5],
        }),
      },
    ],
    opacity: bonusCoinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Energy</Text>
          <Text style={styles.statValue}>{energy}/{maxEnergy}</Text>
        </View>
      </View>

      <View style={styles.coinsContainer}>
        <Icon name="monetization-on" size={30} color="gold" />
        <Text style={styles.coins}>{coins}</Text>
      </View>

      <TouchableOpacity onPress={handleEggTap} activeOpacity={0.7}>
        <LinearGradient
          colors={['#00c6ff', '#0072ff']}
          style={styles.roundedImageContainer}
        >
          {/* Use the local egg image here */}
          <Image
            source={eggImage} 
            style={styles.roundedImage}
          />
        </LinearGradient>
      </TouchableOpacity>

      {showBonusEffect && (
        <Animated.View style={[coinFlyStyle]}>
          <Image
            source={coinImage}
            style={styles.coinImage}
          />
        </Animated.View>
      )}

      <Animatable.View animation="pulse" iterationCount="infinite" direction="alternate" style={styles.boostButtonContainer}>
        <TouchableOpacity style={styles.boostButton} onPress={handleBoost}>
          <Image
            source={rocketImage}
            style={styles.boostImage}
          />
          <Text style={styles.boostText}>Boost</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '40%',
  },
  statLabel: {
    fontSize: 16,
    color: '#555',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  coins: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  roundedImageContainer: {
    width: 220,
    height: 220,
    borderRadius: 20,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundedImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  boostButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  boostButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 5,
  },
  boostImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  boostText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinImage: {
    width: 50,
    height: 50,
  },
});

export default EggDisplay;
