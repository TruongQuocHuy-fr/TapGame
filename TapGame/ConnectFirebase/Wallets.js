import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Nhập db từ firebaseConfig

// Hàm để tạo ví mới cho người dùng
const createWallet = async (userId, walletAddress) => {
  const walletId = `wallet-${userId}`; // Tạo walletId duy nhất dựa trên userId
  const walletData = {
    walletId,
    userId, // Liên kết với UID người dùng
    currency: ['USDT', 'VND'], // Các loại tiền tệ hỗ trợ
    balance: {
      USDT: 0, // Số dư khởi tạo cho USDT
      VND: 0,  // Số dư khởi tạo cho VND
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    address: walletAddress,
    transactionHistory: [], // Khởi tạo lịch sử giao dịch
  };

  // Thêm ví vào Firestore
  await setDoc(doc(db, 'wallets', walletId), walletData);
  console.log(`Wallet created for user ${userId}:`, walletData);
};

// Hàm tạo địa chỉ ví giả
const generateWalletAddress = () => {
  const address = '0x' + Math.random().toString(16).slice(2, 42); // Tạo địa chỉ ví với 40 ký tự sau "0x"
  return address;
};

// Hàm để tạo ví cho tất cả người dùng trong bảng users
const createWalletsForAllUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  usersSnapshot.forEach(async (doc) => {
    const userData = doc.data();
    const userId = userData.uid; // Lấy UID của người dùng
    const walletAddress = generateWalletAddress(); // Tạo địa chỉ ví giả
    await createWallet(userId, walletAddress); // Tạo ví cho người dùng
  });
};

// Gọi hàm để tạo ví cho tất cả người dùng
createWalletsForAllUsers();
