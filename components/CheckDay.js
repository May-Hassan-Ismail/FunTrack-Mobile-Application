import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CheckDay = (props) =>{
  return (
    <View style={[styles.taskCont]}>
      <View>
        <Text style={styles.taskTitle}> How was your day? </Text>
      </View>
      <View style ={styles.dayCheck}>
        <TouchableOpacity style ={ props.pressed == 1 && styles.checkCont} onPress={()=>{props.setPressed(1); props.addMoodStatus(props.user_id, props.date, 1);}}>
          <Text style={styles.taskTitle}> 1 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 2 && styles.checkCont} onPress={()=>{props.setPressed(2); props.addMoodStatus(props.user_id, props.date, 2);}}>
          <Text style={styles.taskTitle}> 2 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 3 && styles.checkCont} onPress={()=>{props.setPressed(3); props.addMoodStatus(props.user_id, props.date, 3);}}>
          <Text style={styles.taskTitle}> 3 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 4 && styles.checkCont} onPress={()=>{props.setPressed(4); props.addMoodStatus(props.user_id, props.date, 4);}}>
          <Text style={styles.taskTitle}> 4 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 5 && styles.checkCont} onPress={()=>{props.setPressed(5); props.addMoodStatus(props.user_id, props.date, 5);}}>
          <Text style={styles.taskTitle}> 5 </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.subTitle}> 5 is too good! </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#FF9999',
    padding:10,
    justifyContent:'center',
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 25,
    color:'white'
  },
  dayCheck:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-around',
    minHeight:50,
  },
  checkCont:{
    backgroundColor: '#44CCFF',
    width:50,
    height:50,
    borderRadius: 50,
    alignItems:'center',
    justifyContent: 'center',
  },
  subTitle:{
    marginHorizontal:"34%",
    color: 'white',
    fontWeight: 'bold',
  },
});
export default CheckDay
