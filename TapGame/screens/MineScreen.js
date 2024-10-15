import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ProfileInfo from '../componentsSetting/ProfileInfo';
import ChangeInfoButton from '../componentsSetting/ChangeInfoButton';
import LogoutButton from '../componentsSetting/LogoutButton';
import ConnectWalletButton from '../componentsSetting/ConnectWalletButton'; 
import ChangePasswordDialog from '../componentsSetting/ChangePasswordDialog'; // Import the ChangePasswordDialog
import { auth, db } from '../ConnectFirebase/firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';

const MineScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isChangePasswordVisible, setChangePasswordVisible] = useState(false); // State for Change Password dialog

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No user data found in Firestore');
          }
        } else {
          console.log('No user is currently logged in.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserProfile();
  }, []);

  const handleConnectWallet = () => {
    navigation.navigate('AirdropScreen'); // Navigate to AirdropScreen
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <ProfileInfo avatar={userData.avatar} name={userData.username} email={userData.email} />
      ) : (
        <ProfileInfo avatar="" name="Loading..." email="Loading..." />
      )}
      
      <ChangeInfoButton />
      <TouchableOpacity style={styles.connectButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.connectButtonText}>Connect Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.connectButton} onPress={() => setChangePasswordVisible(true)}>
        <Text style={styles.connectButtonText}>Change Password</Text>
      </TouchableOpacity>

      <ConnectWalletButton 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onConnect={handleConnectWallet} // Pass the navigation function
      />
      
      <ChangePasswordDialog 
        visible={isChangePasswordVisible} 
        onClose={() => setChangePasswordVisible(false)} // Close dialog
      />

      <LogoutButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', 
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#007BFF', 
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MineScreen;
