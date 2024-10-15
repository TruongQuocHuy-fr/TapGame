import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { EnergyContext } from '../components/EnergyContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../componentsAuth/AuthService';
import MissionService from '../ConnectFirebase/MissionService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../ConnectFirebase/firebaseConfig';

const levelRewards = [
  { level: 1, reward: 5000, icon: 'star' },
  { level: 5, reward: 10000, icon: 'stars' },
  { level: 10, reward: 30000, icon: 'military-tech' },
  { level: 20, reward: 50000, icon: 'whatshot' },
  { level: 50, reward: 120000, icon: 'flash-on' },
  { level: 100, reward: 700000, icon: 'emoji-events' },
];

const DailyRewardScreen = () => {
  const { coins, setCoins } = useContext(EnergyContext);
  const [loginDays, setLoginDays] = useState(0);
  const [eliteRewardGiven, setEliteRewardGiven] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [level, setLevel] = useState(1);
  const [claimedRewards, setClaimedRewards] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm biến trạng thái loading

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setUserId(user.uid);

        // Lấy thông tin cấp độ từ bảng users
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLevel(userData.level || 1); // Lấy cấp độ người dùng từ bảng users
        }

        // Lấy thông tin từ Firestore
        const loginDoc = doc(db, 'login_info', user.uid);
        const loginSnapshot = await getDoc(loginDoc);

        if (loginSnapshot.exists()) {
          const loginData = loginSnapshot.data();
          setLoginDays(loginData.loginDays || 0);
          setEliteRewardGiven(loginData.eliteRewardGiven || false);

          const lastLoginDate = loginData.lastDailyRewardClaimed?.toDate()?.toDateString();
          const today = new Date().toDateString();
          setCanClaim(lastLoginDate !== today);
        }

        // Lấy phần thưởng đã nhận từ Firestore
        const claimsSnapshot = await getDoc(doc(db, 'claimed_rewards', user.uid));
        if (claimsSnapshot.exists()) {
          setClaimedRewards(claimsSnapshot.data());
        } else {
          // Khởi tạo trạng thái phần thưởng nếu chưa tồn tại
          await setDoc(doc(db, 'claimed_rewards', user.uid), {}, { merge: true });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false); // Đặt loading là false sau khi dữ liệu đã được tải xong
      }
    };

    loadData();
  }, []);

  const saveData = async () => {
    await setDoc(doc(db, 'login_info', userId), {
      loginDays,
      eliteRewardGiven,
      lastDailyRewardClaimed: canClaim ? new Date() : null,
      level,
    }, { merge: true });

    await setDoc(doc(db, 'claimed_rewards', userId), claimedRewards, { merge: true }); // Lưu trạng thái phần thưởng
  };

  useEffect(() => {
    if (userId) {
      saveData();
    }
  }, [loginDays, eliteRewardGiven, claimedRewards, level]);

  const handleClaimDailyReward = async () => {
    if (!canClaim) {
      Alert.alert('You have already claimed today’s reward!');
      return;
    }

    let reward = 50;

    if (loginDays + 1 === 7) {
      reward += 500; // Elite bonus
      setEliteRewardGiven(true);
      Alert.alert('Congratulations! You have received the Elite Member gift!');
    }

    try {
      setCoins(coins + reward);
      await AuthService.updateUserCoinsAndLevel(userId, coins + reward, level, reward);

      const missions = await MissionService.getUserMissions(userId);
      const dailyLoginMission = missions.find(mission => mission.title === 'Daily Login');
      if (dailyLoginMission && !dailyLoginMission.isCompleted) {
        await MissionService.completeUserMission(userId, dailyLoginMission.id);
      }

      setLoginDays(prev => prev + 1);
      await setDoc(doc(db, 'login_info', userId), {
        lastDailyRewardClaimed: new Date()
      }, { merge: true });

      setCanClaim(false);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
    }
  };

  const handleClaimLevelReward = async (rewardLevel) => {
    // Kiểm tra xem phần thưởng đã được nhận chưa
    if (claimedRewards[rewardLevel]) {
      Alert.alert('Reward already claimed!');
      return;
    }

    // Kiểm tra cấp độ người dùng
    if (level < rewardLevel) {
      Alert.alert(`You need to reach level ${rewardLevel} to claim this reward!`);
      return;
    }

    const reward = levelRewards.find((r) => r.level === rewardLevel)?.reward || 0;
    if (reward) {
      setCoins(coins + reward);
      setClaimedRewards((prev) => ({ ...prev, [rewardLevel]: true })); // Đánh dấu là đã nhận phần thưởng

      // Cập nhật Firestore với phần thưởng đã nhận
      await setDoc(doc(db, 'claimed_rewards', userId), { [rewardLevel]: true }, { merge: true });

      Alert.alert(`You have claimed ${reward} coins for reaching level ${rewardLevel}!`);
      await AuthService.updateUserCoinsAndLevel(userId, coins + reward, level);
    } else {
      Alert.alert('Reward not found for this level!');
    }
  };

  if (loading) {
    // Hiển thị trạng thái loading khi đang tải dữ liệu
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Daily Rewards</Text>
      <Text style={styles.subtitle}>
        {loginDays + 1 === 7 ? 'Elite Gift: 550 Coins!' : `Day ${loginDays + 1} Reward: 50 Coins`}
      </Text>

      <TouchableOpacity
        style={[styles.claimButton, !canClaim && styles.disabledButton]}
        onPress={handleClaimDailyReward}
        disabled={!canClaim}
      >
        <Text style={styles.claimButtonText}>{canClaim ? 'Claim Reward' : 'Already Claimed'}</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Log in every day to receive coins. On the 7th day, you will get an additional Elite Member reward of 500 coins!
      </Text>

      <Text style={styles.title}>Level-Based Rewards</Text>
      {levelRewards.map((reward) => (
        <View key={reward.level} style={styles.rewardRow}>
          <Icon name={reward.icon} size={30} color="#FFD700" style={styles.icon} />
          <Text style={styles.rewardText}>
            Reach Level {reward.level}: {reward.reward} Coins
          </Text>
          <TouchableOpacity
            style={[styles.claimButton, claimedRewards[reward.level] && styles.disabledButton]}
            onPress={() => handleClaimLevelReward(reward.level)}
            disabled={claimedRewards[reward.level] || level < reward.level}
          >
            <Text style={styles.claimButtonText}>
              {claimedRewards[reward.level] ? 'Claimed' : level >= reward.level ? 'Claim' : 'Locked'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFD700',
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: "center",
  },
  info: {
    marginTop: 20,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 10,
  },
  rewardText: {
    fontSize: 18,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default DailyRewardScreen;
