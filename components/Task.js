import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const Task = (props) =>{
  const colorList= ['red', 'black', 'blue', 'grey'];
  const [isSelected, setSelection] = useState(false);
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
            style={{borderColor:colorList[props.task.priority]}}
          />
          <Text style={styles.taskTxt}> {props.task.title} </Text>
        </View>
        <View style = {{flexDirection:'row', marginLeft:'10%'}}>
          <Text style={styles.taskTxt}> {new Date(props.task.date).toString().slice(4, 10)} </Text>
          <Text style={{color:colorList[parseInt(props.task.priority)]}}> {props.task.time.slice(16, 21)} </Text>
        </View>
      </View>
      <View style={styles.taskIcons}>
        <TouchableOpacity onPress={()=>props.delFun(props.task.id)}>
          <MaterialCommunityIcons
            name="trash-can"
            size={30}
            style={{color:'#fff'}}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{marginLeft: '2%'}} onPress={() =>
          props.nav.navigate('AddTask', {title: props.title, category:props.task.category_id,
            task: props.task, index:props.index, mode:props.mode})}
        >
          <AntDesign
            name="edit"
            size={30}
            style={{color:'#fff'}}
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
