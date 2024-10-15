import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../ConnectFirebase/firebaseConfig'; // Import Firebase config
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore'; // Thêm setDoc để lưu ví vào Firestore
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import Toast from 'react-native-toast-message'; // Import Toast

const ConnectWalletButton = ({ visible, onClose }) => {
  const [walletAddress, setWalletAddress] = useState(''); // Địa chỉ ví sẽ được lấy từ Firestore
  const [email, setEmail] = useState(''); // Khởi tạo state email
  const [walletExists, setWalletExists] = useState(false); // Trạng thái tồn tại ví
  const navigation = useNavigation(); // Sử dụng hook useNavigation

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEmail(data.email); // Lấy email từ Firestore
          } else {
            console.log('No user data found in Firestore');
          }

          // Kiểm tra ví trong Firestore
          const walletsSnapshot = await getDocs(collection(db, 'wallets'));
          walletsSnapshot.forEach((walletDoc) => {
            const walletData = walletDoc.data();
            if (walletData.userId === user.uid) {
              setWalletAddress(walletData.address); // Lấy địa chỉ ví từ Firestore
              setWalletExists(true); // Đánh dấu rằng ví đã tồn tại
            }
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user is currently logged in.');
      }
    };

    fetchUserData();
  }, []);

  const generateWalletAddress = () => {
    return '0x' + Math.random().toString(16).slice(2, 42); // Tạo địa chỉ ví
  };

  const handleConnect = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Kiểm tra ví có tồn tại hay không
        if (!walletExists) {
          const walletAddress = generateWalletAddress(); // Tạo địa chỉ ví mới
          const walletId = `wallet-${user.uid}`; // Tạo walletId duy nhất

          const walletData = {
            walletId,
            userId: user.uid,
            currency: ['USDT', 'VND'],
            balance: { USDT: 0, VND: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
            address: walletAddress,
            transactionHistory: [],
          };

          // Lưu ví vào Firestore
          await setDoc(doc(db, 'wallets', walletId), walletData);
          setWalletAddress(walletAddress); // Cập nhật địa chỉ ví cho người dùng

          // Hiển thị thông báo thành công
          Toast.show({
            text1: 'Success',
            text2: `Wallet created: ${walletAddress} with email: ${email}`,
            type: 'success',
          });
          navigation.navigate('AirdropScreen'); // Chuyển sang màn hình Airdrop
        } else {
          // Nếu ví đã tồn tại
          Toast.show({
            text1: 'Wallet Exists',
            text2: `Already connected to wallet: ${walletAddress} with email: ${email}`,
            type: 'info',
          });
          navigation.navigate('AirdropScreen'); // Chuyển sang màn hình Airdrop
        }
        onClose(); // Đóng modal
      } catch (error) {
        console.error('Error creating wallet:', error);
        Toast.show({
          text1: 'Error',
          text2: 'Failed to connect wallet.',
          type: 'error',
        });
      }
    } else {
      console.log('No user is currently logged in.');
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.input}>Wallet address: {walletAddress || 'Creating...'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            editable={false}
          />
          <TouchableOpacity style={styles.button} onPress={handleConnect}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConnectWalletButton;
