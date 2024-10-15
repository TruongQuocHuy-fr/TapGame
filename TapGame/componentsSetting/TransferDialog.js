import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransferDialog = ({ visible, onClose, onTransfer }) => {
  const [usdtInput, setUsdtInput] = useState('');
  const [vndInput, setVndInput] = useState('');
  const [isUsdtToVnd, setIsUsdtToVnd] = useState(true);

  const handleUsdtChange = (value) => {
    setUsdtInput(value);
    const usdtAmount = parseFloat(value);
    if (!isNaN(usdtAmount)) {
      setVndInput((usdtAmount * 24000).toFixed(2));
    } else {
      setVndInput('');
    }
  };

  const handleVndChange = (value) => {
    setVndInput(value);
    const vndAmount = parseFloat(value);
    if (!isNaN(vndAmount)) {
      setUsdtInput((vndAmount / 24000).toFixed(4));
    } else {
      setUsdtInput('');
    }
  };

  const handleTransfer = () => {
    if (isUsdtToVnd) {
      const usdtAmount = parseFloat(usdtInput);
      if (!isNaN(usdtAmount) && usdtAmount > 0) {
        onTransfer('USDT', usdtAmount);
        resetFields();
      } else {
        Alert.alert('Error', 'Please enter a valid USDT amount.');
      }
    } else {
      const vndAmount = parseFloat(vndInput);
      if (!isNaN(vndAmount) && vndAmount > 0) {
        onTransfer('VND', vndAmount);
        resetFields();
      } else {
        Alert.alert('Error', 'Please enter a valid VND amount.');
      }
    }
  };

  const toggleConversion = () => {
    setIsUsdtToVnd(!isUsdtToVnd);
    resetFields();
  };

  const resetFields = () => {
    setUsdtInput('');
    setVndInput('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Transfer</Text>
          <View style={styles.inputContainer}>
            {isUsdtToVnd ? (
              <>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter USDT"
                  value={usdtInput}
                  keyboardType="numeric"
                  onChangeText={handleUsdtChange}
                />
                <TouchableOpacity onPress={toggleConversion} style={styles.iconContainer}>
                  <Ionicons name="swap-horizontal" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.amountInput}
                  placeholder="VND"
                  value={vndInput}
                  editable={false}
                />
              </>
            ) : (
              <>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter VND"
                  value={vndInput}
                  keyboardType="numeric"
                  onChangeText={handleVndChange}
                />
                <TouchableOpacity onPress={toggleConversion} style={styles.iconContainer}>
                  <Ionicons name="swap-horizontal" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.amountInput}
                  placeholder="USDT"
                  value={usdtInput}
                  editable={false}
                />
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleTransfer}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amountInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
    flex: 1,
    marginHorizontal: 5,
  },
  iconContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  buttonCancel: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransferDialog;
