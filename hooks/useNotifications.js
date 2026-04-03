import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import {
    requestNotificationPermissions,
    setupNotificationsForUser,
} from '../firebase/notificationUtils';

const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener   = useRef();
  const responseListener       = useRef();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const uid = auth.currentUser?.uid;

    // Request permissions and setup for current user
    const setup = async () => {
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);

      if (granted && uid) {
        await setupNotificationsForUser(uid, '08:00');
      }
    };

    setup();

    // Listen for notifications received while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('📬 Notification received:', notification.request.content.title);
      });

    // Listen for when user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('👆 Notification tapped:', data);
        // You can navigate to specific screens based on data.type here
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { permissionGranted };
};

export default useNotifications;