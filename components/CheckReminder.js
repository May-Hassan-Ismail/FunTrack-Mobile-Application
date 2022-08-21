import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CheckReminder = (props) =>{
  return (
    <View style ={styles.rowSet}>
      <TouchableOpacity style ={ props.pressed == 0 ? styles.checkCont: styles.notCheckCont} onPress={()=>props.setPressed(0)}>
        <Text style={styles.reminderTitle}> on the </Text>
        <Text style={styles.reminderTitle}> day </Text>
      </TouchableOpacity>
      <TouchableOpacity style ={ props.pressed == 1 ? styles.checkCont: styles.notCheckCont} onPress={()=>props.setPressed(1)}>
        <Text style={styles.reminderTitle}> 1 day </Text>
        <Text style={styles.reminderTitle}> early </Text>
      </TouchableOpacity>
      <TouchableOpacity style ={ props.pressed == 2 ? styles.checkCont: styles.notCheckCont } onPress={()=>props.setPressed(2)}>
        <Text style={styles.reminderTitle}> 2 days </Text>
        <Text style={styles.reminderTitle}> early </Text>
      </TouchableOpacity>
      <TouchableOpacity style ={ props.pressed == 3 ? styles.checkCont: styles.notCheckCont} onPress={()=>props.setPressed(3)}>
        <Text style={styles.reminderTitle}> 3 days </Text>
        <Text style={styles.reminderTitle}> early </Text>
      </TouchableOpacity>
      <TouchableOpacity style ={ props.pressed == 7 ? styles.checkCont: styles.notCheckCont} onPress={()=>props.setPressed(7)}>
        <Text style={styles.reminderTitle}> 1 week </Text>
        <Text style={styles.reminderTitle}> early </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rowSet:{
    width:"90%",
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-around',
  },
  reminderTitle:{
    fontSize:14,
    fontWeight:'bold',
  },
  checkCont:{
    backgroundColor: '#C7E3E3',
    width:60,
    height:60,
    borderRadius: 60,
    alignItems:'center',
    justifyContent: 'center',
  },
  notCheckCont:{
    width:60,
    height:60,
    borderRadius: 60,
    alignItems:'center',
    justifyContent: 'center',
  },
});
export default CheckReminder
