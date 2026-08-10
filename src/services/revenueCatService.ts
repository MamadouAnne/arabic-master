import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  PurchasesOfferings,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCreditStore } from '../stores/creditStore';

// ── Product ID → credit amount mapping ────────────────────────────
const CREDIT_AMOUNTS: Record<string, number> = {
  iqra_credits_10: 10,
  iqra_credits_50: 50,
  iqra_credits_200: 200,
};

const PREMIUM_ENTITLEMENT = 'Iqra AI Pro';

let isConfigured = false;
let initPromise: Promise<void> | null = null;
let identifiedUserId: string | null = null;

// ── Initialize ────────────────────────────────────────────────────
function initialize(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = doInitialize();
  return initPromise;
}

async function doInitialize(): Promise<void> {
  try {
    // Off-switch: set EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED=false (e.g. in the preview
    // environment) to skip RevenueCat entirely until real store keys are ready.
    if (process.env.EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED === 'false') {
      __DEV__ && console.log('[RevenueCat] Subscriptions disabled via env, skipping init');
      return;
    }

    const apiKey = Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY,
      android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY,
    });

    if (!apiKey) {
      __DEV__ && console.log('[RevenueCat] No API key configured, skipping init');
      return;
    }

    // RevenueCat Test Store keys (test_…) force-close a RELEASE build with a
    // "Wrong API Key" dialog. Skip configuring so preview/production builds don't
    // crash on launch; purchases stay disabled until a real goog_/appl_ key is set.
    if (apiKey.startsWith('test_') && !__DEV__) {
      console.warn('[RevenueCat] Test API key in a release build — skipping init to avoid crash.');
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    isConfigured = true;

    // Identify with Supabase user if logged in
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await Purchases.logIn(session.user.id);
        identifiedUserId = session.user.id;
      }
    }

    // Sync subscription status on launch
    await syncSubscriptionStatus();

    __DEV__ && console.log('[RevenueCat] Initialized');
  } catch (e) {
    initPromise = null; // Allow retry on failure
    __DEV__ && console.warn('[RevenueCat] Init error:', e);
  }
}

// ── Identify user (call on auth state change) ────────────────────
async function identifyUser(userId: string): Promise<void> {
  // Wait for init to finish first to avoid concurrent logIn calls
  if (initPromise) await initPromise;
  if (!isConfigured) return;
  // Skip if init already identified this user
  if (identifiedUserId === userId) return;
  try {
    await Purchases.logIn(userId);
    identifiedUserId = userId;
    await syncSubscriptionStatus();
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] Identify error:', e);
  }
}

// ── Get offerings (credit packs + subscriptions) ─────────────────
async function getOfferings(): Promise<PurchasesOfferings | null> {
  // Wait for init to complete before fetching offerings
  if (initPromise) await initPromise;
  if (!isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] Offerings error:', e);
    return null;
  }
}

// ── Dev-mode simulated purchase (for Expo Go testing) ────────────
async function devPurchase(productId: string): Promise<boolean> {
  const creditAmount = CREDIT_AMOUNTS[productId];
  if (creditAmount) {
    // Simulate credit pack purchase — grant credits locally
    const store = useCreditStore.getState();
    useCreditStore.setState({ creditBalance: store.creditBalance + creditAmount });
    console.log(`[RevenueCat-DEV] Simulated purchase: +${creditAmount} credits`);
    return true;
  }
  // Simulate subscription purchase
  if (productId.includes('premium')) {
    const isMonthly = productId.includes('monthly');
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    useCreditStore.setState({
      subscriptionStatus: 'active',
      subscriptionPlan: isMonthly ? 'monthly' : 'yearly',
      subscriptionExpiresAt: expires.toISOString(),
    });
    console.log(`[RevenueCat-DEV] Simulated subscription: ${isMonthly ? 'monthly' : 'yearly'}`);
    return true;
  }
  return false;
}

// ── Purchase a package ───────────────────────────────────────────
async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if this was a subscription purchase
    if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]) {
      updateStoreFromCustomerInfo(customerInfo);
      return true;
    }

    // For consumable credit packs, the webhook handles credit granting.
    // But we can also optimistically update the local state.
    const productId = pkg.product.identifier;
    const creditAmount = CREDIT_AMOUNTS[productId];
    if (creditAmount) {
      // Sync from server to get the updated balance (webhook may have already fired)
      await useCreditStore.getState().syncCredits();
    }

    return true;
  } catch (e: any) {
    if (e.userCancelled) return false;
    __DEV__ && console.warn('[RevenueCat] Purchase error:', e);
    throw e;
  }
}

// ── Restore purchases ────────────────────────────────────────────
async function restorePurchases(): Promise<CustomerInfo> {
  if (!isConfigured) throw new Error('RevenueCat not configured');
  const customerInfo = await Purchases.restorePurchases();
  updateStoreFromCustomerInfo(customerInfo);
  await useCreditStore.getState().syncCredits();
  return customerInfo;
}

// ── Check subscription status ────────────────────────────────────
async function syncSubscriptionStatus(): Promise<void> {
  if (!isConfigured) return;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    updateStoreFromCustomerInfo(customerInfo);
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] Sync status error:', e);
  }
}

// ── Logout ───────────────────────────────────────────────────────
async function logout(): Promise<void> {
  if (!isConfigured) return;
  try {
    identifiedUserId = null;
    await Purchases.logOut();
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] Logout error:', e);
  }
}

// ── Internal: update credit store from customer info ─────────────
function updateStoreFromCustomerInfo(info: CustomerInfo): void {
  const premiumEntitlement = info.entitlements.active[PREMIUM_ENTITLEMENT];

  if (premiumEntitlement) {
    const store = useCreditStore.getState();
    const isMonthly = premiumEntitlement.productIdentifier?.includes('monthly');
    // Use the Zustand set — we access it via internal API
    useCreditStore.setState({
      subscriptionStatus: 'active',
      subscriptionPlan: isMonthly ? 'monthly' : 'yearly',
      subscriptionExpiresAt: premiumEntitlement.expirationDate ?? null,
    });
  }
}

export const revenueCatService = {
  initialize,
  identifyUser,
  getOfferings,
  purchasePackage,
  devPurchase,
  restorePurchases,
  syncSubscriptionStatus,
  logout,
};
