import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useFonts, Skranji_700Bold } from '@expo-google-fonts/skranji';
import AppLoading from 'expo-app-loading';
import {createUser, authenticateUser} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';

// open the TodoDB database
const db = openDatabase('db.TodoDB');

export function LoginScreen({route, navigation }) {
  // login state for either displaying the Login screen if it's true or the Signup screen if it's false.
  const [login, setLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let isMounted = true;
    // resets the page after navigation.
    if(route.params){
      setLogin(true);
      setPassword("");
    }
    return () => { isMounted = false };
  },[route]);

  // loading Skranji_700Bold font to be used with the headers.
  let [fontsLoaded] = useFonts({
    Skranji_700Bold,
  });
 // shows loading icon if font isn't loaded.
  if (!fontsLoaded) {
    return <AppLoading />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Image style= {styles.logo} source = {require("../assets/Logo.png")}/>
        <Text style={styles.title}>FunTrack</Text>
      </View>
      <View style={styles.inputView}>
        <TextInput
            style={styles.TextInput}
            placeholder='Enter your name'
            onChangeText={(value) => setName(value)}
            value = {name}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
            style={styles.TextInput}
            placeholder='Enter your password'
            onChangeText={(value) => setPassword(value)}
            value = {password}
        />
      </View>
      {/* Create new account clickable component appears only in the login screen */}
      {
        login &&
        <TouchableOpacity onPress={() => setLogin(false)}>
          <Text style={styles.signup_button}>Create New Account?</Text>
        </TouchableOpacity>
      }
      {/* Login to existing Account clickable component appears only in the login screen */}
      {
        login==false &&
        <TouchableOpacity onPress={() => setLogin(true)}>
          <Text style={styles.signup_button}>Login to existing Account?</Text>
        </TouchableOpacity>
      }
      {/* Login button only appears in the Login screen and calls authenticateUser function on user click. */}
      {
        login &&
        <TouchableOpacity style={styles.button}
          onPress={() =>
            authenticateUser(name, password, navigation, db)}
        >
          <Text style={styles.buttonTxt}> Login </Text>
        </TouchableOpacity>
      }
      {/* Signup button only appears in the Signup screen and calls createUser function on user click. */}
      {
        login==false &&
        <TouchableOpacity style={styles.button}
          onPress={() =>
            createUser(name, password, navigation, db)}
        >
          <Text style={styles.buttonTxt}> Sign up </Text>
        </TouchableOpacity>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  head:{
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '9%',
  },
  logo :{
    width: 100,
    height: 100,
    marginLeft: '15%',
    resizeMode: 'contain'
  },
  title:{
    marginRight: '15%',
    fontFamily: "Skranji_700Bold",
    fontSize: 35,
    color: '#206B6B'
  },
  inputView: {
   backgroundColor: "#D3F1D3",
   borderRadius: 30,
   width: "70%",
   height: 45,
   marginBottom: 20,
   alignItems: "center",
 },
 TextInput: {
   height: 50,
   flex: 1,
   padding: 10,
   marginLeft: 20,
 },
 signup_button: {
    height: 30,
    marginBottom: 30,
  },
  button: {
   width:"80%",
   borderRadius:25,
   height:50,
   alignItems:"center",
   justifyContent:"center",
   marginTop:40,
   backgroundColor:"#206B6B",
 },
 buttonTxt:{
   color: 'white',
 }
});
