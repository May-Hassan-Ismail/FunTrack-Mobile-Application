import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, Dimensions,
         ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Button } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { MaterialIcons, AntDesign, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Footer from './components/Footer';
import CheckReminder from './components/CheckReminder';
import DropDownPicker from 'react-native-dropdown-picker';

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
 export function AddTaskScreen({ route, navigation }) {

   const [customStyle, setCustomStyle] = useState([{}]);
   const [mode, setMode] = useState("add");
   const [index, setIndex] = useState(null);
   const [task, setTask] = useState("");
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [pressed, setPressed]= useState(0);
   const [timePicker, setTimePicker] = useState(false);
   const [time, setTime] = useState(new Date(Date.now()));
   const [open, setOpen] = useState(false);
   const [value, setValue] = useState("3");
   const [navScreen, setNavScreen] = useState('List');
   const [items, setItems] = useState([
     {label: 'High Priority', value: '0', labelStyle: {color: "red"},
      icon: () => <Image source={require('./assets/high.png')} style={{width:15, height:15}} />},
     {label: 'Medium Priority', value: '1', labelStyle: {color: "black"},
      icon: () => <Image source={require('./assets/medium.png')} style={{width:15, height:15}} />},
     {label: 'Low Priority', value: '2', labelStyle: {color: "blue"},
      icon: () => <Image source={require('./assets/low.png')} style={{width:15, height:15}} />},
     {label: 'No Priority', value: '3', labelStyle: {color: "grey"},
      icon: () => <Image source={require('./assets/no.png')} style={{width:15, height:15}} />},
  ]);

  useEffect(() => {
    if(route.params.title == "HomeScreen") setNavScreen('Home');
    if(route.params.task != ""){
      console.log(route.params.task);
      setTask(route.params.task.title);
      setSelectedDate(new Date(route.params.task.date));
      setTime(new Date(route.params.task.time));
      setValue(route.params.task.priority);
      setMode("update");
      setIndex(route.params.task.id);
      onInitialDate();
      setPressed(Math.floor((new Date(route.params.task.date) -
                 new Date(route.params.task.reminder_date))/ (24*3600*1000)));
    }
    else if(route.params.date != ""){
      setSelectedDate(new Date(route.params.date));
      onInitialDate();
    }
  }, [route]);

  // if there's an initial date a custom style will be added to it.
  const onInitialDate = () =>{
    let date = route.params.task.date|| route.params.date;
    if(date != "" ){
      const obj={
        date:new Date(date),
        style: {backgroundColor: '#44CCFF'},
        textStyle: {color: 'black'},
        containerStyle: [],
        allowDisabled: true,
      }
      setCustomStyle([obj]);
    }
  }

  //function to handle the date change
  const onDateChange = (date) => {
   const currentDate = date || selectedDate;
   setSelectedDate(currentDate);
   setCustomStyle([{}]);
  };

  // function to handle the time selection for the time picker.
  const onTimeSelected = (event, value) => {
    setTimePicker(false);
    setTime(value);
  };

  // function to reset and clear everything is changed on the screen.
  const clear = () =>{
    setTask("");
    setTime(new Date());
    setSelectedDate(new Date());
    setPressed(0);
    setTimePicker(false);
  }
   return (
     <View style={styles.container}>
       <SafeAreaView style={styles.safeView}>
         <View style={{zIndex: 2, flexDirection:'row', paddingHorizontal:10}}>
           <View style ={styles.buttonSet}>
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
                  color: "pink",
                  fontWeight: "bold",
                }}
                style={{
                  width: 30,
                  borderWidth:0,
                  backgroundColor:'black',
                  marginRight:10,
                }}
                dropDownContainerStyle={{
                  width: screenWidth * 0.38,
                  borderWidth:0,
                }}
              />
            </View>
            <TouchableOpacity style={{marginRight:10,}}>
              <FontAwesome5 name="tag" size={25} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={{marginRight:5,}}>
              <MaterialIcons name="attachment" size={30} color="black" />
            </TouchableOpacity>
           </View>
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
           <Text style={styles.title}>Date</Text>
         </View>
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
             todayBackgroundColor="#FF9999"
             selectedDayColor="#44CCFF"
             selectedDayTextColor="#000000"
             scaleFactor={375}
             textStyle={{
               fontFamily: 'serif',
               color: '#000000',
             }}
             width={screenWidth * 0.9}
             height={screenHeight*0.48}
             initialDate={selectedDate}
             onDateChange={onDateChange}
             customDatesStyles={customStyle}
           />
         </View>
         <View>
           <View style={styles.headCont}>
             <Text style={styles.title}>Set time:</Text>
           </View>
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
                  display="default"
                  onChange={onTimeSelected}
               />
            )}
          </View>
          <View>
            <View style={styles.headCont}>
              <Text style={styles.title}>Set Reminder:</Text>
            </View>
            <View style={{height:screenHeight*0.065, alignItems:'center'}}>
              <CheckReminder pressed={pressed} setPressed={setPressed}/>
            </View>
           </View>
           <View style ={styles.buttonSet}>
            <TouchableOpacity style ={styles.button} onPress={()=>{clear()}}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style ={[styles.button, {marginLeft:'30%'}]} onPress={() =>
              navigation.navigate(navScreen, { title: route.params.title, category: route.params.category,
                 mode: mode, index: index, contMode:route.params.mode,
                 task:{name:"", date:"", time: "", color:"", rem_date:""}})}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style ={styles.button} onPress={() =>
              navigation.navigate(navScreen, { title: route.params.title, category: route.params.category,
                 mode: mode, index: index, contMode:route.params.mode,
                 task:{name:task, date:new Date(selectedDate).toISOString(), time: time.toString(), color:value,
                   rem_date: new Date(new Date(selectedDate).valueOf() - 86400000 * pressed).toString().slice(0,15) } })}>
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
     color:'#130F85',
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
   addTask: {
     paddingHorizontal:10,
     justifyContent: 'space-around',
   },
   input: {
     paddingVertical: 10,
     paddingHorizontal: 15,
     backgroundColor:'#99bbff',
     borderRadius: 60,
     borderColor: '#C0C0C0',
     borderWidth: 1,
     marginTop:20,
   },
   textStyle: {
    margin: 10,
  },
  DatePick:{
    backgroundColor:'#ebf4bd',
    marginHorizontal:10,
    borderRadius: 20,
    padding:10,
    height: screenHeight*0.38,
  },
  timeDisplay:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'center',
    height:screenHeight*0.07,
  },
  timeBox:{
    borderWidth:3,
    paddingHorizontal: 5,
    margin:5,
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
    backgroundColor:'pink',
    margin:5,
    paddingHorizontal:5,
    borderRadius: 10,
  },
  buttonText:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'#130F85',
  },
 });
