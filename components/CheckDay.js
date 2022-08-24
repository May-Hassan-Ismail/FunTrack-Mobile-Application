import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CheckDay = (props) =>{
  return (
    <View style={styles.taskCont}>
      <View>
        <Text style={styles.taskTitle}> How was your day? </Text>
      </View>
      <View style ={styles.dayCheck}>
        {/* different style appears only if the user chooses the component by pressing on it */}
        {/* on user press, the press state is set to the component number and the addMoodStatus function is called to add or update the mood level to the moods table in the database */}
        <TouchableOpacity style ={ props.pressed == 1 && styles.checkCont} onPress={()=>{props.setPressed(1); props.addMoodStatus(props.user_id, props.date, 1, props.db);}}>
          <Text style={styles.taskTitle}> 1 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 2 && styles.checkCont} onPress={()=>{props.setPressed(2); props.addMoodStatus(props.user_id, props.date, 2, props.db);}}>
          <Text style={styles.taskTitle}> 2 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 3 && styles.checkCont} onPress={()=>{props.setPressed(3); props.addMoodStatus(props.user_id, props.date, 3, props.db);}}>
          <Text style={styles.taskTitle}> 3 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 4 && styles.checkCont} onPress={()=>{props.setPressed(4); props.addMoodStatus(props.user_id, props.date, 4, props.db);}}>
          <Text style={styles.taskTitle}> 4 </Text>
        </TouchableOpacity>
        <TouchableOpacity style ={ props.pressed == 5 && styles.checkCont} onPress={()=>{props.setPressed(5); props.addMoodStatus(props.user_id, props.date, 5, props.db);}}>
          <Text style={styles.taskTitle}> 5 </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.subTitle}> 5 is Excellent! </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#FFBEBE',
    padding:10,
    justifyContent:'center',
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'black'
  },
  dayCheck:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-around',
    minHeight:50,
  },
  checkCont:{
    backgroundColor: '#D86161',
    width:50,
    height:50,
    borderRadius: 50,
    alignItems:'center',
    justifyContent: 'center',
  },
  subTitle:{
    marginHorizontal:"34%",
    color: 'black',
    fontWeight: 'bold',
  },
});
export default CheckDay
