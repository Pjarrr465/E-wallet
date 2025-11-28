import { User, Transaction, UserRole, EducationLevel, Message } from '../types';

const USERS_KEY = 'walletku_users';
const TRANSACTIONS_KEY = 'walletku_transactions';
const MESSAGES_KEY = 'walletku_messages';
const CURRENT_USER_KEY = 'walletku_current_user_id';

// Initial Helper: Load data
const load = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const AuthService = {
  register: (user: Omit<User, 'id' | 'balance'>): { success: boolean; message: string; user?: User } => {
    const users = load<User>(USERS_KEY);
    
    // Check email uniqueness
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      balance: user.role === UserRole.BUYER ? 500000 : 0, // Initial balance for Buyers
    };

    users.push(newUser);
    save(USERS_KEY, users);
    
    // Auto login
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return { success: true, message: 'Registrasi berhasil.', user: newUser };
  },

  login: (identifier: string, password: string): { success: boolean; message: string; user?: User } => {
    // HARDCODED ADMIN CHECK (User: admin, Pass: 123)
    if (identifier === 'admin' && password === '123') {
      const adminUser: User = {
        id: 'admin-super-id',
        name: 'Super Admin',
        email: 'admin',
        password: '123',
        role: UserRole.ADMIN,
        educationLevel: EducationLevel.SARJANA,
        balance: 0
      };
      localStorage.setItem(CURRENT_USER_KEY, adminUser.id);
      return { success: true, message: 'Login Admin berhasil.', user: adminUser };
    }

    const users = load<User>(USERS_KEY);
    
    // Login Logic: Check if identifier matches Email OR Name
    const user = users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.name.toLowerCase() === identifier.toLowerCase()) 
      && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Username/Email atau kata sandi salah.' };
    }

    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return { success: true, message: 'Login berhasil.', user };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return null;

    // Check if it's the hardcoded admin
    if (id === 'admin-super-id') {
      return {
        id: 'admin-super-id',
        name: 'Super Admin',
        email: 'admin',
        password: '123',
        role: UserRole.ADMIN,
        educationLevel: EducationLevel.SARJANA,
        balance: 0
      };
    }

    const users = load<User>(USERS_KEY);
    return users.find(u => u.id === id) || null;
  },

  // Need to re-fetch user to get latest balance
  refreshUser: (id: string): User | null => {
    if (id === 'admin-super-id') return AuthService.getCurrentUser();
    const users = load<User>(USERS_KEY);
    return users.find(u => u.id === id) || null;
  }
};

export const AdminService = {
  getAllUsers: (): User[] => {
    return load<User>(USERS_KEY);
  },

  deleteUser: (userId: string) => {
    let users = load<User>(USERS_KEY);
    users = users.filter(u => u.id !== userId);
    save(USERS_KEY, users);
  },

  updateUserBalance: (userId: string, newBalance: number) => {
    const users = load<User>(USERS_KEY);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].balance = newBalance;
      save(USERS_KEY, users);
    }
  },

  updateUserRole: (userId: string, newRole: UserRole) => {
    const users = load<User>(USERS_KEY);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = newRole;
      save(USERS_KEY, users);
    }
  }
};

export const MessageService = {
    sendMessage: (senderId: string, senderName: string, content: string) => {
        const messages = load<Message>(MESSAGES_KEY);
        const newMessage: Message = {
            id: crypto.randomUUID(),
            senderId,
            senderName,
            content,
            timestamp: Date.now(),
            isRead: false
        };
        messages.push(newMessage);
        save(MESSAGES_KEY, messages);
    },

    getAllMessages: (): Message[] => {
        const messages = load<Message>(MESSAGES_KEY);
        return messages.sort((a, b) => b.timestamp - a.timestamp);
    }
};

export const TransactionService = {
  getHistory: (userId: string): Transaction[] => {
    const transactions = load<Transaction>(TRANSACTIONS_KEY);
    // Sort by newest first
    return transactions
      .filter(t => t.buyerId === userId || t.sellerId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  processPayment: (buyerId: string, sellerId: string, amount: number): { success: boolean; message: string } => {
    const users = load<User>(USERS_KEY);
    const buyerIndex = users.findIndex(u => u.id === buyerId);
    const sellerIndex = users.findIndex(u => u.id === sellerId);

    if (buyerIndex === -1 || sellerIndex === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const buyer = users[buyerIndex];
    const seller = users[sellerIndex];

    if (buyer.balance < amount) {
      return { success: false, message: 'Saldo tidak mencukupi.' };
    }

    // Atomic update simulation
    buyer.balance -= amount;
    seller.balance += amount;

    // Save Users
    users[buyerIndex] = buyer;
    users[sellerIndex] = seller;
    save(USERS_KEY, users);

    // Record Transaction
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      buyerId: buyer.id,
      buyerName: buyer.name,
      sellerId: seller.id,
      sellerName: seller.name,
      amount: amount,
      timestamp: Date.now(),
    };

    const transactions = load<Transaction>(TRANSACTIONS_KEY);
    transactions.push(newTransaction);
    save(TRANSACTIONS_KEY, transactions);

    return { success: true, message: 'Pembayaran berhasil!' };
  }
};