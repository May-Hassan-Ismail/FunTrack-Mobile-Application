import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';
import { MaterialCommunityIcons, AntDesign, FontAwesome } from '@expo/vector-icons';

let priorityColor;
const Task = (props) =>{
  // Priority color list, so each priority level is represented by the color in that index.
  const colorList= ['red', 'black', 'blue', 'grey'];
  // state value to control checking and unchecking the checkbox.
  const [isSelected, setSelection] = useState(false);
  // extract the color that represents the task's priority level.
  priorityColor = colorList[props.task.priority];

  // function for switching the isSelected value for checking and unchecking the task's checkbox.
  const valChange= ()=>{
    if(isSelected){
      setSelection(false);
    }
    else{
      setSelection(true);
    }
    // compFun which is passed with the props, it marks the task as completed or uncompleted according to the current state.
    props.compFun(props.task.id);
  }
  return (
    <View style = {styles.taskItem}>
      <View style = {styles.taskLeft}>
        {/* task component showing the title, date and time and a flag that represents the priority level */}
        <View style = {{flexDirection:'row'}}>
          <CheckBox
            value={props.selected}
            onValueChange={valChange}
          />
          <Text style={styles.taskTxt}> {props.task.title} </Text>
        </View>
        <View style = {{flexDirection:'row', marginLeft:'10%'}}>
          <Text style={styles.taskTxt}> {new Date(props.task.date).toString().slice(4, 10)} </Text>
          <Text style={styles.taskTxt}> {props.task.time.slice(16, 21)} </Text>
          <FontAwesome name="flag" size={18} style={{marginHorizontal:6, marginTop:3}} color={colorList[props.task.priority]} />
        </View>
      </View>
      {/* task component icons, including the edit and delete icons */}
      <View style={styles.taskIcons}>
        {/* edit icon, which navigates to the AddTask screen for editing the task with passing the task itself with the props */}
        <TouchableOpacity style={{marginHorizontal: '7%'}} onPress={() =>
          props.nav.navigate('AddTask', {navTitle: props.navTitle, title: props.title, category:props.task.category_id,
            task: props.task, index:props.index, mode:props.mode})}
        >
          <AntDesign
            name="edit"
            size={30}
            style={{color:'#000'}}
          />
        </TouchableOpacity>
        {/* delete icon, which on press calls the delFun function that's passed with the props to delete the task by its id */}
        <TouchableOpacity onPress={()=>props.delFun(props.task.id)}>
          <MaterialCommunityIcons
            name="delete"
            size={30}
            style={{color:'#000'}}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  taskItem: {
    padding: 6,
    margin: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex:2,
  },
  taskLeft: {
    flexDirection: 'column',
    flex:3,
    flexWrap: "wrap",
  },
  taskTxt: {
    paddingHorizontal:5,
  },
  taskIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex:1,
  },
});
export default Task
