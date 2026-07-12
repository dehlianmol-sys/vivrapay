import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, Banner, CustomerService, Deposit, LinkedUPI, PaymentGateway, User } from './types';
import { supabase } from './supabase';
import { uploadImage as uploadToStorage } from './storage';

const SESSION_KEY = 'vivrapay_session_v1';

interface ProfileRow {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: User['role'];
  wallet: number;
  has_deposited_300: boolean;
  locked_deposit_id: string | null;
  created_at: string;
}

interface UpiRow {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  masked_phone: string;
  upi_id: string;
  tab_type: 'Buy' | 'Sell';
  is_selling: boolean;
  created_at: string;
}

interface GatewayRow {
  id: string;
  name: string;
  upi_id: string;
  qr: string;
  active: boolean;
  created_at: string;
}

interface BannerRow {
  id: string;
  url: string;
  created_at: string;
}

interface AppSettingsRow {
  id: string;
  reward_percentage: number;
  min_order_size: number;
  max_order_size: number;
}

interface CustomerServiceRow {
  id: string;
  icon_url: string;
  name: string;
  description: string;
  link_url: string;
  created_at: string;
}

interface TxRow {
  id: string;
  user_id: string;
  user_phone: string;
  user_name: string;
  amount: number;
  reward: number;
  itoken: number;
  utr: string;
  receipt_base64: string | null;
  payment_method: { name: string; upi_id: string; qr: string } | null;
  status: Deposit['status'];
  type: string;
  created_at: string;
  expires_at: string;
}

interface StoreValue {
  loading: boolean;
  users: User[];
  deposits: Deposit[];
  gateways: PaymentGateway[];
  banners: Banner[];
  currentUser: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (phone: string, password: string) => Promise<{ ok: boolean; message: string; user?: User }>;
  register: (name: string, phone: string, password: string) => Promise<{ ok: boolean; message: string; user?: User }>;
  logout: () => void;
  addLinkedUPI: (upi: Omit<LinkedUPI, 'id' | 'createdAt'>) => Promise<void>;
  toggleSelling: (upiId: string) => Promise<void>;
  createDepositIntent: (amount: number) => Promise<{ ok: boolean; message: string; deposit?: Deposit }>;
  cancelDeposit: (depositId: string) => Promise<void>;
  submitDepositProof: (depositId: string, utr: string, receiptPath: string | null) => Promise<{ ok: boolean; message: string }>;
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string) => Promise<void>;
  addGateway: (g: Omit<PaymentGateway, 'id' | 'createdAt'>) => Promise<void>;
  updateGateway: (id: string, patch: Partial<PaymentGateway>) => Promise<void>;
  deleteGateway: (id: string) => Promise<void>;
  addBanner: (url: string) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  activeBanners: Banner[];
  activeGateways: PaymentGateway[];
  appSettings: AppSettings | null;
  updateAppSettings: (patch: Partial<Pick<AppSettings, 'rewardPercentage' | 'minOrderSize' | 'maxOrderSize'>>) => Promise<void>;
  customerServices: CustomerService[];
  addCustomerService: (cs: Omit<CustomerService, 'id' | 'createdAt'>) => Promise<void>;
  deleteCustomerService: (id: string) => Promise<void>;
  adjustUserBalance: (userId: string, delta: number) => Promise<void>;
  uploadImage: (file: File, folder: string) => Promise<string>;
}

const StoreContext = createContext<StoreValue | null>(null);

function mapUser(p: ProfileRow, upis: LinkedUPI[]): User {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    password: p.password,
    role: p.role,
    wallet: Number(p.wallet),
    has_deposited_300: p.has_deposited_300,
    upis,
    createdAt: p.created_at,
    lockedDepositId: p.locked_deposit_id,
  };
}

function mapUpi(r: UpiRow): LinkedUPI {
  return {
    id: r.id,
    partnerId: r.partner_id,
    partnerName: r.partner_name,
    maskedPhone: r.masked_phone,
    upiId: r.upi_id,
    tabType: r.tab_type,
    isSelling: r.is_selling,
    createdAt: r.created_at,
  };
}

function mapGateway(r: GatewayRow): PaymentGateway {
  return {
    id: r.id,
    name: r.name,
    upiId: r.upi_id,
    qr: r.qr,
    active: r.active,
    createdAt: r.created_at,
  };
}

function mapBanner(r: BannerRow): Banner {
  return { id: r.id, url: r.url, createdAt: r.created_at };
}

function mapAppSettings(r: AppSettingsRow): AppSettings {
  return {
    id: r.id,
    rewardPercentage: Number(r.reward_percentage),
    minOrderSize: Number(r.min_order_size),
    maxOrderSize: Number(r.max_order_size),
  };
}

function mapCustomerService(r: CustomerServiceRow): CustomerService {
  return {
    id: r.id,
    iconUrl: r.icon_url,
    name: r.name,
    description: r.description,
    linkUrl: r.link_url,
    createdAt: r.created_at,
  };
}

function mapDeposit(r: TxRow): Deposit {
  return {
    id: r.id,
    userId: r.user_id,
    userPhone: r.user_phone,
    userName: r.user_name,
    amount: Number(r.amount),
    reward: Number(r.reward),
    itoken: Number(r.itoken),
    utr: r.utr,
    receiptBase64: r.receipt_base64,
    paymentMethod: r.payment_method
      ? { name: r.payment_method.name, upiId: r.payment_method.upi_id, qr: r.payment_method.qr }
      : null,
    status: r.status,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  };
}

function getSession(): string | null {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}
function setSession(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [customerServices, setCustomerServices] = useState<CustomerService[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => getSession());
  const mounted = useRef(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshAll = useCallback(async () => {
    const [pRes, uRes, gRes, bRes, tRes, sRes, csRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('upi_accounts').select('*'),
      supabase.from('payment_configurations').select('*'),
      supabase.from('banners').select('*'),
      supabase.from('transaction_records').select('*'),
      supabase.from('app_settings').select('*').maybeSingle(),
      supabase.from('customer_services').select('*').order('created_at', { ascending: false }),
    ]);

    if (!mounted.current) return;

    const upisByUser: Record<string, LinkedUPI[]> = {};
    for (const u of (uRes.data ?? []) as UpiRow[]) {
      const mapped = mapUpi(u);
      (upisByUser[u.user_id] ??= []).push(mapped);
    }

    const mappedUsers = ((pRes.data ?? []) as ProfileRow[]).map((p) =>
      mapUser(p, upisByUser[p.id] ?? []),
    );
    setUsers(mappedUsers);
    setGateways(((gRes.data ?? []) as GatewayRow[]).map(mapGateway));
    setBanners(((bRes.data ?? []) as BannerRow[]).map(mapBanner));
    setDeposits(((tRes.data ?? []) as TxRow[]).map(mapDeposit));
    setAppSettings(sRes.data ? mapAppSettings(sRes.data as AppSettingsRow) : null);
    setCustomerServices(((csRes.data ?? []) as CustomerServiceRow[]).map(mapCustomerService));
  }, []);

  // Debounced refresh for realtime events — coalesces bursts of changes into one fetch
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      refreshAll();
    }, 300);
  }, [refreshAll]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      await refreshAll();
      if (mounted.current) setLoading(false);
    })();

    const channel = supabase
      .channel('vivrapay-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'upi_accounts' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_configurations' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaction_records' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_services' }, scheduleRefresh)
      .subscribe();

    return () => {
      mounted.current = false;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [refreshAll, scheduleRefresh]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === sessionUserId) ?? null,
    [users, sessionUserId],
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const login: StoreValue['login'] = useCallback(async (phone, password) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error) return { ok: false, message: 'Network error. Please try again.' };
    if (!data) return { ok: false, message: 'Account not found. Please register.' };
    const row = data as ProfileRow;
    if (row.password !== password) return { ok: false, message: 'Incorrect password.' };
    setSession(row.id);
    setSessionUserId(row.id);
    return { ok: true, message: 'Login successful', user: mapUser(row, []) };
  }, []);

  const register: StoreValue['register'] = useCallback(async (name, phone, password) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();
    if (existing) return { ok: false, message: 'Phone number already registered.' };

    const { data, error } = await supabase
      .from('profiles')
      .insert({ name, phone, password, role: 'user', wallet: 150, has_deposited_300: false })
      .select('*')
      .single();
    if (error) return { ok: false, message: 'Registration failed. Please try again.' };
    const row = data as ProfileRow;
    setSession(row.id);
    setSessionUserId(row.id);
    await refreshAll();
    return { ok: true, message: 'Registration successful! ₹150 welcome bonus added.', user: mapUser(row, []) };
  }, [refreshAll]);

  const logout = useCallback(() => {
    setSession(null);
    setSessionUserId(null);
  }, []);

  const addLinkedUPI: StoreValue['addLinkedUPI'] = useCallback(async (upi) => {
    if (!currentUser) return;
    const { error } = await supabase.from('upi_accounts').insert({
      user_id: currentUser.id,
      partner_id: upi.partnerId,
      partner_name: upi.partnerName,
      masked_phone: upi.maskedPhone,
      upi_id: upi.upiId,
      tab_type: upi.tabType,
      is_selling: upi.isSelling,
    });
    if (error) throw error;
    await refreshAll();
  }, [currentUser, refreshAll]);

  const toggleSelling: StoreValue['toggleSelling'] = useCallback(async (upiId) => {
    const upi = users.flatMap((u) => u.upis).find((x) => x.id === upiId);
    if (!upi) return;
    const { error } = await supabase.from('upi_accounts').update({ is_selling: !upi.isSelling }).eq('id', upiId);
    if (error) throw error;
    await refreshAll();
  }, [users, refreshAll]);

  const createDepositIntent: StoreValue['createDepositIntent'] = useCallback(async (amount) => {
    if (!currentUser) return { ok: false, message: 'Please log in.' };
    if (currentUser.lockedDepositId) {
      const existing = deposits.find((d) => d.id === currentUser.lockedDepositId);
      if (existing && existing.status === 'Pending' && new Date(existing.expiresAt).getTime() > Date.now()) {
        return { ok: false, message: 'You already have an active deposit. Complete or cancel it first.' };
      }
    }
    const active = gateways.filter((g) => g.active);
    if (active.length === 0) return { ok: false, message: 'No payment methods available. Please try later.' };
    const chosen = active[Math.floor(Math.random() * active.length)];
    const rewardPct = appSettings?.rewardPercentage ?? 4;
    const reward = +(amount * rewardPct / 100).toFixed(2);
    const now = Date.now();
    const { data, error } = await supabase
      .from('transaction_records')
      .insert({
        user_id: currentUser.id,
        user_phone: currentUser.phone,
        user_name: currentUser.name,
        amount,
        reward,
        itoken: +(amount + reward).toFixed(2),
        utr: '',
        receipt_base64: null,
        payment_method: { name: chosen.name, upi_id: chosen.upiId, qr: chosen.qr },
        status: 'Pending',
        type: 'deposit',
        created_at: new Date(now).toISOString(),
        expires_at: new Date(now + 30 * 60 * 1000).toISOString(),
      })
      .select('*')
      .single();
    if (error || !data) return { ok: false, message: 'Could not create order. Please try again.' };
    const tx = mapDeposit(data as TxRow);
    await supabase.from('profiles').update({ locked_deposit_id: tx.id }).eq('id', currentUser.id);
    await refreshAll();
    return { ok: true, message: 'Order created. Pay within 30 minutes.', deposit: tx };
  }, [currentUser, deposits, gateways, appSettings, refreshAll]);

  const cancelDeposit: StoreValue['cancelDeposit'] = useCallback(async (depositId) => {
    await supabase.from('transaction_records').delete().eq('id', depositId);
    if (currentUser?.lockedDepositId === depositId) {
      await supabase.from('profiles').update({ locked_deposit_id: null }).eq('id', currentUser.id);
    }
    await refreshAll();
  }, [currentUser, refreshAll]);

  const submitDepositProof: StoreValue['submitDepositProof'] = useCallback(async (depositId, utr, receiptPath) => {
    if (!/^\d{12}$/.test(utr)) return { ok: false, message: 'UTR must be exactly 12 numeric digits.' };
    const { error } = await supabase
      .from('transaction_records')
      .update({ utr, receipt_base64: receiptPath, status: 'Pending' })
      .eq('id', depositId);
    if (error) return { ok: false, message: 'Submission failed. Please try again.' };
    if (currentUser?.lockedDepositId === depositId) {
      await supabase.from('profiles').update({ locked_deposit_id: null }).eq('id', currentUser.id);
    }
    await refreshAll();
    return { ok: true, message: 'Payment proof submitted. Awaiting admin approval.' };
  }, [currentUser, refreshAll]);

  const approveDeposit: StoreValue['approveDeposit'] = useCallback(async (depositId) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'Pending') return;
    await supabase.from('transaction_records').update({ status: 'Success' }).eq('id', depositId);
    const target = users.find((u) => u.id === dep.userId);
    if (target) {
      const patch: Record<string, unknown> = {
        wallet: +(target.wallet + dep.itoken).toFixed(2),
      };
      if (dep.amount >= 300) patch.has_deposited_300 = true;
      if (target.lockedDepositId === depositId) patch.locked_deposit_id = null;
      await supabase.from('profiles').update(patch).eq('id', target.id);
    }
    await refreshAll();
  }, [deposits, users, refreshAll]);

  const rejectDeposit: StoreValue['rejectDeposit'] = useCallback(async (depositId) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;
    await supabase.from('transaction_records').update({ status: 'Rejected' }).eq('id', depositId);
    const target = users.find((u) => u.id === dep.userId);
    if (target && target.lockedDepositId === depositId) {
      await supabase.from('profiles').update({ locked_deposit_id: null }).eq('id', target.id);
    }
    await refreshAll();
  }, [deposits, users, refreshAll]);

  const adjustUserBalance: StoreValue['adjustUserBalance'] = useCallback(async (userId, delta) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newWallet = Math.max(0, +(target.wallet + delta).toFixed(2));
    const { error } = await supabase.from('profiles').update({ wallet: newWallet }).eq('id', userId);
    if (error) throw error;
    await refreshAll();
  }, [users, refreshAll]);

  const updateAppSettings: StoreValue['updateAppSettings'] = useCallback(async (patch) => {
    if (!appSettings) return;
    const dbPatch: Record<string, unknown> = {};
    if (patch.rewardPercentage !== undefined) dbPatch.reward_percentage = patch.rewardPercentage;
    if (patch.minOrderSize !== undefined) dbPatch.min_order_size = patch.minOrderSize;
    if (patch.maxOrderSize !== undefined) dbPatch.max_order_size = patch.maxOrderSize;
    const { error } = await supabase.from('app_settings').update(dbPatch).eq('id', appSettings.id);
    if (error) throw error;
    await refreshAll();
  }, [appSettings, refreshAll]);

  const addCustomerService: StoreValue['addCustomerService'] = useCallback(async (cs) => {
    const { error } = await supabase.from('customer_services').insert({
      icon_url: cs.iconUrl,
      name: cs.name,
      description: cs.description,
      link_url: cs.linkUrl,
    });
    if (error) throw error;
    await refreshAll();
  }, [refreshAll]);

  const deleteCustomerService: StoreValue['deleteCustomerService'] = useCallback(async (id) => {
    const { error } = await supabase.from('customer_services').delete().eq('id', id);
    if (error) throw error;
    await refreshAll();
  }, [refreshAll]);

  const addGateway: StoreValue['addGateway'] = useCallback(async (g) => {
    await supabase.from('payment_configurations').insert({
      name: g.name, upi_id: g.upiId, qr: g.qr, active: g.active,
    });
    await refreshAll();
  }, [refreshAll]);

  const updateGateway: StoreValue['updateGateway'] = useCallback(async (id, patch) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.upiId !== undefined) dbPatch.upi_id = patch.upiId;
    if (patch.qr !== undefined) dbPatch.qr = patch.qr;
    if (patch.active !== undefined) dbPatch.active = patch.active;
    await supabase.from('payment_configurations').update(dbPatch).eq('id', id);
    await refreshAll();
  }, [refreshAll]);

  const deleteGateway: StoreValue['deleteGateway'] = useCallback(async (id) => {
    await supabase.from('payment_configurations').delete().eq('id', id);
    await refreshAll();
  }, [refreshAll]);

  const addBanner: StoreValue['addBanner'] = useCallback(async (url) => {
    await supabase.from('banners').insert({ url });
    await refreshAll();
  }, [refreshAll]);

  const deleteBanner: StoreValue['deleteBanner'] = useCallback(async (id) => {
    await supabase.from('banners').delete().eq('id', id);
    await refreshAll();
  }, [refreshAll]);

  const activeBanners = useMemo(() => banners, [banners]);
  const activeGateways = useMemo(() => gateways.filter((g) => g.active), [gateways]);

  const value: StoreValue = useMemo(() => ({
    loading,
    users,
    deposits,
    gateways,
    banners,
    currentUser,
    isAdmin,
    isSuperAdmin,
    login,
    register,
    logout,
    addLinkedUPI,
    toggleSelling,
    createDepositIntent,
    cancelDeposit,
    submitDepositProof,
    approveDeposit,
    rejectDeposit,
    addGateway,
    updateGateway,
    deleteGateway,
    addBanner,
    deleteBanner,
    activeBanners,
    activeGateways,
    appSettings,
    updateAppSettings,
    customerServices,
    addCustomerService,
    deleteCustomerService,
    adjustUserBalance,
    uploadImage: uploadToStorage,
  }), [
    loading, users, deposits, gateways, banners, currentUser, isAdmin, isSuperAdmin,
    login, register, logout, addLinkedUPI, toggleSelling, createDepositIntent,
    cancelDeposit, submitDepositProof, approveDeposit, rejectDeposit,
    addGateway, updateGateway, deleteGateway, addBanner, deleteBanner,
    activeBanners, activeGateways, appSettings, updateAppSettings,
    customerServices, addCustomerService, deleteCustomerService, adjustUserBalance,
    uploadToStorage,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
