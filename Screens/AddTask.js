import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, Dimensions,
         KeyboardAvoidingView, Platform } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Footer from '../components/Footer';
import CheckReminder from '../components/CheckReminder';
import {loggedIn} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');
// getting the time zone offset for handling the time zone according to user's location.
const offset = new Date().getTimezoneOffset()

// use dimensions for getting the screen's width, and height to make the application responsive.
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

 export function AddTaskScreen({ route, navigation }) {
   // stores the custom style for the selected date in the calendar.
   const [customStyle, setCustomStyle] = useState([{}]);
   // switches the mode between add and edit.
   const [mode, setMode] = useState("add");
   // stores the task index if the mode is edit and there's a task to be updated.
   const [index, setIndex] = useState(null);
   // stores the task to be updated when the mode is edit.
   const [task, setTask] = useState("");
   // stores the category of the task to be updated, when the mode is edit.
   const [category, setCategory] = useState(route.params.category);
   // stores the list of categories for the user to choose a category for the task to be added/edited.
   const [catList, setCatList] = useState([{label:"placeholder", value: 1, labelStyle: {color: '#FFBEBE'}}]);
   // state to handle opening and closing the category dropdown menu.
   const [catOpen, setCatOpen] = useState(false);
   // stores the selected date in the calendar picker.
   const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (offset*60*1000)));
   // state for selecting the reminder date.
   const [pressed, setPressed]= useState(0);
   // state to handle opening and closing the time picker.
   const [timePicker, setTimePicker] = useState(false);
   // stores the time picked from the time picker.
   const [time, setTime] = useState(new Date(Date.now()));
   // state to handle opening and closing the priority dropdown menu.
   const [open, setOpen] = useState(false);
   // value of the priority and the default is number 3 which means no priority.
   const [value, setValue] = useState("3");
   // stores the screen the user is navigated from to navigate to after adding/editing the task.
   const [navScreen, setNavScreen] = useState('List');
   // priority items list which contains the options of the priority levels for the user to choose from.
   const [items, setItems] = useState([
     {label: 'High Priority', value: '0', labelStyle: {color: "red"},
      icon: () => <Image source={require('../assets/high.png')} style={{width:15, height:15}} />},
     {label: 'Medium Priority', value: '1', labelStyle: {color: "black"},
      icon: () => <Image source={require('../assets/medium.png')} style={{width:15, height:15}} />},
     {label: 'Low Priority', value: '2', labelStyle: {color: "blue"},
      icon: () => <Image source={require('../assets/low.png')} style={{width:15, height:15}} />},
     {label: 'No Priority', value: '3', labelStyle: {color: "grey"},
      icon: () => <Image source={require('../assets/no.png')} style={{width:15, height:15}} />},
  ]);

  // function extracts the user's categories to add them to the dropdown menu for the user to choose from.
  const extractCategories = ()=>{
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM categories WHERE user_id =?', [loggedIn[0].id],
        // calls the createCatDataItems for creating the list of categories for the dropdown menu.
        (txObj, { rows: { _array } }) => createCatDataItems(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        )
    });
  }

  /*
    * creates the list of categories for the dropdown menu, including the label, value and style of each category.
    * params: it takes the list of user's categories as an input:
  */
  const createCatDataItems = (list)=>{
    let catArray = [];
    list?.map((item, key)=>{
      catArray.push({label:item.title, value: item.id, labelStyle: {color: item.color}});
    })
    setCatList(catArray);
  }

  useEffect(() => {
    extractCategories();
    // set the navigation screen to the screen which the user is navigated from.
    setNavScreen(route.params.navTitle);
    // if there is a task in the route's parameters, then the user is navigated to the AddTask screen to edit a task so the mode is set to update.
    // all the values are set to the values of the task to be updated, including the time, title, date, category, priority, id, and reminder_date.
    if(route.params.task != ""){
      setTask(route.params.task.title);
      setSelectedDate(new Date(route.params.task.date));
      setTime(new Date(route.params.task.time));
      setValue(route.params.task.priority);
      setCategory(route.params.task.category_id);
      setMode("update");
      setIndex(route.params.task.id);
      onInitialDate();
      setPressed(Math.floor((new Date(route.params.task.date) -
                 new Date(route.params.task.reminder_date))/ (24*3600*1000)));
    }
    // if there's no task but the route's parameters contains a specific date, then the user is navigated from the HomeScreen.
    // the selected date will be set to that date for adding a task with the same date that the user selected in the Homescreen.
    else if(route.params.date != ""){
      setSelectedDate(new Date(route.params.date));
      onInitialDate();
    }
  }, [route]);

  // if there's an initial date a custom style will be added to it.
  const onInitialDate = () =>{
    let date = route.params.task.date || route.params.date;
    // custom style object will be created for that date and it will appear in the calendar picker.
    if(date != "" ){
      const obj={
        date:new Date(date),
        style: {backgroundColor: '#90C2C2'},
        textStyle: {color: 'black'},
        containerStyle: [],
        allowDisabled: true,
      }
      setCustomStyle([obj]);
    }
  }

  // function to handle the date change in the calendar picker and it takes the newly selected date as an input.
  const onDateChange = (date) => {
   const currentDate = date || selectedDate;
   setSelectedDate(currentDate);
   setCustomStyle([{}]);
  };

  // function to handle the time selection for the time picker and it takes the event and the selected time value as inputs.
  const onTimeSelected = (event, value) => {
    setTimePicker(false);
    setTime(value);
  };

  // function to reset and clear everything is changed on the screen.
  const clear = () =>{
    setTask("");
    setTime(new Date());
    setSelectedDate(new Date(new Date().getTime() - (offset*60*1000)));
    setPressed(0);
    setTimePicker(false);
    setValue("3");
  }
   return (
     <View style={styles.container}>
       <SafeAreaView style={styles.safeView}>
        {/* I had issue with ios that the dropdown menu wasn't overlapping the other components so I adjusted this by styling */}
         <View style={[Platform.OS === 'ios' ? {zIndex: 2} : {}, styles.searchCont]}>
           <View style ={styles.buttonSet}>
           {/* Priority dropdown menu */}
            <View>
               <DropDownPicker
                items={items}
                open={open}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="P"
                showArrowIcon={false}
                placeholderStyle={{
                  color: "white",
                  fontWeight: "bold",
                }}
                style={{
                  width: 30,
                  borderWidth:0,
                  backgroundColor:'#206B6B',
                  marginRight:"2%",
                }}
                dropDownContainerStyle={{
                  width: screenWidth * 0.38,
                  borderWidth:0,
                  marginVertical:"3%",
                }}
              />
            </View>
            {/* category dropdown menu */}
            <View style={{marginRight:1}}>
              <DropDownPicker
               items={catList}
               open={catOpen}
               setOpen={setCatOpen}
               setValue={setCategory}
               setItems={setCatList}
               placeholder="C"
               showArrowIcon={false}
               placeholderStyle={{
                 color: "white",
                 fontWeight: "bold",
               }}
               style={{
                 width: 30,
                 borderWidth:0,
                 backgroundColor:'#206B6B',
                 marginRight:"2%",
               }}
               dropDownContainerStyle={{
                 width: screenWidth * 0.38,
                 backgroundColor:'black',
                 borderWidth:0,
                 marginVertical:"3%",
               }}
             />
            </View>
           </View>
           {/* Text input for the user to type or edit the task name */}
           <KeyboardAvoidingView
               style ={styles.addTask, {flex:3}}
           >
             <TextInput
               placeholder = "What would you like to do?"
               style={styles.input}
               value = {task}
               onChangeText={text=>setTask(text)}
             />
           </KeyboardAvoidingView>
          </View>
         <View style={styles.headCont}>
           <Text style={styles.title}> Set Date: </Text>
         </View>
         {/* Calendar picker for the user to choose the task's date */}
         <View style ={styles.DatePick}>
           <CalendarPicker
             startFromMonday={true}
             minDate={new Date(2018, 1, 1)}
             maxDate={new Date(2030, 6, 3)}
             weekdays={['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']}
             months={[
               'January',
               'Febraury',
               'March',
               'April',
               'May',
               'June',
               'July',
               'August',
               'September',
               'October',
               'November',
               'December',
             ]}
             previousTitle="Previous"
             nextTitle="Next"
             todayBackgroundColor="#FFBEBE"
             selectedDayColor="#90C2C2"
             selectedDayTextColor="#000000"
             scaleFactor={375}
             textStyle={{
               fontFamily: 'serif',
               color: '#000000',
             }}
             width={screenWidth * 0.9}
             height={screenHeight*0.5}
             initialDate={selectedDate}
             onDateChange={onDateChange}
             customDatesStyles={customStyle}
           />
         </View>
         <View>
           <View style={styles.headCont}>
             <Text style={styles.title}>Set time:</Text>
           </View>
           {/* Time picker for the user to choose the task's time and the touchable components to open the time picker on press */}
           <View style={styles.timeDisplay}>
             <TouchableOpacity style={styles.timeBox} onPress={()=>{setTimePicker(true)}}>
              <Text style={styles.timeText}>{time.toString().slice(16, 18)}</Text>
             </TouchableOpacity>
             <Text style={styles.timeText}>:</Text>
             <TouchableOpacity style={styles.timeBox} onPress={()=>{setTimePicker(true)}}>
              <Text style={styles.timeText}>{time.toString().slice(19, 21)}</Text>
             </TouchableOpacity>
           </View>
           {timePicker && (
               <DateTimePicker
                  value={time}
                  mode={'time'}
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? "spinner" : "default"}
                  onChange={onTimeSelected}
               />
            )}
          </View>
          <View>
            <View style={styles.headCont}>
              <Text style={styles.title}>Set Reminder:</Text>
            </View>
            {/* CheckReminder component for the user to choose the reminder date for the task to be added/edited */}
            <View style={{height:screenHeight*0.065, alignItems:'center'}}>
              <CheckReminder pressed={pressed} setPressed={setPressed}/>
            </View>
           </View>
           {/* clear button to reset the whole page */}
           <View style ={styles.buttonSet}>
            <TouchableOpacity style ={styles.button} onPress={()=>{clear()}}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            {/* cancel button to navigate back to the previous screen without adding or editing the task */}
            <TouchableOpacity style ={[styles.button, {marginLeft:'30%'}]} onPress={() =>
              navigation.navigate(navScreen, { title: route.params.title, category: category,
                 mode: mode, index: index, contMode:route.params.mode,
                 task:{name:"", date:"", time: "", color:"", rem_date:""}})}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            {/* ok button to navigate back to the previous screen with the task to be added/edited by passing all the data with the parameters */}
            <TouchableOpacity style ={styles.button} onPress={() =>{
              if(task == ""){
                alert("Task must have a title");
              }else{
                console.log(selectedDate);
              navigation.navigate(navScreen, { title: route.params.title, category: category,
                 mode: mode, index: index, contMode:route.params.mode,
                 task:{name:task, date:new Date(selectedDate).toISOString().slice(0,10), time: time.toString(), color:value,
                   rem_date: new Date(new Date(selectedDate).valueOf() - 86400000 * pressed).toString().slice(0,15) } })}}}>
              <Text style={styles.buttonText}>Ok</Text>
            </TouchableOpacity>
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
   title:{
     fontFamily: "Skranji_700Bold",
     fontSize: 20,
     color:'#206B6B',
   },
   headCont:{
     flexDirection:'column',
     margin:3,
     paddingHorizontal:20,
   },
   safeView:{
     flex: 1,
     height: '100%',
   },
   searchCont:{
     flexDirection:'row',
     paddingHorizontal:10,
   },
   addTask: {
     paddingHorizontal:10,
     justifyContent: 'space-around',
   },
   input: {
     paddingVertical: 10,
     paddingHorizontal: 15,
     backgroundColor:'#C7E3E3',
     borderRadius: 60,
     borderColor: '#C0C0C0',
     borderWidth: 1,
     marginVertical:"3%",
   },
  DatePick:{
    backgroundColor:'#E0F5B6',
    marginHorizontal:10,
    borderRadius: 20,
    padding:10,
    height: screenHeight*0.37,
    marginVertical:3,
  },
  timeDisplay:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'center',
    height:screenHeight*0.06,
  },
  timeBox:{
    borderWidth:3,
    paddingHorizontal: 5,
    marginHorizontal:5,
  },
  timeText:{
    fontSize:25,
    fontWeight:'bold'
  },
  buttonSet:{
    marginTop:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'space-around',
    height:screenHeight*0.06,
  },
  button:{
    backgroundColor:'#FFBEBE',
    margin:5,
    paddingHorizontal:5,
    borderRadius: 10,
  },
  buttonText:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'#206B6B',
  },
 });
