import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGENT, createCustomers } from './data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(createCustomers);
  const [appDocOverrides, setAppDocOverrides] = useState({});
  const [toast, setToast] = useState('');
  const [token, setTokenState] = useState(null);
  const [refreshToken, setRefreshTokenState] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    async function loadToken() {
      try {
        const stored = await AsyncStorage.getItem('auth_token');
        const storedRefresh = await AsyncStorage.getItem('auth_refresh_token');
        if (stored) setTokenState(stored);
        if (storedRefresh) setRefreshTokenState(storedRefresh);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsReady(true);
      }
    }
    loadToken();
  }, []);

  const setToken = useCallback(async (newToken) => {
    setTokenState(newToken);
    try {
      if (newToken) {
        await AsyncStorage.setItem('auth_token', newToken);
      } else {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_refresh_token');
        setRefreshTokenState(null);
      }
    } catch (e) {
      console.error('Failed to save token', e);
    }
  }, []);

  const setTokens = useCallback(async (newToken, newRefreshToken) => {
    setTokenState(newToken);
    setRefreshTokenState(newRefreshToken);
    try {
      if (newToken) await AsyncStorage.setItem('auth_token', newToken);
      else await AsyncStorage.removeItem('auth_token');
      
      if (newRefreshToken) await AsyncStorage.setItem('auth_refresh_token', newRefreshToken);
      else await AsyncStorage.removeItem('auth_refresh_token');
    } catch (e) {
      console.error('Failed to save tokens', e);
    }
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const updateDoc = useCallback((id, index, patch) => {
    setAppDocOverrides((prev) => ({
      ...prev,
      [`${id}_${index}`]: { ...(prev[`${id}_${index}`] || {}), ...patch }
    }));
    
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== id) return customer;
        return {
          ...customer,
          docs: customer.docs.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)),
        };
      })
    );
  }, []);

  const removeDoc = useCallback((id, index) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== id) return customer;
        return { ...customer, docs: customer.docs.filter((_, i) => i !== index) };
      })
    );
  }, []);

  const setStatus = useCallback((id, status) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== id) return customer;
        const done = status === 'Approved' || status === 'Completed';
        return { ...customer, status, group: done ? 'done' : 'live' };
      })
    );
  }, []);

  const value = useMemo(
    () => ({ customers, appDocOverrides, showToast, toast, updateDoc, removeDoc, setStatus, agent: AGENT, token, refreshToken, setToken, setTokens, isReady }),
    [customers, appDocOverrides, showToast, toast, updateDoc, removeDoc, setStatus, token, refreshToken, setToken, setTokens, isReady]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function useCustomer(id) {
  const { customers } = useApp();
  return customers.find((customer) => customer.id === id) || null;
}
