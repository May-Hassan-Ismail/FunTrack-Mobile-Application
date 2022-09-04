import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import { useFonts, Skranji_700Bold } from '@expo-google-fonts/skranji';
import { FontAwesome5 } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import * as Notifications from 'expo-notifications';
import Footer from '../components/Footer';
import {openDatabase} from '../components/OpenDatabase';
import {addTask, editTask, loggedIn, extractLoggedInUser} from '../components/database';
import {schedulePushNotification, registerForPushNotificationsAsync} from '../components/Notifications'
import Task from '../components/Task';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');
// getting the time zone offset for handling the time zone according to user's location.
const offset = new Date().getTimezoneOffset()

// enavling notification alert and sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// timer function for rendering the page after waiting for the data to be returned from the database.
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function HomeScreen({ route, navigation }) {
  // holds the date selected from the horizontal calendar.
  const [selectedDate, setSelectedDate] = useState(new Date());
  // holds the list of uncompleted tasks in the selected date.
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  // holds the list of completed tasks in the selected date.
  const [compTaskList, setCompTaskList] = useState([]);
  // holds the list of overdue tasks until the selected date.
  const [overDueList, setOverDueList] = useState([]);
  // saves the token for pushing new notifications to the user.
  const [expoPushToken, setExpoPushToken] = useState('');
  // holds the fired notification.
  const [notification, setNotification] = useState(false);
  // loading state for waiting until the data is extracted from the database then it became false.
  const [loading, setLoading] = useState(true);
  // userRef for persisting the notification listener value between renders.
  const notificationListener = useRef();
  // userRef for persisting the response listener value between renders.
  const responseListener = useRef();

  useEffect(() => {
    // resets the lists.
    setCompTaskList([]);
    setUnCompTaskList([]);
    setOverDueList([]);
    setSelectedDate(new Date());
    // start with the loading state being true until data is extracted from the database.
    setLoading(true);
    if(route.params != undefined){
      if(route.params.mode == "add" && route.params.task.date != ""){
        // selecting the task's date from the horizontal calendar to show the added task.
        setSelectedDate(new Date(route.params.task.date))
        // calls the add task function to add the task to the tasks table
        addTask(loggedIn[0].id, route.params.task, route.params.category, db);
        // extract the tasks of the different categories after the date is changed and the task is added to the database.
        extractTasks(new Date(route.params.task.date));
      }
      if(route.params.mode == "update" && route.params.task.date != ""){
        // selecting the task's date from the horizontal calendar to show the edited task.
        setSelectedDate(new Date(route.params.task.date))
        // calls the edit task function to edit the task in the tasks table
        editTask(route.params.task, route.params.index, route.params.category, db);
        // extract the tasks of the different categories after the date is changed and the task is edited.
        extractTasks(new Date(route.params.task.date));
      }
    }
  }, [route]);

  const setup = () =>{
    let isMounted = true;
    // extract the tasks of the different categories with the selected date.
    extractTasks(selectedDate);
    // This listener is fired whenever a notification is received while the app is foregrounded
    if (isMounted){
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
    }

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // the notification is dismissed if the user clicks on the notification or any of its buttons.
      if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER || response.actionIdentifier == 'OK') {
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
      }
      // if the user clicks on the Mark button, the referred task will be marked as completed.
      // Also the selected date will be the date of that task to show the task after being marked to the user.
      if(response.actionIdentifier == 'Mark'){
        completeTask(response.notification.request.content.data.id);
        Notifications.dismissNotificationAsync(response.notification.request.identifier);
        setSelectedDate(new Date(response.notification.request.content.data.date));
      }
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      isMounted = false;
    };
  }

 /*
    * function extracts the uncompleted, completed and overdue tasks for some specific date.
    * params: data (which is the date that the tasks are filtered with)
 */
  const extractTasks = (date)=>{

    db.transaction(tx => {
      // selecting the list of tasks of the entered date which state is uncompleted and which belongs to the logged in user.
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+date.toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
        [loggedIn[0].id],
        // the result object is assigned to the unCompTaskList.
        (txObj, { rows: { _array } }) => setUnCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
    db.transaction(tx => {
      // selecting the list of tasks of the entered date which state is completed and which belongs to the logged in user.
      tx.executeSql("SELECT * FROM tasks WHERE user_id=? AND date LIKE '%"+date.toISOString().slice(0,10)+"%' AND state='completed'",
        [loggedIn[0].id],
        // the result object is assigned to the compTaskList.
        (txObj, { rows: { _array } }) => setCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })

    db.transaction(tx => {
      // selecting the list of tasks which dates are less than the selected date (overDue) and which belongs to the loggedin user.
      tx.executeSql("SELECT * FROM tasks WHERE date<? AND state='uncompleted' AND user_id=?",
        [new Date(new Date().getTime() - (offset*60*1000)).toISOString().slice(0,10), loggedIn[0].id],
        // the result object is assigned to the overDueList.
        (txObj, { rows: { _array } }) => setOverDueList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
  }

  //function to handle the date change and it takes the newly selected date as an input.
  const onDateSelected = (date) => {
   const currentDate = date || selectedDate;
   setSelectedDate(currentDate);
   // calling the extract task function with the selected date as the input to update the screen after changing the date.
   extractTasks(currentDate);
  };

  // deleting the task from the tasks table by its id.
  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    // calling the extract task function with the selected date to update the screen after deleting the task.
    extractTasks(selectedDate);
  }
  // marks the task as completed by updating its state to the value completed and it takes the task id as an input.
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    // calling the extract task function with the selected date to update the screen after marking the task as completed.
    extractTasks(selectedDate);
  }
  // marks the task as uncompleted by updating its state to the value uncompleted and it takes the task id as an input.
  const unCompleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['uncompleted', id]
      );
    });
    // calling the extract task function with the selected date to update the screen after marking the task as uncompleted.
    extractTasks(selectedDate);
  }

  // loading Skranji_700Bold font to be used with the headers.
  let [fontsLoaded] = useFonts({
    Skranji_700Bold,
  });

  // function for waiting until the logged in user is extracted from the database then setup function is called.
  const finish = () =>{
    wait(200).then(() => {
      // call setup to do all the data fetching for the logged in user to display his/her data.
      setup();
      // set loading to false to render the screen after finishing all the needed processes.
      setLoading(false);
    });
  }
  // if the state is loading do all the processes then the state will be changed after finishing.
  if (loading) {
    return <AppLoading
           startAsync={()=> extractLoggedInUser(db)}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  // shows loading icon if font isn't loaded.
  else if (!fontsLoaded) {
    return <AppLoading />;
  }
  // rendering the screen if the loading state is false.
  else{
    return(
      <View style={styles.container}>
        {/* The horizontal calendar component */}
        <CalendarStrip
          scrollable
          style={{height:100, paddingTop: 20, paddingBottom: 10}}
          selectedDate={selectedDate}
          calendarColor={'white'}
          calendarHeaderStyle={{color: 'black'}}
          dateNumberStyle={{color: 'black'}}
          dateNameStyle={{color: 'black'}}
          daySelectionAnimation={{
              type: 'border',
              duration: 200,
              borderWidth: 1,
              borderHighlightColor: 'white',
            }}
          highlightDateContainerStyle={
            {backgroundColor:'#206B6B', color: 'white'}
          }
          highlightDateNumberStyle={{
            color: 'white',
          }}
          highlightDateNameStyle={{
            color: 'white',
          }}
          iconContainer={{flex: 0.1}}
          onDateSelected={onDateSelected}
        />
        <ScrollView style={{maxHeight:'66%', marginTop:'2%'}}>
        {/* The container of the uncompleted tasks */}
        {/* if the uncompleted task is for today and its time is before the current time, it's an overdue not uncompleted task */}
          <View style={styles.taskCont}>
            <Text style={styles.taskTitle}> Uncompleted</Text>
            {
              unCompTaskList?.map((item, ind)=>{
                if(new Date(item.date).toString().slice(0,15)!= new Date().toString().slice(0,15) || item.time.slice(16,21) >= new Date().toString().slice(16,21)){
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Home'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                }
              })
            }
          </View>
          {/* The overdue container appears only if the selected date is today */}
          { new Date(selectedDate).toString().slice(0,16) == (new Date()).toString().slice(0,16) &&
            <View style={ [styles.taskCont,{backgroundColor:"#FFBEBE"}]}>
              <Text style={styles.taskTitle}> Overdue</Text>
              {
                overDueList?.map((item, ind)=>{
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Home'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                })
              }
              {/* if there is an uncompleted task but its time is less than the current time, it will also be displayed in the overdue container */}
              {
                unCompTaskList?.map((item, ind)=>{
                  if(item.time.slice(16,21) < new Date().toString().slice(16,21)){
                    return(
                      <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Home'}
                        selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                    )
                  }
                })
              }
            </View>
          }
          {/* The container of the completed tasks */}
          <View style={styles.compTaskCont}>
            <Text style={styles.taskTitle}> Completed</Text>
            {
              compTaskList?.map((item, ind)=>{
                return(
                  <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Home'}
                    selected={true} mode="completed" delFun={deleteTask} compFun={unCompleteTask}/>
                )
              })
            }
          </View>
        </ScrollView>
        {/* The add task button that navigates to the addTask screen passing the page title anf the navTitle props */}
        <View
            style ={styles.addTask}
        >
          <TouchableOpacity
            style ={styles.addTaskButton}
            onPress={() =>
              navigation.navigate('AddTask', {navTitle: 'Home', title: "HomeScreen", date: selectedDate.toString(), task:""})}
          >
            <FontAwesome5
              name="plus"
              size={30}
              style={{color:'#fff'}}
            />
          </TouchableOpacity>
        </View>
        {/* Adding the footer component with passing the navigation object as a prop */}
        <Footer nav={navigation}/>
        <StatusBar barStyle="light-content" backgroundColor= '#f4f6fc' />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  addTask: {
    position:'absolute',
    bottom:60,
    width:'100%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'flex-end',
    padding:20,
    paddingHorizontal:30,
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
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'black'
  },
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#E0F5B6',
    padding:10,
  },
  compTaskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#90C2C2',
    padding:10,
    opacity: 0.6,
  },
});
