import React, {useState, useEffect, useRef} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppLoading from 'expo-app-loading';
import * as Notifications from 'expo-notifications';
import { createTables, completeTask } from './components/database';
import {openDatabase} from './components/OpenDatabase';
import {schedulePushNotification, registerForPushNotificationsAsync} from './components/Notifications'

// open the TodoDB database
const db = openDatabase('db.TodoDB');

// importing all the screens.
import { HomeScreen } from './Screens/HomeScreen.js';
import { LoginScreen } from './Screens/LoginScreen.js';
import { CategoryScreen } from './Screens/CategoryScreen.js';
import { TaskScreen } from './Screens/TaskScreen.js';
import { AddTaskScreen } from './Screens/AddTask.js';
import { PerformanceScreen } from './Screens/PerformanceScreen.js';
import { SuggestionsScreen } from './Screens/SuggestionsScreen.js';

const Stack = createNativeStackNavigator();

// timer function for rendering the page after waiting for the data to be sreturned from the database.
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

// enavling notification alert and sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // stores the object of the logged in user.
  const [loggedInUser, setLoggedInUser] = useState([]);
  // loading state for controlling page rendering.
  const [loading, setLoading] = useState(true);
  // saves the token for pushing new notifications to the user.
  const [expoPushToken, setExpoPushToken] = useState('');
  // holds the fired notification.
  const [notification, setNotification] = useState(false);
  // userRef for persisting the notification listener value between renders.
  const notificationListener = useRef();
  // userRef for persisting the response listener value between renders.
  const responseListener = useRef();

  /** useEffect for performing some side effects such as:
   * Extracting the logged in user from the database.
   * creating the tables in the database schema if they are not created.
  */
  useEffect(() => {
    let isMounted = true;
    createTables(db);
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "SELECT * FROM users WHERE state = 'loggedin'", null, // passing sql query and parameters:null
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) => {
            setLoggedInUser(_array);
            if(_array.length>0){
              // extract the list of tasks of the loggen in user and which state is uncompleted and the reminder_date is today.
              // A new notification will be pushed for each task of those to notify the user.
              db.transaction(tx => {
                tx.executeSql("SELECT * FROM tasks WHERE reminder_date=? AND state='uncompleted' AND user_id = ?",
                  [new Date().toString().slice(0,15), _array[0].id],
                  // loops through the ResultSet the contains the tasks the user should be notified with, and a new notfication is pushed for each.
                  (txObj, { rows: { _array } }) => {
                    _array?.map((item)=>{
                      schedulePushNotification(item);
                    })
                  },
                  // failure callback which sends two things Transaction object and Error
                  (txObj, error) => console.log('Error ', error)
                  ) // end executeSQL
              });
            }
          },
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error)
        );
    });
    return () => {
      isMounted = false
    };
  }, []);

  const setupNotifications = () => {
    let isMounted = true;

    if (Platform.OS != "web") {
      // set categories for the notification to create responsive notification.
      // each notification has 2 buttons, ok and mark and each has different responses.
      Notifications.setNotificationCategoryAsync("actions", [
        { buttonTitle: "OK 🆗", identifier: "OK" },
        { buttonTitle: "Mark ✔", identifier: "Mark" },
      ])
      .then((_category) => {})
      .catch((error) => console.log('Could not have set notification category', error));

      registerForPushNotificationsAsync().then(token => setExpoPushToken(token))
      .catch(function(error) {
        //console.log('There has been a problem with the push notification operation: ' + error.message);
      });

      // This listener is fired whenever a notification is received while the app is foregrounded
      if (isMounted){
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });
      }

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        // the notification is dismissed if the user clicks on the notification or any of its buttons.
        if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER || response.actionIdentifier == 'OK') {
          Notifications.dismissNotificationAsync(response.notification.request.identifier);
        }
        // if the user clicks on the Mark button, the referred task will be marked as completed.
        // Also the selected date will be the date of that task to show the task after being marked to the user.
        if(response.actionIdentifier == 'Mark'){
          completeTask(response.notification.request.content.data.id, db);
          Notifications.dismissNotificationAsync(response.notification.request.identifier);
        }
      });
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
        isMounted = false;
      };
    }
  }
  // function for calling the timer to wait until the data is returned from the database.
  const finish = () =>{
    wait(200).then(() => {
      setupNotifications();
      // setting loading to false for rendering the screen.
      setLoading(false);
    });
  }
  // intitially the loading state is true to wait for the data to be returned from the database,
  // so AppLoading is used, then after that loading state will set to false by calling the finish function.
  if(loading) {
    return <AppLoading
           startAsync={()=> console.log("Starting App.")}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  // rendering the screen to users.
  else{
    // contains all the screens of the application that the user can navigate to and from.
    return (
      <NavigationContainer>
        <Stack.Navigator>
        {/* if there's no logged in user the login page will be the Home page */}
          {
            loggedInUser.length == 0 &&
            <Stack.Group>
              <Stack.Screen name = "Login" component = {LoginScreen} />
              <Stack.Screen name = "Home" component = {HomeScreen} />
            </Stack.Group>
          }
          {/* if there's a logged in user the HomeScreen page will be the Home page */}
          {
            loggedInUser.length > 0 &&
            <Stack.Group>
              <Stack.Screen name = "Home" component = {HomeScreen} />
              <Stack.Screen name = "Login" component = {LoginScreen} />
            </Stack.Group>
          }
          <Stack.Screen name = "Category" component = {CategoryScreen} />
          <Stack.Screen name="List" component={TaskScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
          <Stack.Screen name="Performance" component={PerformanceScreen} />
          <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
