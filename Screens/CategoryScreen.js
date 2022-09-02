import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView,
         KeyboardAvoidingView, Keyboard, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import List from '../components/List';
import Footer from '../components/Footer';
import {openDatabase} from '../components/OpenDatabase';
import {loggedIn, extractLoggedInUser} from '../components/database';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');

export function CategoryScreen({ navigation }) {
  // stores the mood of the button to switch between add and edit functions.
  const [buttonMode, setButtonMode] = useState("add");
  // stores the index of the category to be edited.
  const [editInd, setEditInd] = useState(null);
  // stores the category name added by the user in the input field.
  const [list, setList] = useState("");
  // stores the list of categories that belong to the logged in user.
  const [listItems, setListItems]= useState([]);
  // stores the state of the dropdown menu.
  const [open, setOpen] = useState(false);
  // stores the value of the color selected from the dropdown menu.
  const [value, setValue] = useState('#FFBEBE');
  // stores the list of the color items included in the dropdown menu
  const [items, setItems] = useState([
    {label: '', value: '#FFBEBE', icon: () => <View style={[styles.colorIcon,{backgroundColor:"#FFBEBE"}]} />},
    {label: '', value: '#90C2C2', icon: () => <View style={[styles.colorIcon,{backgroundColor:"#90C2C2"}]} />},
    {label: '', value: '#A7E0A7', icon: () => <View style={[styles.colorIcon, {backgroundColor:"#A7E0A7"}]} />},
    {label: '', value: '#E0F5B6', icon: () => <View style={[styles.colorIcon, {backgroundColor:"#E0F5B6"}]} />},
 ]);
 // stores the state of the header for controlling showing either the searchInput or the logged in user's name.
 const [headerState, setHeaderState] = React.useState(-1);
 // stores the text that the user types in the search input field.
 const [searchInput, setSearchInput] = React.useState("");

 // function for logging out the user by updating the state of the user from loggedin to loggedout in the users table.
 const logout = ()=>{
   db.transaction(tx => {
     tx.executeSql("UPDATE users SET state='loggedout' WHERE id =?", [loggedIn[0].id])
   })
   navigation.navigate('Login', { pass: ""})
 }
 // function for extracting the list of categories which belong to the logged in user.
 const refData = ()=>{
   extractLoggedInUser(db);
   db.transaction(tx => {
     // filtering the categories in the categories table by the user_id.
     tx.executeSql('SELECT * FROM categories WHERE user_id =?', [loggedIn[0].id],
       // assigns the ResultSet Object to the listItems List.
       (txObj, { rows: { _array } }) => setListItems(_array),
       // failure callback which sends two things Transaction object and Error
       (txObj, error) => console.log('Error ', error)
       ) // end executeSQL
   })
 }

 useEffect(() => {
   let isMounted = true;
   // calls the refData function for fetching the data from the database.
   refData();
   return () => { isMounted = false };
 },[]);

  // adds new category to the categories table only if the title of the list is not empty.
  const addList = () =>{
    Keyboard.dismiss();
    if(list != null && list != ""){
      db.transaction(async (tx)=>{
        await tx.executeSql(
          "INSERT INTO categories (user_id, title, color, icon) VALUES (?,?,?,?)", [loggedIn[0].id, list, value, ""]
        );
      });
      // fetching the data from the database after adding new category to show the updated date.
      refData();
    }
    // sending an alert to the user to add a category name.
    else{
      alert("The category must have a name! ")
    }
    setList(null);
  }
  // deletes the category from the categories table by its id, so it takes the category id as an input.
  const deleteList = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM categories WHERE id =?", [id]
      );
    });
    // fetching the data from the database after deleting the category to show the updated date.
    refData();
  }
  /*
    * function for setting the index of the category/list to be edited
    * it adds the category name to the input field to be edited.
    * it sets the color value to the color value of the category to be edited.
    * params: it takes the list (category) to be edited as an input.
  */
  const editVals = (list) =>{
    setEditInd(list);
    setList(list.title);
    setValue(list.color);
  }
  // extracts the category to be updated from the database by its id, so it takes the category id as an input.
  const editList = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "SELECT * FROM categories WHERE id =?", [id],
        (txObj, { rows: { _array } }) => editVals(_array[0]),
        (txObj, error) => console.log('Error ', error)
      );
    });
    // sets the button mode to edit instead of add.
    setButtonMode("edit");
    refData();
  }
  /*
    * edits the category by updating its properties to the values changed by the user.
    * params: it takes the category item to be updated as an input.
  */
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
    // fetching the data from the database after editing the category to show the updated date.
    refData();
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeView}>
        <View style={styles.usernameCont}>
          {/* user's vector icon */}
          <FontAwesome5
            name="user-alt"
            size={27}
            style={{color:'#fff', marginRight: 10}}
          />
          {/* if the state is -1, then the user's name will be displayed. */}
          {
            headerState == -1 &&
            <Text style={styles.title}>Hello, {loggedIn[0].username}</Text>
          }
          {/* if the state is 1, then the search inpur field will be displayed. */}
          {
            headerState == 1 &&
              <TextInput
                placeholder = "Search..."
                style={styles.searchInput}
                value= {searchInput}
                onChangeText={inputText => setSearchInput(inputText)}
              />
          }
          {/* on press, the value of the headerState switches between 1 and -1 */}
          <TouchableOpacity onPress = {() => setHeaderState(headerState*-1)}>
            <MaterialCommunityIcons
              name="magnify"
              size={30}
              style={{color:'#fff', marginRight: 10}}
            />
          </TouchableOpacity>
          {/* Logout component, and on press the logout function is called. */}
          <TouchableOpacity onPress = {() => logout()}>
            <MaterialCommunityIcons
              name="logout"
              size={30}
              style={{color:'#fff', marginRight: 10}}
            />
          </TouchableOpacity>
        </View>
        {/* Categories list container which displayes a list reusable component for each category belongs to the user. */}
        <View style={styles.listCont}>
          <ScrollView style={styles.scrollCont}>
            {
              listItems?.map((item, ind)=>{
                // only display the category that conatins the text typed by the user in the search input fields.
                // if the input field is empty, then all the categories will be displayed.
                // the text for both the category's name and entered text is converted to upper case for making the search to be case insensitive.
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
        {/* add/edit category container */}
        <View style ={styles.addTask}>
        <KeyboardAvoidingView style ={{width:'70%'}}>
        {/* adding/editing the name of the category in the input field */}
          <TextInput
            placeholder = "Add Category"
            style={styles.input}
            value = {list}
            onChangeText={text=>setList(text)}
          />
          </KeyboardAvoidingView>
          {/* dropdown menu for choosing the background color of the category */}
          <View>
             <Ionicons name="color-palette" size={40} style={styles.iconStyle} />
             <DropDownPicker
              items={items}
              open={open}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder=""
              showArrowIcon={false}
              style={styles.dropdownContent}
              dropDownContainerStyle={{
                width: 40,
                borderWidth:0,
                borderRadius:10,
                backgroundColor:"black",
              }}
            />
          </View>
          {/* The add/edit button which calls different functions and shows different icons according to its mode */}
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
                size={25}
                style={{color:'#fff'}}
              />
            </TouchableOpacity>
          }
        </View>
        {/* Adding the footer component with passing the navigation object as a prop */}
        <Footer nav={navigation}/>
        <StatusBar barStyle="light-content" backgroundColor= '#f4f6fc' />
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
    backgroundColor:'#206B6B',
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
    backgroundColor:'#206B6B',
    alignItems:'center',
    justifyContent: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  title:{
    fontFamily: "Skranji_700Bold",
    fontSize: 27,
    width:'67%',
    color: 'white',
  },
  colorIcon:{
    width:20,
    height:20,
    borderRadius:5,
  },
  iconStyle:{
    position: "absolute",
    bottom: "2%",
    color:"#206B6B"
  },
  dropdownContent: {
    width:30,
    backgroundColor: "transparent",
    borderColor: 'rgba(255, 255, 255, 0)',
    marginRight:"2%",
  },
  searchInput: {
    borderRadius:17,
    width:"67%",
    height: 60,
    fontSize: 18,
    color: 'white',
  },
});
