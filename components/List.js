import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const List = (props) =>{
  return (
    <View style = {[styles.taskItem,{backgroundColor: props.list.color}]}>
      <View style={styles.taskLeft}>
      {
        (props.list.icon != "" && <MaterialCommunityIcons
          name={props.list.icon}
          size={30}
          style={{color:'#fff', marginRight: 10}}
        />)
      }
      {
        (props.list.icon == "" && <MaterialCommunityIcons
          name="clipboard-list"
          size={30}
          style={{color:'#fff', marginRight: 10}}
        />)
      }
        <Text style={styles.taskTxt}> {props.list.title} </Text>
      </View>
      <View style={styles.taskIcons}>
        <TouchableOpacity onPress={()=>props.delFun(props.list.id)}>
          <MaterialCommunityIcons
            name="trash-can"
            size={30}
            style={{color:'#fff'}}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{marginLeft: '2%'}} onPress={()=>props.editFun(props.list.id)}>
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
    padding: 15,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  taskLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  taskTxt: {
    paddingHorizontal:5,
    maxWidth: '85%'
  },
  taskIcons: {
    flexDirection: 'row',
  }
});
export default List
