import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppLoading from 'expo-app-loading';
import {createTables} from './components/database';
import {openDatabase} from './components/OpenDatabase';

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

export default function App() {
  // stores the object of the logged in user.
  const [loggedInUser, setLoggedInUser] = useState([]);
  // loading state for controlling page rendering.
  const [loading, setLoading] = useState(true);
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
          (txObj, { rows: { _array } }) => setLoggedInUser(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error)
        );
    });
    return () => {
      isMounted = false
    };
  }, []);

  // function for calling the timer to wait until the data is returned from the database.
  const finish = () =>{
    wait(200).then(() => {
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
