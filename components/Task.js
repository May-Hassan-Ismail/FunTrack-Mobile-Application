import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import CheckBox from 'expo-checkbox';
import { MaterialCommunityIcons, AntDesign, FontAwesome } from '@expo/vector-icons';

let priorityColor;
const Task = (props) =>{
  const colorList= ['red', 'black', 'blue', 'grey'];
  const [isSelected, setSelection] = useState(false);
  priorityColor = colorList[props.task.priority];
  const change= ()=>{
    if(isSelected){
      setSelection(false);
    }
    else{
      setSelection(true);
    }
    props.compFun(props.task.id);
  }
  return (
    <View style = {styles.taskItem}>
      <View style = {styles.taskLeft}>
        <View style = {{flexDirection:'row'}}>
          <CheckBox
            value={props.selected}
            onValueChange={change}
          />
          <Text style={styles.taskTxt}> {props.task.title} </Text>
        </View>
        <View style = {{flexDirection:'row', marginLeft:'10%'}}>
          <Text style={styles.taskTxt}> {new Date(props.task.date).toString().slice(4, 10)} </Text>
          <Text style={styles.taskTxt}> {props.task.time.slice(16, 21)} </Text>
          <FontAwesome name="flag" size={18} style={{marginHorizontal:6, marginTop:3}} color={colorList[props.task.priority]} />
        </View>
      </View>
      <View style={styles.taskIcons}>
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
  safeView:{
    flex: 1,
    height: '100%',
  },
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
