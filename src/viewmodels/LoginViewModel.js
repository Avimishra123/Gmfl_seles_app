import { useState } from 'react';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { ApiService } from '../network/ApiService';
import { useApp } from '../store';

export function useLoginViewModel(navigation) {
  const { showToast, setToken, setTokens } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function togglePassword() {
    setShowPassword(!showPassword);
  }

  async function handleLogin() {
    if (loading) return;
    if (!username.trim() || !password.trim()) {
      showToast('Enter username and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending login request:', username, password);
      const response = await ApiService.login(username, password);
      
      const responseText = await response.text();
      console.log('Login Response:', response.status, responseText);
      
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('Failed to parse JSON:', e);
      }

      if (response.ok && data) {
        const token = data.token || (data.data?.tokens?.accessToken);
        const refreshToken = data.data?.tokens?.refreshToken;
        if (token) {
          if (refreshToken) {
            setTokens(token, refreshToken);
          } else {
            setToken(token);
          }
          // Register device token immediately after login
          try {
            const messaging = getMessaging();
            getToken(messaging).then((fcmToken) => {
              if (fcmToken) {
                console.log('🔥 Registering FCM device token on login...');
                ApiService.registerDeviceToken(token, fcmToken, 'android')
                  .then(async (res) => {
                    const txt = await res.text();
                    console.log('🔥 Login device token status:', res.status, txt);
                  })
                  .catch((err) => console.log('Device token error on login:', err));
              }
            }).catch((err) => console.log('Could not get FCM token on login:', err));
          } catch (notifErr) {
            console.log('Firebase messaging error on login:', notifErr);
          }
        }
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        showToast(data.message || 'Login failed. Please check credentials.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      showToast('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleLogin,
    showPassword,
    togglePassword,
  };
}
