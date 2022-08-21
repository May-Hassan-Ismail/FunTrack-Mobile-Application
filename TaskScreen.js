import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image,
         ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import Task from './components/Task';
import Footer from './components/Footer';
import CheckDay from './components/CheckDay';
import {extractTasksByCatOrTitle, addTask, editTask, loggedIn, extractLoggedInUser, addMoodStatus} from './components/database';
import {openDatabase} from './components/OpenDatabase';

const db = openDatabase('db.TodoDB');

export function TaskScreen({ route, navigation }) {
  // stores the task name.
  const [taskItems, setTaskItems]= useState([]);
  const [completedTasks, setCompletedTasks]= useState([]);
  const [pressed, setPressed]= useState(0);

  const retrieveData= ()=>{
    /*
    let unCompTasksList = [];
    let compTasksList = [];
    let fullTasks = extractTasksByCatOrTitle(unCompTasksList, compTasksList, route.params.category, route.params.title);
    setTaskItems(fullTasks.unCompL);
    setCompletedTasks(fullTasks.compL);
    */
    extractLoggedInUser(db);
    if(route.params.category != null){
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE state='uncompleted' AND category_id=? AND user_id=?",
          [route.params.category, loggedIn[0].id],
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) => setTaskItems(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE state='completed' AND category_id=? AND user_id=?",
          [route.params.category, loggedIn[0].id],
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) => setCompletedTasks(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
    }
    else if(route.params.title == 'Today'){
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
          [loggedIn[0].id],
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) => setTaskItems(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })

      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='completed' AND user_id=?",
          [loggedIn[0].id],
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) => setCompletedTasks(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
    }
  }

  useEffect(() => {
    let isMounted = true;
    retrieveData();

    if(route.params.mode == "add"){
      addTask(loggedIn[0].id, route.params.task, route.params.category, db);
      retrieveData();
    }
    if(route.params.mode == "update"){
      editTask(route.params.task, route.params.index, route.params.category, db);
      retrieveData();
    }
    return () => { isMounted = false };
  }, [route]);

  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    retrieveData();
  }

  // marks the task as completed
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    retrieveData();
  }
  // un mark the task to be uncompleted.
  const unCompleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['uncompleted', id]
      );
    });
    retrieveData();
  }

  const taskContainer = () =>{
    return(
      <ScrollView style={{maxHeight:'90%'}}>
        <View style={styles.taskCont}>
          {route.params.title == "Today" &&
            <Text style={styles.taskTitle}> {new Date().toString().slice(0, 15)}</Text>
          }
          {route.params.title != "Today" &&
            <Text style={styles.taskTitle}> Uncompleted</Text>
          }
          {
            taskItems?.map((item, ind)=>{
              return(
                <Task task={item} key={ind} index={ind} nav={navigation} title={route.params.title} navTitle={'List'}
                  selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
              )
            })
          }
        </View>
        <View style={styles.compTaskCont}>
          <Text style={styles.taskTitle}> Completed</Text>
          {
            completedTasks?.map((item, ind)=>{
              return(
                <Task task={item} key={ind} index={ind} nav={navigation} title={route.params.title} navTitle={'List'}
                  selected={true} mode="completed" delFun={deleteTask} compFun={unCompleteTask}/>
              )
            })
          }
        </View>
        {route.params.title == "Today" &&
          <CheckDay pressed={pressed} setPressed={setPressed} addMoodStatus={addMoodStatus}
            date={new Date().toISOString().slice(0,10)} user_id = {loggedIn[0].id} db={db}
          />
        }
      </ScrollView>
    );
  }
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeView}>
        <View style={styles.listCont}>
          <View style={styles.headCont}>
            <MaterialCommunityIcons
              name="text"
              size={30}
              style={{color:'black', marginRight: 10}}
            />
            <Text style={styles.title}>{route.params.title}</Text>
          </View>
          { (taskItems.length >0 || completedTasks.length >0) && taskContainer()}
          { (taskItems.length ==0 && completedTasks.length ==0) &&
              <View style={styles.noTaskCont}>
                <Image source={require('./assets/checklist.png')} style={{width:'30%', height:'30%', margin:10}} />
                <Text>It seems You have a free day.</Text>
                <Text style={{color:'grey'}}>No tasks, Relax and recharge.</Text>
              </View>
          }
        </View>
        <View
            style ={styles.addTask}
        >
          <TouchableOpacity
            style ={styles.addTaskButton}
            onPress={() =>
              navigation.navigate('AddTask', {navTitle: 'List',title: route.params.title, date:"", category: route.params.category, task:""})}
          >
            <FontAwesome5
              name="plus"
              size={30}
              style={{color:'#fff'}}
            />
          </TouchableOpacity>
          <StatusBar style="auto" />
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
  listCont: {
    paddingTop:20,
    paddingHorizontal:20,
  },
  headCont:{
    flexDirection:'row',
    alignItems:'center',
  },
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#E0F5B6',
    padding:10,
  },
  noTaskCont:{
    alignItems:'center',
    justifyContent: 'center',
    height:"70%",
  },
  compTaskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#90C2C2',
    padding:10,
    opacity: 0.6,
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
  title:{
    fontFamily: "Skranji_700Bold",
    fontSize: 35,
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'black'
  },
});
