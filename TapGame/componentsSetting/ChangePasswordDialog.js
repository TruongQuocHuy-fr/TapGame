import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; // Nhập khẩu Firestore
import { getAuth } from 'firebase/auth'; // Nhập khẩu Authentication
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message'; // Import thư viện Toast

const ChangePasswordDialog = ({ visible, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // Trạng thái cho New Password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Trạng thái cho Confirm Password

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords don't match.");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setErrorMessage('User is not authenticated. Please log in.');
      return;
    }
  
    const db = getFirestore(); // Lấy Firestore
    const userDocRef = doc(db, 'users', user.uid); // Truy cập tài liệu người dùng trong Firestore
  
    try {
      setLoading(true); // Bắt đầu trạng thái tải
  
      // Cập nhật trường password trong Firestore
      await updateDoc(userDocRef, { password: newPassword });
      
      Toast.show({
        text1: 'Success',
        text2: 'Password changed successfully!',
        type: 'success',
      });
  
      // Đợi một chút trước khi đóng hộp thoại
      setTimeout(() => {
        onClose();
      }, 2000); // Thay đổi thời gian nếu cần
  
    } catch (error) {
      console.log('Error changing password:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false); // Kết thúc trạng thái tải
    }
  };  

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Change Password</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} style={styles.lockIcon} />
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.iconContainer}>
            <Icon name={showNewPassword ? 'visibility' : 'visibility-off'} size={24} />
          </TouchableOpacity>
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} style={styles.lockIcon} />
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconContainer}>
            <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={24} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.changeButton} onPress={handleChangePassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  lockIcon: {
    padding: 10,
    color: '#ccc',
  },
  iconContainer: {
    justifyContent: 'center',
    padding: 10,
  },
  changeButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChangePasswordDialog;
