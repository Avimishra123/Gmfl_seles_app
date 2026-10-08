/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry, NativeModules, Platform } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    // If message is data-only (no notification payload), show it via CustomNotification
    if (!remoteMessage?.notification && remoteMessage?.data) {
      const title =
        remoteMessage.data.title ||
        remoteMessage.data.heading ||
        'New Notification';
      const body =
        remoteMessage.data.body ||
        remoteMessage.data.message ||
        remoteMessage.data.description ||
        '';

      if (Platform.OS === 'android' && NativeModules.CustomNotification?.showNotification) {
        NativeModules.CustomNotification.showNotification(title, body);
      }
    }
  });
} catch (err) {
  console.log('Firebase background setup failed', err);
}

AppRegistry.registerComponent(appName, () => App);

