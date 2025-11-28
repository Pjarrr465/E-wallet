export enum UserRole {
  BUYER = 'Pembeli',
  SELLER = 'Penjual',
  ADMIN = 'Administrator',
}

export enum EducationLevel {
  SD = 'SD/Sederajat',
  SMP = 'SMP/Sederajat',
  SMA = 'SMA/Sederajat',
  DIPLOMA = 'Diploma (D1/D2/D3)',
  SARJANA = 'Sarjana (S1/S2/S3)',
}

export interface User {
  id: string;
  name: string;
  email: string; // Used as username
  password: string; // In real app, this is hashed. In prototype, stored as is (simulated).
  role: UserRole;
  educationLevel: EducationLevel;
  balance: number;
}

export interface Transaction {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface QRData {
  sellerId: string;
  sellerName: string;
  amount: number;
}