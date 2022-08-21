import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, SafeAreaView, Button,
         KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, ScrollView, Platform } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import { useFonts, Skranji_700Bold } from '@expo-google-fonts/skranji';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import Footer from './components/Footer';
import {openDatabase} from './components/OpenDatabase';
import {addTask, editTask, loggedIn, extractLoggedInUser} from './components/database';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {schedulePushNotification, registerForPushNotificationsAsync} from './components/Notifications'
import Task from './components/Task';
import Constants from "expo-constants";

const db = openDatabase('db.TodoDB');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
  handleSuccess: notificationIdentifier => {
    // dismiss notification immediately after it is presented
    //setTimeout(() => Notifications.dismissNotificationAsync(notificationIdentifier), 100);
  },
});

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function HomeScreen({ route, navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notificationList, setNotificationList] = useState([]);
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  const [compTaskList, setCompTaskList] = useState([]);
  const [overDueList, setOverDueList] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    setLoading(true);
    if(route.params != undefined){
      if(route.params.mode == "add" && route.params.task.date != ""){
        setSelectedDate(new Date(route.params.task.date))
        addTask(loggedIn[0].id, route.params.task, route.params.category, db);
        extractTasks(new Date(route.params.task.date));
      }
      if(route.params.mode == "update" && route.params.task.date != ""){
        setSelectedDate(new Date(route.params.task.date))
        editTask(route.params.task, route.params.index, route.params.category, db);
        extractTasks(new Date(route.params.task.date));
      }
    }
  }, [route]);

  const setup = () =>{
    extractTasks(selectedDate);
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE reminder_date=? AND state='uncompleted' AND user_id = ?",
        [new Date().toString().slice(0,15), loggedIn[0].id], // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setNotificationList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    });

    if (Platform.OS != "web") {
      Notifications.setNotificationCategoryAsync("actions", [
        { buttonTitle: "OK 🆗", identifier: "OK" },
        { buttonTitle: "Mark ✔", identifier: "Mark" },
      ])
      .then((_category) => {})
      .catch((error) => console.log('Could not have set notification category', error));

      notificationList?.map((item)=>{
        schedulePushNotification(item);
      })

      registerForPushNotificationsAsync().then(token => setExpoPushToken(token))
      .catch(function(error) {
        //console.log('There has been a problem with the push notification operation: ' + error.message);
      });

      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        //console.log(response);
        if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          Notifications.dismissNotificationAsync(response.notification.request.identifier);
        }
        if(response.actionIdentifier == 'Mark'){
          completeTask(response.notification.request.content.data.id);
          setSelectedDate(new Date(response.notification.request.content.data.date));
        }
      });
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }

  const extractTasks = (date)=>{
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+date.toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
        [loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setUnCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE user_id=? AND date LIKE '%"+date.toISOString().slice(0,10)+"%' AND state='completed'",
        [loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })

    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date<? AND state='uncompleted' AND user_id=?",
        [new Date().toISOString().slice(0,10), loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setOverDueList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
  }

  //function to handle the date change
  const onDateSelected = (date) => {
   const currentDate = date || selectedDate;
   setSelectedDate(currentDate);
   extractTasks(currentDate);
  };

  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    extractTasks(selectedDate);
  }
  // marks the task as completed
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    extractTasks(selectedDate);
  }
  // un mark the task to be uncompleted.
  const unCompleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['uncompleted', id]
      );
    });
    extractTasks(selectedDate);
  }

  // loading Skranji_700Bold font to be used with the headers.
  let [fontsLoaded] = useFonts({
    Skranji_700Bold,
  });

  const finish = () =>{
    wait(200).then(() => {
      setup();
      setLoading(false);
    });
  }
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
  else{
    return(
      <View style={styles.container}>
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
        <ScrollView style={{maxHeight:'73%', marginTop:'2%'}}>
          <View style={styles.taskCont}>
            <Text style={styles.taskTitle}> Uncompleted</Text>
            {
              unCompTaskList?.map((item, ind)=>{
                if(item.date.slice(0,10)!= new Date().toISOString().slice(0,10) || item.time.slice(16,21) >= new Date().toString().slice(16,21)){
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Home'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                }
              })
            }
          </View>
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
        <Footer nav={navigation}/>
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
    bottom:70,
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
