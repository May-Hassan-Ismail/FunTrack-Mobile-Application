import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, AntDesign, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const screenHeight = Dimensions.get("window").height;
const Footer = (props) =>{
  const currentDate = new Date().toString().slice(0, 15);
  return (
    <View style ={styles.footerCont}>
      <TouchableOpacity onPress={() =>
        props.nav.navigate('Home', { title: "HomeScreen", date:currentDate })}>
        <Ionicons
          name="calendar"
          size={35}
          style={{color:'#fff'}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() =>
        props.nav.navigate('Performance', { title: "Performance Screen", date:currentDate })}
      >
        <AntDesign
          name="areachart"
          size={35}
          style={{color:'#fff'}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() =>
        props.nav.navigate('List', { title: "Today", date:currentDate })}
      >
        <FontAwesome5
          name="calendar-check"
          size={35}
          style={{color:'#fff'}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() =>
        props.nav.navigate('Suggestions', { title: "Suggestions Screen", date:currentDate })}
      >
        <MaterialCommunityIcons
          name="head-lightbulb-outline"
          size={35}
          style={{color:'#fff'}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>props.nav.navigate('Category', { title: "Category Screen", date:currentDate })}>
        <Ionicons
          name="settings"
          size={35}
          style={{color:'#fff'}}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  safeView:{
    flex: 1,
    height: '100%',
  },
  footerCont:{
    position:'absolute',
    bottom:0,
    width:'100%',
    backgroundColor:'#206B6B',
    height: screenHeight*0.073,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-around',
  },
});

export default Footer
