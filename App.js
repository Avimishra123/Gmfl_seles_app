import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from './src/components/ui';
import MainTabs from './src/navigation/MainTabs';
import AgentDocsScreen from './src/screens/AgentDocsScreen';
import AgentUploadScreen from './src/screens/AgentUploadScreen';
import ContactScreen from './src/screens/ContactScreen';
import CustomerScreen from './src/screens/CustomerScreen';
import DocDecideScreen from './src/screens/DocDecideScreen';
import DocReviewScreen from './src/screens/DocReviewScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import RejectScreen from './src/screens/RejectScreen';
import ShareScreen from './src/screens/ShareScreen';
import SplashScreen from './src/screens/SplashScreen';
import StatusScreen from './src/screens/StatusScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { AppProvider, useApp } from './src/store';
import { colors } from './src/theme';

import { useEffect } from 'react';
import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import { getMessaging, getToken, onMessage, requestPermission } from '@react-native-firebase/messaging';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { ApiService } from './src/network/ApiService';

const Stack = createNativeStackNavigator();

function Root() {
  const { toast, token, showToast } = useApp();

  useEffect(() => {
    let unsubscribe;
    async function setupFirebase() {
      console.log('🔥 SETUP FIREBASE STARTED');
      try {
        const messaging = getMessaging();
        
        console.log('🔥 Requesting permissions...');
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          console.log('🔥 Requesting Android 13+ POST_NOTIFICATIONS');
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('🔥 Notification permission denied');
            return;
          }
        } else {
          console.log('🔥 Requesting older Android permissions');
          const authStatus = await requestPermission(messaging);
          const enabled =
            authStatus === 1 || authStatus === 2; // 1 = AUTHORIZED, 2 = PROVISIONAL
          if (!enabled) {
            console.log('🔥 Firebase messaging permission not enabled');
            return;
          }
        }

        console.log('🔥 Fetching device token...');
        const deviceToken = await getToken(messaging);
        console.log('🔥 FIREBASE FCM TOKEN:', deviceToken);

        if (token) {
          console.log('🔥 Registering token with API...');
          const response = await ApiService.registerDeviceToken(token, deviceToken);
          const responseText = await response.text();
          console.log('🔥 Registered! API Status:', response.status, 'Response:', responseText);
        }
      } catch (e) {
        console.warn('🔥 Firebase setup err', e);
      }
    }

    setupFirebase();

    try {
      const messaging = getMessaging();
      unsubscribe = onMessage(messaging, async remoteMessage => {
        console.log('🔥 FOREGROUND MESSAGE:', remoteMessage);
        const title =
          remoteMessage.notification?.title ||
          remoteMessage.data?.title ||
          remoteMessage.data?.heading ||
          'New Notification';
        const body =
          remoteMessage.notification?.body ||
          remoteMessage.data?.body ||
          remoteMessage.data?.message ||
          remoteMessage.data?.description ||
          '';

        if (title || body) {
          if (Platform.OS === 'android' && NativeModules.CustomNotification?.showNotification) {
            NativeModules.CustomNotification.showNotification(title, body);
          }
        }
      });
    } catch (err) {
       console.log('Firebase onMessage hook err', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [token]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ contentStyle: { backgroundColor: '#040914' }, animation: 'fade' }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Main" component={MainTabs} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Customer" component={CustomerScreen} />
        <Stack.Screen name="DocReview" component={DocReviewScreen} />
        <Stack.Screen name="DocDecide" component={DocDecideScreen} />
        <Stack.Screen name="Reject" component={RejectScreen} />
        <Stack.Screen name="Status" component={StatusScreen} />
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="AgentDocs" component={AgentDocsScreen} />
        <Stack.Screen name="AgentUpload" component={AgentUploadScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
      <Toast message={toast} />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemNavigationBar.hide('navigation');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
