import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// function that gets the permission and the token for pushing notifications to be sent to the user
// it returns the gained token.
export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    // checks if there are any existing permission status received from the user.
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // is status is not granted it sends a permission request to the user for sending the user notifications.
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // if the user cancelled the permission and the permission is still not granted an alert sent to the user.
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // gets token for pushing the notifications.
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

// pushes new notification with the title being the application name, the body being the task's title,
// the data being the whole task item, and the category being the actions category which is already defined before.
export async function schedulePushNotification(item) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FunTrack",
      body: item.title,
      data: item,
      categoryIdentifier: "actions",
    },
    trigger: { seconds: 1 },
  });
}
