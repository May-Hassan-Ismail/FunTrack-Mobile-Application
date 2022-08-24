import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image,
         ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import Task from '../components/Task';
import Footer from '../components/Footer';
import CheckDay from '../components/CheckDay';
import {addTask, editTask, loggedIn, extractLoggedInUser, addMoodStatus} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');

export function TaskScreen({ route, navigation }) {
  // holds the list of uncompleted tasks of a specific category.
  const [taskItems, setTaskItems]= useState([]);
  // holds the list of completed tasks of a specific category.
  const [completedTasks, setCompletedTasks]= useState([]);
  // state for handling user selection of his/her mood state in the day.
  const [pressed, setPressed]= useState(0);

  const retrieveData= ()=>{
    extractLoggedInUser(db);
    // checks if the screen is for listing the tasks of a specific category.
    if(route.params.category != null){
      // selecting the list of tasks of the passed category, which state is uncompleted and which belongs to the logged in user.
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE state='uncompleted' AND category_id=? AND user_id=?",
          [route.params.category, loggedIn[0].id],
          // the result object is assigned to the taskItems list.
          (txObj, { rows: { _array } }) => setTaskItems(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
      // selecting the list of tasks of the passed category, which state is completed and which belongs to the logged in user.
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE state='completed' AND category_id=? AND user_id=?",
          [route.params.category, loggedIn[0].id],
          // the result object is assigned to the completedTasks List.
          (txObj, { rows: { _array } }) => setCompletedTasks(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
    }
    // checks if the screen is for listing the today's tasks.
    else if(route.params.title == 'Today'){
      // selecting the list of tasks which state is uncompleted, date is today and which belongs to the logged in user.
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
          [loggedIn[0].id],
          // the result object is assigned to the taskItems list.
          (txObj, { rows: { _array } }) => setTaskItems(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
      // selecting the list of tasks which state is completed, date is today and which belongs to the logged in user.
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='completed' AND user_id=?",
          [loggedIn[0].id],
          // the result object is assigned to the completedTasks List.
          (txObj, { rows: { _array } }) => setCompletedTasks(_array),
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error))
      })
    }
  }

  useEffect(() => {
    let isMounted = true;
    // calls the function which extracts the tasks' lists to be displayed.
    retrieveData();
    // checks if the passed mode in the parameters is add, then the addTask function will be called.
    if(route.params.mode == "add"){
      // calls the add task function to add the task to the tasks table
      addTask(loggedIn[0].id, route.params.task, route.params.category, db);
      // extract the tasks lists after the task is added to the database.
      retrieveData();
    }
    // checks if the passed mode in the parameters is update, then the editTask function will be called.
    if(route.params.mode == "update"){
      // calls the edit task function to edit the task in the tasks table
      editTask(route.params.task, route.params.index, route.params.category, db);
      // extract the tasks lists after the task is edited to show the user the updated screen.
      retrieveData();
    }
    return () => { isMounted = false };
  }, [route]);

  // deleting the task from the tasks table by its id.
  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    // extract the tasks lists after the task is deleted to show the user the updated screen.
    retrieveData();
  }

  // marks the task as completed by updating its state to be completed.
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    // extract the tasks lists after the task is marked as completed to show the user the updated screen.
    retrieveData();
  }
  // marks the task as uncompleted by updating its state to be uncompleted.
  const unCompleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['uncompleted', id]
      );
    });
    // extract the tasks lists after the task is marked as uncompleted to show the user the updated screen.
    retrieveData();
  }

  const taskContainer = () =>{
    return(
      <ScrollView style={{maxHeight:'90%'}}>
        <View style={styles.taskCont}>
          {/* The title will be the today's date only if it's the today's tasksList screen */}
          {route.params.title == "Today" &&
            <Text style={styles.taskTitle}> {new Date().toString().slice(0, 15)}</Text>
          }
          {route.params.title != "Today" &&
            <Text style={styles.taskTitle}> Uncompleted</Text>
          }
          {/* The container of the uncompleted tasks */}
          {
            taskItems?.map((item, ind)=>{
              return(
                <Task task={item} key={ind} index={ind} nav={navigation} title={route.params.title} navTitle={'List'}
                  selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
              )
            })
          }
        </View>
        {/* The container of the completed tasks */}
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
        {/* The CheckDay container appears only in the today's TasksList screen with all the required props passed */}
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
          {/* If there are any tasks, the taskContainer component will be displayed */}
          { (taskItems.length >0 || completedTasks.length >0) && taskContainer()}
          {/* If no tasks exists in both categories, different components will be displayed */}
          { (taskItems.length ==0 && completedTasks.length ==0) &&
              <View style={styles.noTaskCont}>
                <Image source={require('../assets/checklist.png')} style={{width:'30%', height:'30%', margin:10}} />
                <Text>It seems You have a free day.</Text>
                <Text style={{color:'grey'}}>No tasks, Relax and recharge.</Text>
              </View>
          }
        </View>
        {/* The add task button that navigates to the addTask screen passing the page title anf the navTitle props */}
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
