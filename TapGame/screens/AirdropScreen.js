import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { auth, db } from '../ConnectFirebase/firebaseConfig';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import RechargeDialog from '../componentsSetting/RechargeDialog'; 
import TransferDialog from '../componentsSetting/TransferDialog'; 
import Toast from 'react-native-toast-message'; // Import Toast

const AirdropScreen = () => {
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [vndAmount, setVndAmount] = useState(0);
  const [userData, setUserData] = useState({});
  const [currency, setCurrency] = useState('USDT');
  const [walletAddress, setWalletAddress] = useState('');
  const [showAmount, setShowAmount] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData({
            avatar: data.avatar,
            username: data.username,
            email: data.email,
          });
          setTotalCoins(data.totalCoins || 0);

          const walletDocRef = doc(db, 'wallets', `wallet-${user.uid}`);
          const walletDocSnap = await getDoc(walletDocRef);
          if (walletDocSnap.exists()) {
            const walletData = walletDocSnap.data();
            setWalletAddress(walletData.address);
            setUsdtAmount(walletData.balance.USDT || 0);
            setVndAmount(walletData.balance.VND || 0);
            setTransactionHistory(walletData.transactionHistory || []);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Wallet data not found.',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'User data not found.',
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleRecharge = async (coinAmount) => {
    const newUsdtAmount = usdtAmount + (coinAmount / 1000) * 0.0002;
    setUsdtAmount(newUsdtAmount);

    const user = auth.currentUser;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { totalCoins: totalCoins - coinAmount }, { merge: true });

    const walletDocRef = doc(db, 'wallets', `wallet-${user.uid}`);
    await setDoc(walletDocRef, { balance: { USDT: newUsdtAmount, VND: vndAmount } }, { merge: true });

    const transactionData = {
      type: 'Recharge',
      amount: coinAmount,
      currency: 'USDT',
      date: new Date(),
    };

    await setDoc(walletDocRef, { transactionHistory: arrayUnion(transactionData) }, { merge: true });
    setTransactionHistory([...transactionHistory, transactionData]);
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: `Recharged ${coinAmount} coins to ${newUsdtAmount.toFixed(4)} USDT successfully.`,
    });
  };

  const handleTransfer = async (currencyType, amount) => {
    const user = auth.currentUser;
    const walletDocRef = doc(db, 'wallets', `wallet-${user.uid}`);

    if (currencyType === 'USDT') {
      if (amount > 0 && amount <= usdtAmount) {
        const newUsdtAmount = usdtAmount - amount;
        const newVndAmount = vndAmount + amount * 24000;
        setUsdtAmount(newUsdtAmount);
        setVndAmount(newVndAmount);

        await setDoc(walletDocRef, { balance: { USDT: newUsdtAmount, VND: newVndAmount } }, { merge: true });

        const transactionData = {
          type: 'Transfer to VND',
          amount,
          currency: 'USDT',
          date: new Date(),
        };

        await setDoc(walletDocRef, { transactionHistory: arrayUnion(transactionData) }, { merge: true });
        setTransactionHistory([...transactionHistory, transactionData]);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Transferred ${amount} USDT to VND successfully.`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid USDT amount.',
        });
      }
    } else {
      if (amount > 0 && amount <= vndAmount) {
        const newVndAmount = vndAmount - amount;
        const newUsdtAmount = usdtAmount + amount / 24000;
        setVndAmount(newVndAmount);
        setUsdtAmount(newUsdtAmount);

        await setDoc(walletDocRef, { balance: { USDT: newUsdtAmount, VND: newVndAmount } }, { merge: true });

        const transactionData = {
          type: 'Transfer to USDT',
          amount,
          currency: 'VND',
          date: new Date(),
        };

        await setDoc(walletDocRef, { transactionHistory: arrayUnion(transactionData) }, { merge: true });
        setTransactionHistory([...transactionHistory, transactionData]);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Transferred ${amount} VND to USDT successfully.`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid VND amount.',
        });
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: userData.avatar }} style={styles.avatar} />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          <Text style={styles.walletAddress}>Wallet Address: {walletAddress || 'Not connected'}</Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Total Balance</Text>
          <TouchableOpacity onPress={() => setShowAmount(!showAmount)}>
            <Ionicons name={showAmount ? 'eye' : 'eye-off'} size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.balanceAmount}>
            {showAmount ? (currency === 'USDT' ? usdtAmount.toFixed(4) : vndAmount.toFixed(2)) : '****'}
          </Text>
          <Picker
            selectedValue={currency}
            onValueChange={(itemValue) => setCurrency(itemValue)}
            style={styles.picker}
            dropdownIconColor="black"
          >
            <Picker.Item label="USDT" value="USDT" />
            <Picker.Item label="VND" value="VND" />
          </Picker>
        </View>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.icon} onPress={() => setShowRechargeDialog(true)}>
          <Text style={styles.iconText}>💳</Text>
          <Text style={styles.iconLabel}>Recharge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => setShowTransferDialog(true)}>
          <Text style={styles.iconText}>➡️</Text>
          <Text style={styles.iconLabel}>Transfer</Text>
        </TouchableOpacity>
      </View>

      <RechargeDialog
        visible={showRechargeDialog}
        onClose={() => setShowRechargeDialog(false)}
        onRecharge={handleRecharge}
        totalCoins={totalCoins}
      />

      <TransferDialog
        visible={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        onTransfer={handleTransfer}
      />

      <View style={styles.transactionHistory}>
        <Text style={styles.transactionTitle}>Transaction History</Text>
        {transactionHistory.length === 0 ? (
          <Text style={styles.emptyMessage}>No transactions found.</Text>
        ) : (
          transactionHistory.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDate}>{transaction.date.toLocaleString()}</Text>
                <Text style={styles.transactionType}>{transaction.type}</Text>
              </View>
              <Text style={styles.transactionAmount}>
                {transaction.type === 'Recharge' ? 
                  `Recharge: ${transaction.amount} coins` : 
                  `Transfer: ${transaction.amount} ${transaction.currency}`
                }
              </Text>
            </View>
          ))
        )}
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  userDetails: {
    flexDirection: 'column',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  walletAddress: {
    fontSize: 14,
    color: '#007BFF',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 10,
  },
  iconText: {
    fontSize: 24,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  transactionHistory: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
  },
  transactionItem: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionDate: {
    fontSize: 12,
    color: 'gray',
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionAmount: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
});

export default AirdropScreen;
