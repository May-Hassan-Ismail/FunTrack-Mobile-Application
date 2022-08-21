import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import {createUser, authenticateUser} from './components/database';
import { useFonts, Skranji_700Bold } from '@expo-google-fonts/skranji';
import AppLoading from 'expo-app-loading';
import {openDatabase} from './components/OpenDatabase';

const db = openDatabase('db.TodoDB');

export function LoginScreen({route, navigation }) {
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

  if(login){
    return (
      <View style={styles.container}>
        <View style={styles.head}>
          <Image style= {styles.logo} source = {require("./assets/Logo.png")}/>
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
        <TouchableOpacity onPress={() => setLogin(false)}>
          <Text style={styles.signup_button}>Create New Account?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() =>
            authenticateUser(name, password, navigation, db)}
        >
          <Text> Login </Text>
        </TouchableOpacity>
      </View>
    )
  }else{
    return (
      <View style={styles.container} >
      <View style={styles.head}>
        <Image style= {styles.logo} source = {require("./assets/Logo.png")}/>
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
        <TouchableOpacity onPress={() => setLogin(true)}>
          <Text style={styles.signup_button}>Login to existing Account?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() =>
            createUser(name, password, navigation, db)}
        >
          <Text> Sign up </Text>
        </TouchableOpacity>
      </View>
    )
  }
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
  },
  inputView: {
   backgroundColor: "#FFC0CB",
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
   backgroundColor:"#33AAFF",
 }
})
