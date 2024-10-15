import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const LogoutButton = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); 

  const handleLogout = async () => {
    setLoading(true);
    setTimeout(() => {
      Toast.show({
        text1: 'Logged Out',
        text2: 'You have successfully logged out.',
        type: 'success',
      });
      navigation.replace('Login'); 
      setLoading(false);
    }, 1000); 
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Logout</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LogoutButton;
