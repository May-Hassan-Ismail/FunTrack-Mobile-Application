import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const List = (props) =>{
  return (
    <View style = {[styles.taskItem, {backgroundColor: props.list.color}]}>
    {/* the cntainer's background color is the color of the list (category) item */}
      <View style={styles.taskLeft}>
      {
        (props.list.icon != "" && <MaterialCommunityIcons
          name={props.list.icon}
          size={30}
          style={{color:'#000', marginRight: 10}}
        />)
      }
      {/* show the default list vector icon if the categorie's icon is empty */}
      {
        (props.list.icon == "" && <MaterialCommunityIcons
          name="clipboard-list"
          size={30}
          style={{color:'#000', marginRight: 10}}
        />)
      }
        <Text style={styles.taskTxt}> {props.list.title} </Text>
      </View>
      <View style={styles.taskIcons}>
        {/* the edit icon which calles the passed editFun prop with the category's id as the input. */}
        <TouchableOpacity style={{marginRight: '7%'}} onPress={()=>props.editFun(props.list.id)}>
          <AntDesign
            name="edit"
            size={30}
            style={{color:'#000'}}
          />
        </TouchableOpacity>
        {/* the delete icon which calles the passed delFun prop with the category's id as the input. */}
        <TouchableOpacity onPress={()=>props.delFun(props.list.id)}>
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
