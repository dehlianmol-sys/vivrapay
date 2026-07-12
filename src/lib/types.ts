export type Role = 'super_admin' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: Role;
  wallet: number;
  has_deposited_300: boolean;
  upis: LinkedUPI[];
  createdAt: string;
  lockedDepositId?: string | null;
}

export interface LinkedUPI {
  id: string;
  partnerId: string;
  partnerName: string;
  maskedPhone: string;
  upiId: string;
  tabType: 'Buy' | 'Sell';
  isSelling: boolean;
  createdAt: string;
}

export type DepositStatus = 'Pending' | 'Success' | 'Rejected';

export interface PaymentMethodSnapshot {
  name: string;
  upiId: string;
  qr: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  amount: number;
  reward: number;
  itoken: number;
  utr: string;
  receiptBase64: string | null;
  paymentMethod: PaymentMethodSnapshot | null;
  status: DepositStatus;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  upiId: string;
  qr: string;
  active: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  url: string;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  rewardPercentage: number;
  minOrderSize: number;
  maxOrderSize: number;
}

export interface CustomerService {
  id: string;
  iconUrl: string;
  name: string;
  description: string;
  linkUrl: string;
  createdAt: string;
}
