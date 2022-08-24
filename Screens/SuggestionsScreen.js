import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image,
         ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import regression from 'regression';
import AppLoading from 'expo-app-loading';
import {extractUncompletedTasks, calcUserPerformance, editTask, loggedIn} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';
import Task from '../components/Task';
import Footer from '../components/Footer';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');

// timer function for rendering the page after waiting for the data fetching and anaysing the returned data.
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function SuggestionsScreen({ route, navigation }) {
  let data=[];
  let model;
  // loading state for rendering the components after the data is fetched and the calculations are done.
  const [loading, setLoading] = useState(true);
  // stores the list of the today's uncompleted tasks.
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  // stores the list of overdue tasks which belongs to the category of the second highest number of overdue tasks.
  const [overDueList, setOverDueList] = useState([]);
  // stores the list of overdue tasks which belongs to the category of the highest number of overdue tasks.
  const [pomodoroList, setPomodoroList] = useState([]);
  // list of the linear regression Xs which are the user's performance.
  const [moodX, setMoodX] = useState([]);
  // list of the linear regression Ys which are the user's recorded mood levels.
  const [moodY, setMoodY] = useState([]);

  useEffect(()=>{
    setLoading(true);
    // if the user navigated from the AddTask screen with the update mode after editing a specific task,
    // the editTask function is called passing the edited task, the task's id and the task's category.
    if(route.params != undefined){
      if(route.params.mode == "update" && route.params.task.date != ""){
        editTask(route.params.task, route.params.index, route.params.category, db);
      }
    }
  }, [route]);

  // setup function the does all the data fethcing and sets the different task lists with the returned data.
  const setup = () =>{
    // resets the lists.
    setUnCompTaskList([]);
    setOverDueList([]);
    setPomodoroList([])

    let performanceList= [];
    let catList= [];
    let compCount= [];
    let moodLevels = [];
    let fullObj ={};

    // extracts all the user's mood levels stored in the database.
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "SELECT * FROM mood WHERE user_id =?", [loggedIn[0].id],
          // loops through the result set and calls calcUserPerformance
          // to calculate the user's performance in the different dates when the different user's mood levels are recorded.
          (txObj, { rows: { _array } }) =>{
            _array.map((item, key)=>{
              fullObj = calcUserPerformance(new Date(item.date), performanceList, compCount, catList, false, db);
              // pushed the level of the extracted mood item to the moodLevels List.
              moodLevels.push(item.level);
            });
            // assigns the moodX list to the extracted list of user's performance.
            setMoodX(fullObj.performL);
            setMoodY(moodLevels);
          },
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error)
        );
    });

    // extracts the list of today's uncompleted tasks
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+new Date().toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
        [loggedIn[0].id],
        // assigns the ResultSet object to the unCompTaskList variable.
        (txObj, { rows: { _array } }) => setUnCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        )
    });
    /*
      * extracts the list of category ids of the overdue tasks grouped by their categories
        and it's sorted in a descending order by the count of tasks in each category,
        so the category_id of the highest count of overdue tasks will be the first element in the returned list.
    */
    db.transaction(tx => {
      tx.executeSql("SELECT category_id FROM tasks WHERE date<? AND state='uncompleted' AND user_id=? GROUP BY category_id ORDER BY COUNT(*) DESC",
        [new Date().toISOString().slice(0,10), loggedIn[0].id],
        (txObj, { rows: { _array } }) => {
          if(_array.length > 0){
            // loops through the returned list of category_ids and loops maximum at 2 of the categories.
            // then it extracts the list of overdue tasks whose category_id is that category id and it's not null.
            for(let i=0;i<Math.min(_array.length, 2);i++){
              if(_array[i].category_id != null){
                tx.executeSql("SELECT * FROM tasks WHERE date<? AND state='uncompleted' AND user_id=? AND category_id =?",
                  [new Date().toISOString().slice(0,10), loggedIn[0].id, _array[i].category_id],
                  (txObj, { rows: { _array } }) =>{
                    // assigns the tasks list of the category that has the highest number of overdue tasks to the pomodoro list.
                    if(i==0){
                      setPomodoroList(_array);
                    }else{
                      // assigns the tasks list of the category that has the second highest number of overdue tasks to the overdue list.
                      setOverDueList(_array);
                    }
                  },
                  (txObj, error) => console.log('Error ', error));
              }
            }
          }
        },
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        )
    });
  }

  // deleting the task from the tasks table by its id.
  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    // reloading the page after deleting the task to show the updated screen.
    setLoading(true);
  }
  // marks the task as completed by updating its state to the value completed.
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    // reloading the page after checking the task as completed to show the updated screen.
    setLoading(true);
  }

  /**
    function for training the linear regression model with the extracted dataset.
    the dataset's x value is the user performance,
    and the dataset's y value is the user's mood level at the same day when that performance is calculated.
  */
  const trainModel = () =>{
    moodY.map((item, key)=>{
      data.push( [moodX[key]/100, moodY[key]])
    })
    // train the linear regression with the training data.
    if(data.length > 0){
      model = regression.linear(data);
    }
  }

  // function for waiting until all the data is fetched and the data analysis is done.
  const finish = () =>{
    wait(200).then(() => {
      // set loading to false to render the screen after finishing all the needed processes.
      setLoading(false);
    });
  }

  // if the state is loading do all the data processes then the state will be changed after finishing the processes.
  if (loading) {
    return <AppLoading
           startAsync={()=> setup()}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  // rendering the screen if the loading state is false.
  else{
    return(
      <View style={styles.container}>
        {
          trainModel()
        }
        {/* Motivating the user by showing the difference of the predicted mood level before and after finishing the tasks */}
        <ScrollView style={{maxHeight:'95%'}}>
          {
            unCompTaskList.length >0 &&
              <View style={styles.taskCont}>
                <Text style={styles.taskTitle}> Finish those and elevate your mood 📈</Text>
                {
                  data.length > 0 &&
                  <Text style={styles.taskTitle}> from {Math.round(model.predict(0)[1])} to {Math.round(model.predict(1)[1])}</Text>
                }
                {
                  unCompTaskList?.map((item, ind)=>{
                    return(
                      <Task task={item} key={ind} index={ind} nav={navigation} title={'SuggestionsScreen'} navTitle={'Suggestions'}
                        selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                    )
                  })
                }
              </View>
          }
          {/* Shows the today's predicted mood level even if there are no uncompleted tasks for today */}
          {
            unCompTaskList.length ==0 && data.length > 0 &&
              <View style={styles.taskCont}>
                <Text style={styles.taskTitle}> Today's expected mood is {Math.round(model.predict(1)[1])}</Text>
              </View>
          }
          {/* Letting user to know that there's no enough data to predict the mood level as there's no training data for the regression model */}
          {
            unCompTaskList.length ==0 && data.length == 0 &&
              <View style={styles.taskCont}>
                <Text style={styles.taskTitle}> No enough data to expect the today's mood</Text>
                <Text> Please, help us help you by letting us know your everyday mood level</Text>
              </View>
          }
          {/*
              * the container of overdue tasks whose category is the category of highest number of overdue tasks
              * Motivating the users to follow the pomodoro technique to increase the intrinsic motivation towards this category.
          */}
          {
            pomodoroList.length >0 &&
            <View style={[styles.taskCont, {backgroundColor:"#A7E0A7"}]}>
              <Text style={styles.taskTitle}> Spend just 15 mins on: </Text>
              {
                pomodoroList?.map((item, ind)=>{
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Suggestions'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                })
              }
            </View>
          }
          {/* the container of overdue tasks whose category is the category of the second highest number of overdue tasks */}
          {
            overDueList.length >0 &&
            <View style={[styles.taskCont, {backgroundColor:"#C7E3E3"}]}>
              <Text style={styles.taskTitle}> Finish those to be more Satisfied</Text>
              {
                overDueList?.map((item, ind)=>{
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'SuggestionsScreen'} navTitle={'Suggestions'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                })
              }
            </View>
          }
          {/* Showing motivational and celebrational statement if there are no uncompleted or overdue tasks */}
          {
            pomodoroList.length == 0 && overDueList.length == 0 && unCompTaskList.length == 0 &&
            <View style={styles.taskCont}>
              <Text> You are doing great 🎊 , Keep up the hard work! 💪</Text>
            </View>
          }
        </ScrollView>
        {/* Adding the footer component with passing the navigation object as a prop */}
        <Footer nav={navigation}/>
        <StatusBar barStyle="light-content" backgroundColor= '#f4f6fc' />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
    justifyContent: 'center',
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 15,
    color:'black'
  },
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#E0F5B6',
    padding:10,
  },
});
