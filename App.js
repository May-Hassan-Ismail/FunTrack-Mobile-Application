import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppLoading from 'expo-app-loading';
import {createTables} from './components/database';
import {openDatabase} from './components/OpenDatabase';

const db = openDatabase('db.TodoDB');
// importing all the screens.
import { HomeScreen } from './HomeScreen.js';
import { LoginScreen } from './LoginScreen.js';
import { CategoryScreen } from './CategoryScreen.js';
import { TaskScreen } from './TaskScreen.js';
import { AddTaskScreen } from './AddTask.js';
import { PerformanceScreen } from './PerformanceScreen.js';
import { SuggestionsScreen } from './SuggestionsScreen.js';

const Stack = createNativeStackNavigator();

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const finish = () =>{
    wait(200).then(() => {
      setLoading(false);
    });
  }

  if(loading) {
    return <AppLoading
           startAsync={()=> console.log("Starting App.")}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  else{
    // contains all the screens of the application that the user can navigate to and from.
    return (
      <NavigationContainer>
        <Stack.Navigator>
          {
            loggedInUser.length > 0 &&
            <Stack.Group>
              <Stack.Screen name = "Home" component = {HomeScreen} />
              <Stack.Screen name = "Login" component = {LoginScreen} />
            </Stack.Group>
          }
          {
            loggedInUser.length == 0 &&
            <Stack.Group>
              <Stack.Screen name = "Login" component = {LoginScreen} />
              <Stack.Screen name = "Home" component = {HomeScreen} />
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
