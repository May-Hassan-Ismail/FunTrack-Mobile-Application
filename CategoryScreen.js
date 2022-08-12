import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, SafeAreaView,
         KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import List from './components/List';
import Footer from './components/Footer';
import {openDatabase} from './components/OpenDatabase';
import {loggedIn, extractLoggedInUser} from './components/database';

const db = openDatabase();

export function CategoryScreen({ navigation }) {
  // stores the task name.
  const [buttonMode, setButtonMode] = useState("add");
  const [editInd, setEditInd] = useState(null);
  const [list, setList] = useState("");
  const [listItems, setListItems]= useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('pink');
  const [items, setItems] = useState([
    {label: '', value: '#66B2ff', icon: () => <View style={[styles.colorIcon,{backgroundColor:"#66B2ff"}]} />},
    {label: '', value: 'pink', icon: () => <View style={[styles.colorIcon,{backgroundColor:"pink"}]} />},
    {label: '', value: '#B266ff', icon: () => <View style={[styles.colorIcon, {backgroundColor:"#B266ff"}]} />},
    {label: '', value: '#99FF99', icon: () => <View style={[styles.colorIcon, {backgroundColor:"#99FF99"}]} />},
 ]);
 const [headerState, setHeaderState] = React.useState(-1);
 const [searchInput, setSearchInput] = React.useState("");
 const logout = ()=>{
   db.transaction(tx => {
     // sending 4 arguments in executeSql
     tx.executeSql("UPDATE users SET state='loggedout' WHERE id =?", [loggedIn[0].id])
   })
   navigation.navigate('Login', { pass: ""})
 }
 const refData = ()=>{
   extractLoggedInUser();
   db.transaction(tx => {
     // sending 4 arguments in executeSql
     tx.executeSql('SELECT * FROM categories WHERE user_id =?', [loggedIn[0].id],
       // success callback which sends two things Transaction object and ResultSet Object
       (txObj, { rows: { _array } }) => setListItems(_array),
       // failure callback which sends two things Transaction object and Error
       (txObj, error) => console.log('Error ', error)
       ) // end executeSQL
   })
 }
 useEffect(() => {
   let isMounted = true;
   refData();
   return () => { isMounted = false };
 },[]);

  // adds new list to the lists array only if the title of the list is not empty.
  const addList = () =>{
    Keyboard.dismiss();
    if(list != null && list != ""){
      //setListItems([...listItems, {text:list, color: value, icon:""}])
      db.transaction(async (tx)=>{
        await tx.executeSql(
          "INSERT INTO categories (user_id, title, color, icon) VALUES (?,?,?,?)", [loggedIn[0].id, list, value, ""]
        );
      });
      refData();
    }
    setList(null);
  }
  // delete specific list from the lists array by the index.
  const deleteList = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM categories WHERE id =?", [id]
      );
    });
    refData();
  }
  const editVals = (list) =>{
    setEditInd(list);
    setList(list.title);
    setValue(list.color);
  }
  // edit specific list from the lists array by the index.
  const editList = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "SELECT * FROM categories WHERE id =?", [id],
        (txObj, { rows: { _array } }) => editVals(_array[0]),
        (txObj, error) => console.log('Error ', error)
      );
    })
    setButtonMode("edit");
    refData();
  }
  // change the list in that index to the newly edited list.
  const addEdited = (item)=>{
    Keyboard.dismiss();
    if(list != null && list != ""){
      db.transaction(async (tx)=>{
        await tx.executeSql(
          "UPDATE categories SET user_id=?, title=?, color=?, icon=? WHERE id =?",
          [item.user_id, list, value, item.icon, item.id]
        );
      })
    }
    setList("");
    // reset the mode of the button to add again.
    setButtonMode("add");
    refData();
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeView}>
        <View style={styles.usernameCont}>
          <FontAwesome5
            name="user-alt"
            size={30}
            style={{color:'#fff', marginRight: 10}}
          />
          {
            headerState == -1 &&
            <Text style={styles.title}>Hello, {loggedIn[0].username}</Text>
          }
          {
            headerState == 1 &&
              <TextInput
                placeholder = "Search..."
                style={styles.searchInput}
                value= {searchInput}
                onChangeText={inputText => setSearchInput(inputText)}
              />
          }
          <TouchableOpacity onPress = {() => setHeaderState(headerState*-1)}>
            <MaterialCommunityIcons
              name="magnify"
              size={30}
              style={{color:'#fff', marginRight: 10}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress = {() => logout()}>
            <MaterialCommunityIcons
              name="logout"
              size={30}
              style={{color:'#fff', marginRight: 10}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.listCont}>
          <ScrollView style={styles.scrollCont}>
            {
              listItems?.map((item, ind)=>{
                if(item.title.toUpperCase().includes(searchInput.toUpperCase())){
                  return(
                    <TouchableOpacity key={ind}
                      onPress={() =>
                        navigation.navigate('List', { category: item.id, title:item.title,
                           task:{name:"", date:"", time: "", color:""} })}
                    >
                      <List list={item} delFun={deleteList} editFun={editList} index={ind}/>
                    </TouchableOpacity>

                  );
                }
              })
            }
          </ScrollView>
        </View>
        <View style ={styles.addTask}>
        <KeyboardAvoidingView style ={{width:'70%'}}>
          <TextInput
            placeholder = "Add List"
            style={styles.input}
            value = {list}
            onChangeText={text=>setList(text)}
          />
          </KeyboardAvoidingView>
          <View>
             <DropDownPicker
              items={items}
              open={open}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="C"
              showArrowIcon={false}
              placeholderStyle={{
                color: "pink",
                fontWeight: "bold",
              }}
              style={{
                width: 30,
                borderWidth:0,
                backgroundColor:'black',
              }}
              dropDownContainerStyle={{
                width: 40,
                borderWidth:0,
                borderRadius:10,
              }}
            />
          </View>
          {
            buttonMode=="add" ?
            <TouchableOpacity
              style ={styles.addTaskButton}
              onPress={()=>addList()}
            >
              <FontAwesome5
                name="plus"
                size={30}
                style={{color:'#fff'}}
              />
            </TouchableOpacity> :
            <TouchableOpacity
              style ={styles.addTaskButton}
              onPress={()=>addEdited(editInd)}
            >
              <FontAwesome5
                name="edit"
                size={30}
                style={{color:'#fff'}}
              />
            </TouchableOpacity>
          }
          <StatusBar barStyle="light-content" backgroundColor= '#f4f6fc' />
        </View>
        <Footer nav={navigation}/>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  safeView:{
    flex: 1,
    height: '100%',
  },
  usernameCont:{
    backgroundColor:'#33AAFF',
    height:'15%',
    paddingHorizontal: 15,
    alignItems:'center',
    flexDirection:"row",
  },
  listCont: {
    paddingTop:20,
    paddingHorizontal:20,
  },
  scrollCont: {
    height: '65%',
  },
  addTask: {
    position:'absolute',
    bottom:70,
    width:'100%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-around',
    paddingHorizontal:10,
  },
  input: {
    padding:15,
    backgroundColor:'#FFFFFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: "100%",
  },
  addTaskButton: {
    width:60,
    height:60,
    borderRadius: 60,
    backgroundColor:'#33AAFF',
    alignItems:'center',
    justifyContent: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  title:{
    fontFamily: "Skranji_700Bold",
    fontSize: 30,
    width:'67%',
  },
  colorIcon:{
    width:20,
    height:20,
    borderRadius:5,
  },
  searchInput: {
    borderRadius:17,
    width:"67%",
    height: 60,
    fontSize: 18,
  },
});
